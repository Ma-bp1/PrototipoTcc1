import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig'; // ajuste o caminho

interface EstadoPremium {
  isPremium: boolean;
  expiraEm: Date | null;
  loading: boolean;
}

/**
 * Use em qualquer tela (relatório, estoque etc.) para saber se o usuário
 * é premium. Atualiza em tempo real quando o Firestore muda.
 */
export function usePremium(): EstadoPremium {
  const [estado, setEstado] = useState<EstadoPremium>({
    isPremium: false,
    expiraEm: null,
    loading: true,
  });

  useEffect(() => {
    let cancelarDoc: (() => void) | undefined;

    const cancelarAuth = onAuthStateChanged(auth, (user) => {
      cancelarDoc?.();

      if (!user) {
        setEstado({ isPremium: false, expiraEm: null, loading: false });
        return;
      }

      cancelarDoc = onSnapshot(doc(db, 'users', user.uid), (snap) => {
        const dados = snap.data();
        const expiraEm: Date | null = dados?.premiumExpiraEm?.toDate() ?? null;
        const valido =
          dados?.premium === true && !!expiraEm && expiraEm.getTime() > Date.now();

        setEstado({ isPremium: valido, expiraEm, loading: false });
      });
    });

    return () => {
      cancelarDoc?.();
      cancelarAuth();
    };
  }, []);

  return estado;
}