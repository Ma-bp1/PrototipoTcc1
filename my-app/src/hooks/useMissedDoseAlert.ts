import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, db } from '../config/firebaseConfig';
import { resolveMissedDoseInDb, type MissedDose } from '../services/doseService';
import { enviarAgendaParaCaixa } from './useBox';

export function useMissedDoseAlert() {
  const queue = useRef<MissedDose[]>([]);
  const showing = useRef(false);

  useEffect(() => {
    let stopSnap: (() => void) | null = null;

    const finish = (item: MissedDose, keepMissed: boolean) => {
        resolveMissedDoseInDb(item, keepMissed)
            .then(() => {
            // "Não" = tomei → estoque mudou → caixa precisa da agenda nova
            if (!keepMissed) return enviarAgendaParaCaixa();
            })
            .catch((e) => console.warn('Falha ao resolver dose perdida', e));

        queue.current = queue.current.filter((i) => i.id !== item.id);
        showing.current = false;
        showNext();
    };

    const showNext = () => {
      if (showing.current || AppState.currentState !== 'active') return;
      const item = queue.current[0];
      if (!item) return;
      showing.current = true;

      Alert.alert(
        'Dose não administrada',
        `${item.medName} no slot ${item.medSlot} marcado como não administrado. Confirmar decisão?`,
        [
          { text: 'Não', onPress: () => finish(item, false) },
          { text: 'Sim', onPress: () => finish(item, true) },
        ],
        { cancelable: false } // Android: não fecha ao tocar fora / botão voltar
      );
    };

    const offAuth = onAuthStateChanged(auth, (user) => {
      stopSnap?.();
      stopSnap = null;
      queue.current = [];
      if (!user) return;

      const q = query(
        collection(db, 'users', user.uid, 'missedDoses'),
        where('status', '==', 'pending')
      );
      stopSnap = onSnapshot(q, (snap) => {
        queue.current = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<MissedDose, 'id'>) }))
          .sort((a, b) => a.doseMs - b.doseMs);
        showNext();
      });
    });

    // app voltou para o primeiro plano com pendentes
    const sub = AppState.addEventListener('change', (s) => s === 'active' && showNext());

    return () => {
      sub.remove();
      stopSnap?.();
      offAuth();
    };
  }, []);
}