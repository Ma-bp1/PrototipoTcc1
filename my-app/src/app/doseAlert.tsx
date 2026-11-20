import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Vibration,
  StyleSheet,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';
import { getAlertSettings } from '../services/alertSettings';
import type { MedData } from '../schemas/medSchema';
import { useDoseActions } from '../hooks/useDoseActions';
import { cancelMedication } from '../notifications/scheduler';

const SNOOZE_MINUTES = 5;
const MAX_AUTO_SNOOZES = 3; // nº de adiamentos automáticos antes de marcar como perdida
const AUTO_TIMEOUT_MS = 120_000; // 2 min sem resposta
const KEEP_AWAKE_TAG = 'dose-alert';
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Documento do Firestore = MedData (mesmo schema do AddMed)
type StoredMed = MedData;

const noop = () => {};

function formatRepeat(rep: MedData['medRepetitions']) {
  switch (rep.type) {
    case 'diario':
      return 'Todos os dias';
    case 'semanal': {
      if (rep.daysOfWeek.length === 7) return 'Todos os dias';
      const days = [...rep.daysOfWeek].sort((a, b) => a - b);
      return `Semanal: ${days.map((d) => WEEKDAYS[d]).join(', ')}`;
    }
    case 'horario':
      return rep.intervalHours === 1
        ? 'A cada hora'
        : `A cada ${rep.intervalHours} horas`;
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function leave() {
  // Se a tela abriu direto pela notificação (app fechado), não há para onde voltar
  if (router.canGoBack()) router.back();
  else router.replace('/home');
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatHHmm(ms: number) {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Ocorrência mais recente de "HH:mm" (hoje, ou ontem se ainda não chegou)
function lastOccurrence(time?: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  if (!match) return Date.now();
  const d = new Date();
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (d.getTime() > Date.now() + 60_000) d.setDate(d.getDate() - 1);
  return d.getTime();
}

// Não deixa a tela presa se o Firestore estiver sem conexão
function withTimeout<T>(p: Promise<T>, ms = 3000) {
  return Promise.race([p, new Promise<void>((resolve) => setTimeout(resolve, ms))]);
}

export default function DoseAlert() {
  // notificação normal traz `time` ("15:30"); a de adiamento traz `doseMs`
  const { medId, time, doseMs: doseMsParam } = useLocalSearchParams<{
    medId: string;
    time?: string;
    doseMs?: string;
  }>();
  const insets = useSafeAreaInsets();

  const [med, setMed] = useState<StoredMed | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [askingSkip, setAskingSkip] = useState(false);
  const [naoExiste, setNaoExiste] = useState(false);

  // busyRef bloqueia toque duplo (setBusy é assíncrono); leftRef evita leave() duplicado
  const busyRef = useRef(false);
  const leftRef = useRef(false);

  const leaveOnce = useCallback(() => {
    if (leftRef.current) return;
    leftRef.current = true;
    leave();
  }, []);

  const medList = useMemo(
    () => (med && medId ? [{ ...med, id: medId }] : []),
    [med, medId],
  );

  const { confirmarDose, adiarDose, marcarPerdida } = useDoseActions(medList, noop);

  // Carregamento do medicamento
  useEffect(() => {
    leftRef.current = false;
    busyRef.current = false;
    setBusy(false);
    setMed(null);
    setNaoExiste(false);
    setLoadError(false);

    if (!medId) {
      setLoadError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Em cold start o Firebase ainda está restaurando a sessão:
        // currentUser pode ser null nos primeiros instantes.
        await auth.authStateReady();
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Sem usuário autenticado');

        const snap = await getDoc(doc(db, 'users', userId, 'medications', medId));
        if (cancelled) return;

        if (snap.exists()) setMed(snap.data() as StoredMed);
        else setNaoExiste(true);
      } catch (e) {
        console.warn('Falha ao carregar medicamento', e);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [medId, reloadKey]);

  // Horário agendado da dose (é o que a home guarda em medLastConfirmed)
  const doseMs = useMemo(
    () => (doseMsParam ? Number(doseMsParam) : lastOccurrence(time ?? med?.medTime)),
    [doseMsParam, time, med?.medTime],
  );

  // Já confirmada pela home? (medLastConfirmed guarda o horário agendado da dose)
  const jaConfirmada = !!med?.medLastConfirmed && Number(med.medLastConfirmed) >= doseMs;

  // Já marcada como perdida/não administrada?
  const jaPerdida = !!med?.medLastMissed && Number(med.medLastMissed) >= doseMs;

  // Já adiada pela home e o adiamento ainda não venceu?
  // (se veio doseMsParam, é a notificação do próprio adiamento → deve aparecer)
  const adiadaAindaValida =
    !doseMsParam &&
    !!med?.medSnoozedUntil && // ← confirme que é o campo que o snoozeDoseInDb grava
    Number(med.medSnoozedUntil) > Date.now();

  const jaTratada = jaConfirmada || adiadaAindaValida || jaPerdida || naoExiste;
  const ativa = !loading && !loadError && !jaTratada;

  useEffect(() => {
    if (!loading && jaTratada) leaveOnce();
  }, [loading, jaTratada, leaveOnce]);

  // Remédio removido: apaga as notificações dele (a saída da tela já é feita acima)
  useEffect(() => {
    if (!naoExiste || !medId) return;
    (async () => {
      try {
        await cancelMedication(medId);
      } catch (e) {
        console.warn('Falha ao cancelar notificações', e);
      }
    })();
  }, [naoExiste, medId]);

  // Botão/gesto de voltar não pode descartar o alerta sem resposta
  useEffect(() => {
    if (loadError) return; // no erro de carregamento o usuário pode fechar
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [loadError]);

  // Mantém a tela acesa enquanto o alerta está ativo (o timer de 2 min depende disso)
  useEffect(() => {
    if (!ativa) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [ativa]);

  // Vibração
  useEffect(() => {
    if (!ativa) return;
    let active = true;
    getAlertSettings()
      .catch(() => ({ vibration: true })) // se falhar, vibra por padrão
      .then(({ vibration }) => {
        if (active && vibration) Vibration.vibrate([0, 500, 300, 500], true);
      });
    return () => {
      active = false;
      Vibration.cancel();
    };
  }, [ativa]);

  // Executa uma ação de dose com proteção contra toque duplo e falhas
  const run = async (action: () => Promise<unknown>, opts?: { silent?: boolean }) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await withTimeout(action());
      leaveOnce();
    } catch (e) {
      console.warn('Falha ao registrar dose', e);
      busyRef.current = false;
      setBusy(false);
      if (!opts?.silent) {
        Alert.alert('Erro', 'Não foi possível registrar. Tente novamente.');
      }
    }
  };

  const handleConfirm = () => {
    if (!medId) return;
    run(() => confirmarDose(medId, doseMs));
  };

  const handleSnooze = () => {
    if (!medId) return;
    run(() => adiarDose(medId, doseMs, SNOOZE_MINUTES)); // manual → zera contador
  };

  const handleSkip = () => {
    if (!medId || busyRef.current) return;
    setAskingSkip(true); // pausa o timer automático enquanto o alerta está aberto

    Alert.alert(
      'Dose não administrada',
      'Deseja registrar que esta dose não foi tomada?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setAskingSkip(false) },
        {
          text: 'Registrar',
          style: 'destructive',
          onPress: () => {
            setAskingSkip(false);
            run(() => marcarPerdida(medId, doseMs));
          },
        },
      ],
      { cancelable: true, onDismiss: () => setAskingSkip(false) },
    );
  };

  const handleAutoTimeout = () => {
    if (!medId || !med) return;

    const anterior = med.medAutoSnooze?.doseMs === doseMs ? med.medAutoSnooze.count : 0;
    const count = anterior + 1;

    return run(
      () =>
        count > MAX_AUTO_SNOOZES
          ? marcarPerdida(medId, doseMs)
          : adiarDose(medId, doseMs, SNOOZE_MINUTES, { doseMs, count }),
      { silent: true },
    );
  };

  // Sempre chama a versão mais recente do handler (evita closure velha no timer)
  const autoTimeoutRef = useRef(handleAutoTimeout);
  autoTimeoutRef.current = handleAutoTimeout;

  useEffect(() => {
    if (!ativa || busy || askingSkip) return;
    const t = setTimeout(() => autoTimeoutRef.current(), AUTO_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [ativa, busy, askingSkip, med]);

  const slotNumber = (slot: string) => slot.replace(/\D/g, '');

  const displayTime = doseMsParam
    ? formatHHmm(Number(doseMsParam))
    : time ?? med?.medTime ?? '--:--';
  const repeatLabel = med ? formatRepeat(med.medRepetitions) : null;
  const consumption = med?.medStockConsumption;

  return (
    <LinearGradient
      colors={['#0F4A4A', '#1B8585']}
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar style="light" />

      <Text style={styles.header}>Lembrete de Administração{'\n'}de Medicamentos</Text>

      <View style={styles.center}>
        {loading || jaTratada ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : loadError ? (
          <>
            <Text style={styles.errorTitle}>Não foi possível carregar o medicamento</Text>
            <Text style={styles.errorText}>
              Verifique sua conexão e tente novamente.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.medName} adjustsFontSizeToFit numberOfLines={1}>
              {med?.medName ?? 'Medicamento'}
            </Text>

            {!!med?.medDesc && <Text style={styles.description}>{med.medDesc}</Text>}

            <Text style={styles.time}>{displayTime}</Text>

            {med && (
              <View style={styles.infoCard}>
                {!!consumption && (
                  <InfoRow
                    label="Quantidade"
                    value={`${consumption} ${consumption === 1 ? 'unidade' : 'unidades'}`}
                  />
                )}
                {!!med.medAdminRoute && <InfoRow label="Via" value={med.medAdminRoute} />}
                {!!med.medSlot && (
                  <InfoRow label="Compartimento" value={`Compartimento ${slotNumber(med.medSlot)}`} />
                )}
                {!!repeatLabel && <InfoRow label="Repetição" value={repeatLabel} />}
              </View>
            )}
          </>
        )}
      </View>

      {loadError ? (
        <View style={styles.actions}>
          <Pressable
            onPress={() => setReloadKey((k) => k + 1)}
            style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}
          >
            <Text style={styles.confirmText}>Tentar novamente</Text>
          </Pressable>

          <Pressable
            onPress={leaveOnce}
            style={({ pressed }) => [styles.button, styles.skip, pressed && styles.pressed]}
          >
            <Text style={styles.skipText}>Fechar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            onPress={handleConfirm}
            disabled={busy || !ativa}
            style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}
          >
            <Text style={styles.confirmText}>Confirmar dose</Text>
          </Pressable>

          <Pressable
            onPress={handleSnooze}
            disabled={busy || !ativa}
            style={({ pressed }) => [styles.button, styles.snooze, pressed && styles.pressed]}
          >
            <Text style={styles.snoozeText}>Adiar {SNOOZE_MINUTES} minutos</Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            disabled={busy || !ativa}
            style={({ pressed }) => [styles.button, styles.skip, pressed && styles.pressed]}
          >
            <Text style={styles.skipText}>Não administrada</Text>
          </Pressable>
        </View>
      )}
    </LinearGradient>
  );
}

const MINT = '#B8F5EC';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    color: MINT,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  center: {
    width: '100%',
    alignItems: 'center',
  },
  medName: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  time: {
    color: MINT,
    fontSize: 56,
    fontWeight: '800',
    marginTop: 32,
    fontVariant: ['tabular-nums'],
  },
  infoCard: {
    width: '100%',
    marginTop: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    minWidth: 180,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirm: {
    backgroundColor: '#FFFFFF',
  },
  confirmText: {
    color: '#1B8585',
    fontSize: 18,
    fontWeight: '700',
  },
  snooze: {
    backgroundColor: '#FF6B8A',
  },
  snoozeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  skip: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});