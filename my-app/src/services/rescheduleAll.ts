import { collection, getDocs } from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';
import { scheduleMedication } from '../notifications/scheduler';
import type { MedData } from '../schemas/medSchema';

// Usado quando o usuário religa "Notificações para alerta dos medicamentos"
export async function rescheduleAllMedications() {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const snap = await getDocs(collection(db, 'users', userId, 'medications'));

  for (const d of snap.docs) {
    const m = d.data() as MedData & { medStartAt?: number };
    await scheduleMedication({
      id: d.id,
      name: m.medName,
      // se o seu getTimes mudar, exporte-o para um arquivo comum e use aqui também
      times: [m.medTime],
      repetition: m.medRepetitions,
      startAt: m.medStartAt, // só existe depois de adicionar medStartAt ao schema
    });
  }
}