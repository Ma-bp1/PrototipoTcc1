import { getMedications } from './medicationService'
import { confirmDoseInDb } from './doseService'
import { cancelSnooze } from '../notifications/scheduler'
import { getNotifications } from '../notifications/native'
import { enviarAgendaParaCaixa } from '../hooks/useBox'

export async function confirmarDosePelaCaixa(slot: number, horario: number) {
    const meds = await getMedications()
    const med = meds.find(m => parseInt(String(m.medSlot).replace(/\D/g, ''), 10) === slot)
    if (!med) return

    const doseMs = horario * 1000 // horario da caixa vem em segundos
    await confirmDoseInDb(med.id, med, doseMs)
    await cancelSnooze(med.id)
    await getNotifications()?.dismissAllNotificationsAsync()
    enviarAgendaParaCaixa().catch(console.warn)
}