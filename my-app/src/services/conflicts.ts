import { Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import type { MedData, Medication } from '../schemas/medSchema';

export async function loadMedications(userId: string): Promise<Medication[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'medications'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as MedData) }));
}

// Dois remédios semanais só colidem se tiverem algum dia em comum.
// Nos demais casos (diário/horário), considera que há sobreposição.
function daysOverlap(a: MedData['medRepetitions'], b: MedData['medRepetitions']) {
  if (a.type === 'semanal' && b.type === 'semanal') {
    return a.daysOfWeek.some((d) => b.daysOfWeek.includes(d));
  }
  return true;
}

const names = (meds: Medication[]) => meds.map((m) => m.medName).join(', ');

// Devolve uma mensagem por tipo de conflito encontrado (lista vazia = sem conflitos).
// `others` não deve incluir o próprio remédio em edição.
export function findConflicts(
  data: MedData,
  others: Medication[],
  opts: { time: boolean; slot: boolean },
): string[] {
  const messages: string[] = [];

  if (opts.time) {
    // Compara só o horário base (medTime). Para intervalo em horas, as doses seguintes não entram.
    const clash = others.filter(
      (m) => m.medTime === data.medTime && daysOverlap(m.medRepetitions, data.medRepetitions),
    );
    if (clash.length) {
      messages.push(
        `Conflito de horário: ${names(clash)} ${clash.length > 1 ? 'já têm' : 'já tem'} dose marcada às ${data.medTime}.`,
      );
    }
  }

  if (opts.slot && data.medSlot) {
    const clash = others.filter((m) => m.medSlot === data.medSlot);
    if (clash.length) {
      messages.push(`Conflito de slot: o slot ${data.medSlot} já é usado por ${names(clash)}.`);
    }
  }

  return messages;
}

// Mostra os conflitos e deixa a pessoa decidir. true = salvar mesmo assim.
export function confirmConflicts(messages: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Possível conflito',
      messages.join('\n\n'),
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Salvar mesmo assim', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}