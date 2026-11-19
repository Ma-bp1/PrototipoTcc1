import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'

// Manda o novo estoque de um slot para a caixa.
// A caixa só aplica se a "versão" (segundos) for diferente da última aplicada.
export async function sendStockToBox(boxId: string, medSlot: string, stock: number) {
    const slotNumber = Number(medSlot.replace('slot_', ''))
    if (!boxId || !slotNumber) return

    const ver = Math.floor(Date.now() / 1000)
    const qtd = Math.max(0, Math.round(stock))

    await setDoc(
        doc(db, 'boxes', boxId),
        { estoqueApp: { [`s${slotNumber}`]: `${ver}:${qtd}` } },
        { merge: true }
    )
}