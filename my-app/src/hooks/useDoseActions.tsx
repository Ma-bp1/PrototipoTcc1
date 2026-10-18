import { Dispatch, SetStateAction, useRef } from 'react';
import { Alert } from 'react-native';

import type { Medication } from '../schemas/medSchema';
import { confirmDoseInDb, snoozeDoseInDb } from '../services/doseService';
import { cancelSnooze, snoozeMedication } from '../notifications/scheduler';

const SNOOZE_MINUTES = 5;

export function useDoseActions(
    medications: Medication[],
    setMedications: Dispatch<SetStateAction<Medication[]>>,
) {
    const emAndamento = useRef(new Set<string>())

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

            const novos = await confirmDoseInDb(medId, med, doseMs)
            await cancelSnooze(medId) // evita o aviso adiado tocar depois de confirmar

            atualizarLocal(medId, { ...novos, medSnoozedUntil: undefined })
        })

    // Agora também agenda o aviso. Assinatura mudou: recebe doseMs e minutos (em vez de adiadaAteMs).
    const adiarDose = (medId: string, doseMs: number, minutos = SNOOZE_MINUTES) =>
        executar(medId, 'Não foi possível adiar a dose.', async () => {
            const med = medications.find((m) => m.id === medId)
            if (!med) return

            const adiadaAteMs = await snoozeMedication({
                id: medId,
                name: med.medName,
                doseMs,
                minutes: minutos,
            })
            await snoozeDoseInDb(medId, adiadaAteMs)

            atualizarLocal(medId, { medSnoozedUntil: adiadaAteMs })
        })

    return { confirmarDose, adiarDose }
}