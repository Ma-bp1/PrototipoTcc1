import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { auth } from '@/services/firebase'; // ajuste o caminho
import {
  criarSessaoPremium,
  montarUrlQr,
  observarSessao,
  PLANOS,
  Plano,
  SessaoCriada,
} from '@/services/premiumService';

/** Formata o tempo restante como "23h 30m 6s". */
function useContagem(expiraEm: Date | null): string {
  const [restanteMs, setRestanteMs] = useState(0);

  useEffect(() => {
    if (!expiraEm) return;
    const atualizar = () =>
      setRestanteMs(Math.max(0, expiraEm.getTime() - Date.now()));
    atualizar();
    const timer = setInterval(atualizar, 1000);
    return () => clearInterval(timer);
  }, [expiraEm]);

  const total = Math.floor(restanteMs / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function PremiumScreen() {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [plano, setPlano] = useState<Plano>('mensal');
  const [sessao, setSessao] = useState<SessaoCriada | null>(null);
  const [erro, setErro] = useState(false);
  const jaAvisou = useRef(false);

  const contagem = useContagem(sessao?.expiraEm ?? null);

  // 1) Cria uma sessão nova sempre que o plano muda
  useEffect(() => {
    if (!uid) return;
    let ativo = true;
    setSessao(null);
    setErro(false);

    criarSessaoPremium(uid, plano)
      .then((nova) => ativo && setSessao(nova))
      .catch(() => ativo && setErro(true));

    return () => {
      ativo = false;
    };
  }, [plano, uid]);

  // 2) Escuta a sessão: quando "escaneado" vira true, libera o premium
  useEffect(() => {
    if (!sessao) return;

    return observarSessao(sessao.id, (dados) => {
      if (dados?.escaneado && !jaAvisou.current) {
        jaAvisou.current = true;
        Alert.alert('Premium ativado!', 'QR Code lido com sucesso.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    });
  }, [sessao, router]);

  if (!uid) {
    return (
      <View style={s.centro}>
        <Text style={s.instrucao}>Faça login para adquirir o Premium.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.abas}>
        {(Object.keys(PLANOS) as Plano[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.aba, plano === p && s.abaAtiva]}
            onPress={() => setPlano(p)}
            accessibilityRole="button"
            accessibilityState={{ selected: plano === p }}
          >
            <Text style={[s.abaTexto, plano === p && s.abaTextoAtivo]}>
              {PLANOS[p].abaLabel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.titulo}>{PLANOS[plano].titulo}</Text>

      <View style={s.qrBox}>
        {erro ? (
          <Text style={s.instrucao}>Não foi possível gerar o QR Code.</Text>
        ) : sessao ? (
          <QRCode value={montarUrlQr(sessao.id)} size={200} />
        ) : (
          <ActivityIndicator size="large" color="#2FA8A0" />
        )}
      </View>

      <Text style={s.instrucao}>
        Escaneie o QR Code com a câmera de outro celular para ativar o Premium.
      </Text>

      <Text style={s.prazo}>
        {sessao ? `Prazo de leitura: ${contagem}` : 'Gerando QR Code...'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F7F6',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F7F6',
  },
  abas: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  aba: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#DFEEED',
  },
  abaAtiva: { backgroundColor: '#2FA8A0' },
  abaTexto: { color: '#0B5A55', fontWeight: '600' },
  abaTextoAtivo: { color: '#FFFFFF' },
  titulo: { fontSize: 17, color: '#0B5A55', marginBottom: 12 },
  qrBox: {
    width: 232,
    height: 232,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  instrucao: {
    textAlign: 'center',
    fontSize: 13,
    color: '#1F2D2C',
    marginVertical: 14,
    paddingHorizontal: 12,
  },
  prazo: { fontSize: 12, color: '#4A5C5A' },
});