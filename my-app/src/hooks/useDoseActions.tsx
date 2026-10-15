import { Dispatch, SetStateAction, useRef } from 'react'
import { Alert } from 'react-native'
import {
    collection,
    deleteField,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore'

import { auth, db } from '../config/firebaseConfig'
import { MedData } from '../schemas/medSchema'

type Medication = MedData & { id: string }

export function useDoseActions(
    medications: Medication[],
    setMedications: Dispatch<SetStateAction<Medication[]>>,
) {
    const emAndamento = useRef(new Set<string>())

    const getMedRef = (medId: string) => {
        const userId = auth.currentUser?.uid
        if (!userId) throw new Error('Usuário não autenticado')

        return doc(db, 'users', userId, 'medications', medId)
    }

    const atualizarLocal = (medId: string, campos: Partial<Medication>) =>
        setMedications((prev) =>
            prev.map((m) => (m.id === medId ? { ...m, ...campos } : m)),
        )

    const executar = async (
        medId: string,
        mensagemErro: string,
        acao: () => Promise<void>,
    ) => {
        if (emAndamento.current.has(medId)) return
        emAndamento.current.add(medId)

        try {
            await acao()
        } catch (error) {
            console.error(mensagemErro, error)
            Alert.alert(mensagemErro, 'Tente novamente.')
        } finally {
            emAndamento.current.delete(medId)
        }
    }

    
    const confirmarDose = (medId: string, doseMs: number) =>
        executar(medId, 'Não foi possível confirmar a dose.', async () => {
            const med = medications.find((m) => m.id === medId)
            if (!med) return

            const novoEstoque = Math.max(0, med.medStock - med.medStockConsumption)
            const medRef = getMedRef(medId)

            
            const batch = writeBatch(db)
            batch.update(medRef, {
                medStock: novoEstoque,
                medLastConfirmed: doseMs,
                medSnoozedUntil: deleteField(),
            })
            batch.set(doc(collection(medRef, 'doseLogs')), {
                scheduledFor: doseMs,
                confirmedAt: serverTimestamp(),
            })
            await batch.commit()

            atualizarLocal(medId, {
                medStock: novoEstoque,
                medLastConfirmed: doseMs,
                medSnoozedUntil: undefined,
            })
        })

    const adiarDose = (medId: string, adiadaAteMs: number) =>
        executar(medId, 'Não foi possível adiar a dose.', async () => {
            await updateDoc(getMedRef(medId), { medSnoozedUntil: adiadaAteMs })
            atualizarLocal(medId, { medSnoozedUntil: adiadaAteMs })
        })

    return { confirmarDose, adiarDose }
}