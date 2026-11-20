import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebaseConfig' // ajuste para onde está o seu "db"

export async function enviarConfigCaixa(boxId: string, s: { sound: boolean; light: boolean }) {
  await updateDoc(doc(db, 'boxes', boxId), {
    cfgSom: s.sound,
    cfgLuz: s.light,
  })
}