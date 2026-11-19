import { Dispatch, SetStateAction, useRef } from 'react';
import { Alert } from 'react-native';

import type { Medication } from '../schemas/medSchema';
import { confirmDoseInDb, snoozeDoseInDb } from '../services/doseService';
import { cancelSnooze, snoozeMedication } from '../notifications/scheduler';
import { enviarAgendaParaCaixa } from './useBox';
import { missDoseInDb } from '../services/doseService';
import { collection, getDocs, updateDoc, where, doc, setDoc, query } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

const SNOOZE_MINUTES = 5;

let caixaCache: { uid: string; id: string } | null = null

async function mandarComandoCaixa(
    med: Medication,
    tipo: 'confirmar' | 'adiar' | 'perdido',
    minutos = SNOOZE_MINUTES,
) {
    console.log('[CMD] chamada', tipo, med.medName)
    try {
        const uid = auth.currentUser?.uid
        console.log('[CMD] uid =', uid)
        if (!uid) return

        if (caixaCache?.uid !== uid) {
            console.log('[CMD] buscando caixa...')
            const snap = await getDocs(query(collection(db, 'boxes'), where('ownerUid', '==', uid)))
            console.log('[CMD] caixas encontradas:', snap.size)
            if (snap.empty) return
            caixaCache = { uid, id: snap.docs[0].id }
        }

        const slot = Number(String(med.medSlot ?? '').replace(/\D/g, '')) || 0
        console.log('[CMD] escrevendo em', caixaCache.id, 'slot', slot)
        await updateDoc(doc(db, 'boxes', caixaCache.id), {
            cmdAt: String(Date.now()),
            cmdTipo: tipo,
            cmdSlot: slot,
            cmdMin: minutos,
        })
        console.log('[CMD] enviado OK')
    } catch (e) {
        console.error('[CMD] ERRO', e)
    }
}

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
            console.log('[DOSE] confirmarDose', medId)
            const med = medications.find((m) => m.id === medId)
            console.log('[DOSE] med achado?', !!med)
            if (!med) return
            await mandarComandoCaixa(med, 'confirmar')

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
            mandarComandoCaixa(med, 'adiar', minutos)

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

        await mandarComandoCaixa(med, 'perdido')

        atualizarLocal(medId, {
            medLastMissed: doseMs,
            medSnoozedUntil: undefined,
            medAutoSnooze: undefined,
        })
    })

    return { confirmarDose, adiarDose, marcarPerdida }
}