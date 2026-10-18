import { useEffect, useState } from 'react';
import { View, Text, Pressable, Vibration, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';
import { snoozeMedication, cancelSnooze } from '../notifications/scheduler';
import { getAlertSettings } from '../services/alertSettings';
import { confirmDoseInDb, snoozeDoseInDb } from '../services/doseService';
import type { MedData } from '../schemas/medSchema';

const SNOOZE_MINUTES = 5;
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Documento do Firestore = MedData (mesmo schema do AddMed)
type StoredMed = MedData;

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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getAlertSettings().then(({ vibration }) => {
      if (active && vibration) Vibration.vibrate([0, 500, 300, 500], true); // repete até sair
    });
    return () => {
      active = false;
      Vibration.cancel();
    };
  }, []);

  useEffect(() => {
    if (!medId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        // Em cold start o Firebase ainda está restaurando a sessão:
        // currentUser pode ser null nos primeiros instantes.
        await auth.authStateReady();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const snap = await getDoc(doc(db, 'users', userId, 'medications', medId));
        if (!cancelled && snap.exists()) setMed(snap.data() as StoredMed);
      } catch (e) {
        console.warn('Falha ao carregar medicamento', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [medId]);

  // Horário agendado da dose (é o que a home guarda em medLastConfirmed)
  const doseMs = doseMsParam
    ? Number(doseMsParam)
    : lastOccurrence(time ?? med?.medTime);

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (medId && med) {
        await cancelSnooze(medId);
        await withTimeout(confirmDoseInDb(medId, med, doseMs));
      }
    } catch (e) {
      console.warn('Falha ao registrar dose', e);
    } finally {
      leave();
    }
  };

  const handleSnooze = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (medId && med) {
        const untilMs = await snoozeMedication({
          id: medId,
          name: med.medName,
          doseMs,
          minutes: SNOOZE_MINUTES,
        });
        await withTimeout(snoozeDoseInDb(medId, untilMs));
      }
    } catch (e) {
      console.warn('Falha ao adiar', e);
    } finally {
      leave();
    }
  };

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
      <Text style={styles.header}>Lembrete de Administração{'\n'}de Medicamentos</Text>

      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
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
                  <InfoRow label="Compartimento" value={`Slot ${med.medSlot}`} />
                )}
                {!!repeatLabel && <InfoRow label="Repetição" value={repeatLabel} />}
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleConfirm}
          disabled={busy}
          style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}
        >
          <Text style={styles.confirmText}>Confirmar dose</Text>
        </Pressable>

        <Pressable
          onPress={handleSnooze}
          disabled={busy}
          style={({ pressed }) => [styles.button, styles.snooze, pressed && styles.pressed]}
        >
          <Text style={styles.snoozeText}>Adiar {SNOOZE_MINUTES} minutos</Text>
        </Pressable>
      </View>
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
  confirm: { backgroundColor: '#FFFFFF' },
  confirmText: { color: '#1B8585', fontSize: 18, fontWeight: '700' },
  snooze: { backgroundColor: '#FF6B8A' },
  snoozeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});