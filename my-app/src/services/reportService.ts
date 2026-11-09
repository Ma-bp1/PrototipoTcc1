import { collection, getDocs, query, where } from 'firebase/firestore'

import { auth, db } from '../config/firebaseConfig'
import type { MedData } from '../schemas/medSchema'

const MINUTO = 60 * 1000
const HORA = 60 * MINUTO
// Dose que venceu há pouco ainda não conta como "não administrada"
const TOLERANCIA = 30 * MINUTO

const dois = (n: number) => String(n).padStart(2, '0')

const formatarData = (ms: number) => {
  const d = new Date(ms)
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`
}

const formatarHora = (ms: number) => {
  const d = new Date(ms)
  return `${dois(d.getHours())}:${dois(d.getMinutes())}`
}

// Horários (ms) em que o remédio deveria ser tomado dentro do período
function horariosPrevistos(med: MedData, inicio: number, fim: number): number[] {
  const [h, m] = med.medTime.split(':').map(Number)
  const rep = med.medRepetitions
  const lista: number[] = []

  if (rep.type === 'horario') {
    const passo = rep.intervalHours * HORA
    // Âncora: última dose confirmada (está sempre na grade de horários).
    // Se nunca foi confirmada, usa o horário do remédio de hoje.
    const hoje = new Date()
    hoje.setHours(h, m, 0, 0)
    const ancora = med.medLastConfirmed ?? hoje.getTime()

    let t = ancora + Math.ceil((inicio - ancora) / passo) * passo
    while (t <= fim) {
      lista.push(t)
      t += passo
    }
    return lista
  }

  // 'diario' ou 'semanal': percorre dia a dia
  const dia = new Date(inicio)
  while (dia.getTime() <= fim) {
    const t = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m).getTime()
    const diaCerto = rep.type === 'diario' || rep.daysOfWeek.includes(dia.getDay())
    if (diaCerto) lista.push(t)
    dia.setDate(dia.getDate() + 1)
  }
  return lista
}

// Monta o texto do relatório para o período escolhido
export async function gerarRelatorio(de: Date, ate: Date): Promise<string> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('Usuário não autenticado')

  const inicio = new Date(de.getFullYear(), de.getMonth(), de.getDate()).getTime()
  const fim = new Date(ate.getFullYear(), ate.getMonth(), ate.getDate(), 23, 59, 59, 999).getTime()
  const agora = Date.now()

  const medsSnap = await getDocs(collection(db, 'users', userId, 'medications'))

  const linhas: { quando: number; texto: string }[] = []
  let administradas = 0
  let naoAdministradas = 0

  for (const medDoc of medsSnap.docs) {
    const med = medDoc.data() as MedData

    // Doses confirmadas no período (doseLogs)
    const logsSnap = await getDocs(
      query(
        collection(medDoc.ref, 'doseLogs'),
        where('scheduledFor', '>=', inicio),
        where('scheduledFor', '<=', fim)
      )
    )

    const confirmadas: number[] = []

    for (const logDoc of logsSnap.docs) {
      const log = logDoc.data()
      const previsto = log.scheduledFor as number
      // confirmedAt é um Timestamp do Firestore; se ainda não sincronizou, usa o horário previsto
      const confirmadoEm = log.confirmedAt?.toMillis ? log.confirmedAt.toMillis() : previsto

      const mesmoDia = formatarData(confirmadoEm) === formatarData(previsto)
      const quandoTexto = mesmoDia
        ? formatarHora(confirmadoEm)
        : `${formatarData(confirmadoEm)} ${formatarHora(confirmadoEm)}`

      linhas.push({
        quando: previsto,
        texto: `${formatarData(previsto)} ${formatarHora(previsto)} - ${med.medName} - Administrada às ${quandoTexto}`,
      })
      administradas++
      confirmadas.push(previsto)
    }

    // Doses previstas que não têm confirmação = não administradas
    // createdAt é um Timestamp do Firestore. Não conta doses de antes do cadastro.
    // Se não existir (remédio muito antigo), não conta nenhuma como perdida.
    const criadoEm = medDoc.data().createdAt
    const inicioMed = criadoEm?.toMillis ? criadoEm.toMillis() : agora

    for (const t of horariosPrevistos(med, inicio, fim)) {
      const venceu = t < agora - TOLERANCIA
      const foiConfirmada = confirmadas.some((c) => Math.abs(c - t) < MINUTO)

      if (venceu && t >= inicioMed && !foiConfirmada) {
        linhas.push({
          quando: t,
          texto: `${formatarData(t)} ${formatarHora(t)} - ${med.medName} - Não administrada`,
        })
        naoAdministradas++
      }
    }
  }

  if (linhas.length === 0) return 'Nenhuma dose registrada no período.'

  linhas.sort((a, b) => a.quando - b.quando)

  return [
    `Doses administradas: ${administradas}`,
    `Doses não administradas: ${naoAdministradas}`,
    '',
    ...linhas.map((l) => l.texto),
  ].join('\n')
}