import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../config/firebaseConfig'
import { medSchema, Medication } from '../schemas/medSchema'

export async function getMedications(): Promise<Medication[]> {
    const userId = auth.currentUser?.uid
    if (!userId) return []

    const snapshot = await getDocs(collection(db, 'users', userId, 'medications'))

    const medications: Medication[] = []

    snapshot.docs.forEach((doc) => {
        const result = medSchema.safeParse(doc.data())

        if (result.success) {
            medications.push({ id: doc.id, ...result.data })
        } else {
            console.warn(`Medicamento ${doc.id} inválido:`, result.error.flatten())
        }
    })

    return medications
}