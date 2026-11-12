import { Dispatch, SetStateAction, useRef } from 'react';
import { Alert } from 'react-native';

import type { Medication } from '../schemas/medSchema';
import { confirmDoseInDb, snoozeDoseInDb } from '../services/doseService';
import { cancelSnooze, snoozeMedication } from '../notifications/scheduler';
import { enviarAgendaParaCaixa } from './useBox';
import { missDoseInDb } from '../services/doseService';

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

            await cancelSnooze(medId) // evita o aviso adiado tocar depois de confirmar
            const novos = await confirmDoseInDb(medId, med, doseMs)

            atualizarLocal(medId, { ...novos, medSnoozedUntil: undefined, medAutoSnooze: undefined})

            // Fire-and-forget: a dose já foi confirmada, não vale travar nem avisar erro aqui
            enviarAgendaParaCaixa().catch((e) =>
                console.warn('Falha ao enviar agenda para a caixa', e),
            )
    })

    const adiarDose = (
        medId: string,
        doseMs: number,
        minutos = SNOOZE_MINUTES,
        auto?: { doseMs: number; count: number }
    ) =>
        executar(medId, 'Não foi possível adiar a dose.', async () => {
            const med = medications.find((m) => m.id === medId)
            if (!med) return

            const adiadaAteMs = await snoozeMedication({
                id: medId,
                name: med.medName,
                doseMs,
                minutes: minutos,
            })
            await snoozeDoseInDb(medId, adiadaAteMs, auto)

            atualizarLocal(medId, { medSnoozedUntil: adiadaAteMs, medAutoSnooze: auto })
        })

    const marcarPerdida = (medId: string, doseMs: number) =>
    executar(medId, 'Não foi possível registrar a dose perdida.', async () => {
        const med = medications.find((m) => m.id === medId)
        if (!med) return

        await cancelSnooze(medId)
        await missDoseInDb(medId, med, doseMs)

        atualizarLocal(medId, {
            medLastMissed: doseMs,
            medSnoozedUntil: undefined,
            medAutoSnooze: undefined,
        })
    })

    return { confirmarDose, adiarDose, marcarPerdida }
}