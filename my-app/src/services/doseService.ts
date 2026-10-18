import { collection, deleteField, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';
import type { Medication } from '../schemas/medSchema';

type DoseInfo = Pick<Medication, 'medStock' | 'medStockConsumption' | 'medLastConfirmed'>;

export function getMedRef(medId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');
  return doc(db, 'users', userId, 'medications', medId);
}

// Confirma a dose `doseMs`. Retorna os campos novos para atualizar o estado local.
export async function confirmDoseInDb(medId: string, med: DoseInfo, doseMs: number) {
  // Já confirmada (ex.: na home e depois no alerta): não desconta o estoque duas vezes
  if (med.medLastConfirmed != null && med.medLastConfirmed >= doseMs) {
    return { medStock: med.medStock, medLastConfirmed: med.medLastConfirmed };
  }

  const novoEstoque = Math.max(0, med.medStock - med.medStockConsumption);
  const medRef = getMedRef(medId);

  const batch = writeBatch(db);
  batch.update(medRef, {
    medStock: novoEstoque,
    medLastConfirmed: doseMs,
    medSnoozedUntil: deleteField(),
  });
  // id do log = horário da dose, então confirmar duas vezes não duplica o registro
  batch.set(doc(collection(medRef, 'doseLogs'), String(doseMs)), {
    scheduledFor: doseMs,
    confirmedAt: serverTimestamp(),
  });
  await batch.commit();

  return { medStock: novoEstoque, medLastConfirmed: doseMs };
}

export async function snoozeDoseInDb(medId: string, untilMs: number) {
  await updateDoc(getMedRef(medId), { medSnoozedUntil: untilMs });
}