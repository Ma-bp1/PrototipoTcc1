import { collection, getDocs, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebaseConfig'
import { medSchema, Medication, MedData } from '../schemas/medSchema'
import { getMedRef } from './doseService'

export async function updateMedication(id: string, data: Partial<MedData>) {
    await updateDoc(getMedRef(id), data)
}

export async function getMedications(): Promise<Medication[]> {
    const userId = auth.currentUser?.uid
    if (!userId) return []

    const snapshot = await getDocs(collection(db, 'users', userId, 'medications'))

    const medications: Medication[] = []

    snapshot.docs.forEach((docSnap) => {
        const result = medSchema.safeParse(docSnap.data())

        if (result.success) {
            medications.push({ id: docSnap.id, ...result.data })
        } else {
            console.warn(`Medicamento ${docSnap.id} inválido:`, result.error.flatten())
        }
    })

    return medications
}