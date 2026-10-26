import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export type Plano = 'mensal' | 'anual';

export const PLANOS: Record<Plano, { titulo: string; abaLabel: string }> = {
  mensal: { titulo: 'Assinatura - R$ 30 (Mensal)', abaLabel: 'Mensal R$ 30' },
  anual: { titulo: 'Assinatura - R$ 230 (Anual)', abaLabel: 'Anual R$ 230' },
};

// Troque pela URL da sua Cloud Function depois do deploy
export const CONFIRMAR_URL =
  'https://us-central1-SEUPROJETO.cloudfunctions.net/confirmarPremium';

const VALIDADE_MS = 24 * 60 * 60 * 1000; // 24h

export interface SessaoPremium {
  userId: string;
  plano: Plano;
  escaneado: boolean;
  expiraEm: Timestamp;
}

export interface SessaoCriada {
  id: string;
  expiraEm: Date;
}

/** Cria a sessão que o QR Code vai representar. */
export async function criarSessaoPremium(
  userId: string,
  plano: Plano
): Promise<SessaoCriada> {
  const expiraEm = Timestamp.fromMillis(Date.now() + VALIDADE_MS);

  const ref = await addDoc(collection(db, 'sessoesPremium'), {
    userId,
    plano,
    escaneado: false,
    expiraEm,
  });

  return { id: ref.id, expiraEm: expiraEm.toDate() };
}

/** Escuta a sessão em tempo real. Retorna a função para cancelar. */
export function observarSessao(
  sessaoId: string,
  callback: (sessao: SessaoPremium | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'sessoesPremium', sessaoId), (snap) => {
    callback(snap.exists() ? (snap.data() as SessaoPremium) : null);
  });
}

export function montarUrlQr(sessaoId: string): string {
  return `${CONFIRMAR_URL}?s=${encodeURIComponent(sessaoId)}`;
}