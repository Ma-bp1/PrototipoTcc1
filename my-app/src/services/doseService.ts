import { collection, deleteField, doc, getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';
import type { Medication } from '../schemas/medSchema';

type DoseInfo = Pick<Medication, 'medStock' | 'medStockConsumption' | 'medLastConfirmed' | 'medLastMissed'>;

export type MissedDose = {
  id: string;
  medId: string;
  medName: string;
  medSlot: string;
  doseMs: number;
};

function requireUid() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');
  return userId;
}

export function getMedRef(medId: string) {
  return doc(db, 'users', requireUid(), 'medications', medId);
}

const missedRef = (medId: string, doseMs: number) =>
  doc(db, 'users', requireUid(), 'missedDoses', `${medId}_${doseMs}`);

export async function confirmDoseInDb(medId: string, med: DoseInfo, doseMs: number) {
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
    medAutoSnooze: deleteField(), // NOVO
  });
  batch.set(doc(collection(medRef, 'doseLogs'), String(doseMs)), {
    scheduledFor: doseMs,
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  });
  // NOVO: se a dose tinha sido marcada como perdida (ex.: usuário tomou pela caixa depois),
  // fecha o pendente para o alerta não aparecer
  if (med.medLastMissed === doseMs) {
    batch.update(missedRef(medId, doseMs), { status: 'taken', resolvedAt: serverTimestamp() });
  }
  await batch.commit();

  return { medStock: novoEstoque, medLastConfirmed: doseMs };
}

// Sem `auto` = adiamento manual → zera o contador de adiamentos automáticos
export async function snoozeDoseInDb(
  medId: string,
  untilMs: number,
  auto?: { doseMs: number; count: number }
) {
  await updateDoc(getMedRef(medId), {
    medSnoozedUntil: untilMs,
    medAutoSnooze: auto ?? deleteField(),
  });
}

// Dose perdida: não mexe no estoque
export async function missDoseInDb(
    medId: string,
    med: Pick<Medication, 'medName' | 'medSlot' | 'medLastConfirmed' | 'medLastMissed'>,
    doseMs: number,
    motivo: 'timeout' | 'usuario' = 'timeout',
 ) {
      if (Number(med.medLastConfirmed ?? 0) >= doseMs) return;
      if (Number(med.medLastMissed ?? 0) >= doseMs) return;

      const porUsuario = motivo === 'usuario';
      const medRef = getMedRef(medId);
      const batch = writeBatch(db);

      batch.update(medRef, {
        medLastMissed: doseMs,
        medSnoozedUntil: deleteField(),
        medAutoSnooze: deleteField(),
      });
      batch.set(
        doc(collection(medRef, 'doseLogs'), String(doseMs)),
        { scheduledFor: doseMs, status: 'missed', reason: motivo, missedAt: serverTimestamp() },
        { merge: true },
      );
      batch.set(missedRef(medId, doseMs), {
        medId,
        medName: med.medName,
        medSlot: String(med.medSlot).replace(/\D/g, ''),
        doseMs,
        status: porUsuario ? 'confirmed_missed' : 'pending',
        createdAt: serverTimestamp(),
        ...(porUsuario ? { resolvedAt: serverTimestamp() } : {}),
      });
      await batch.commit();
}

// Sim  = mantém como não administrada
// Não  = o usuário diz que tomou → registra como tomada (desconta estoque)
export async function resolveMissedDoseInDb(m: MissedDose, keepMissed: boolean) {
  const ref = missedRef(m.medId, m.doseMs);

  if (keepMissed) {
    await updateDoc(ref, { status: 'confirmed_missed', resolvedAt: serverTimestamp() });
    return;
  }

  const medRef = getMedRef(m.medId);
  const snap = await getDoc(medRef);
  const batch = writeBatch(db);

  if (snap.exists()) {
    const med = snap.data() as Medication;
    batch.update(medRef, {
      medStock: Math.max(0, med.medStock - med.medStockConsumption),
      ...(Number(med.medLastConfirmed ?? 0) < m.doseMs ? { medLastConfirmed: m.doseMs } : {}),
    });
    batch.set(doc(collection(medRef, 'doseLogs'), String(m.doseMs)), {
      scheduledFor: m.doseMs,
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
      lateConfirmed: true,
    });
  }
  batch.update(ref, { status: 'taken', resolvedAt: serverTimestamp() });
  await batch.commit();
}