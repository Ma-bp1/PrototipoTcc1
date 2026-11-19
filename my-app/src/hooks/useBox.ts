import { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../config/firebaseConfig'
import { getMedications } from '../services/medicationService' // AJUSTE só se o nome do arquivo for outro
import { Medication } from '../schemas/medSchema'
import { onAuthStateChanged } from 'firebase/auth'
import { getAlertSettings } from '@/src/services/alertSettings'

export const STATUS = {
    online:  { label: 'Ligada',    cor: '#198289', fundo: '#E3F7F5' },
    standby: { label: 'Em espera', cor: '#C98A0B', fundo: '#FFF4DB' },
    offline: { label: 'Desligada', cor: '#8A9796', fundo: '#EEF1F1' },
}

export type TipoEvento = 'tomado' | 'adiado' | 'perdido'
export type EventoCaixa = {
  id: string
  tipo: TipoEvento
  slot: number      // 1..6
  horario: number   // segundos (unixtime), em hora local gravada como UTC (veja o item 5)
}
// Transforma os medicamentos no formato que a caixa entende.
// Cada item = um horário de alarme:
// { s: slot, h: hora, m: minuto, n: nome, d: dose, q: estoque, led, buzzer, w?: dias da semana }
function montarAgenda(meds: Medication[], antecedenciaMin: number) {
    const agenda: any[] = []

    for (const med of meds) {
        // medSlot é string: pega só os números ("1" ou "Slot 1" -> 1)
        const slot = parseInt(String(med.medSlot).replace(/\D/g, ''), 10)
        if (!slot) continue

        const [h, m] = med.medTime.split(':').map(Number)
        const base = {
            s: slot,
            n: med.medName,
            d: med.medStockConsumption,
            q: med.medStock,
            led: true,    // AJUSTE: troque pelos valores da sua tela de alertas, se existirem
            buzzer: true,
            a: antecedenciaMin,
        }
        const rep = med.medRepetitions

        if (rep.type === 'horario') {
            const inicio = h * 60 + m
            const passo = Math.round(rep.intervalHours * 60)
            if (!passo || passo <= 0) continue   // <- faltava isso

            for (let t = inicio; t < inicio + 1440; t += passo) {
                const x = t % 1440
                agenda.push({ ...base, h: Math.floor(x / 60), m: x % 60 })
        }
        } else if (rep.type === 'semanal') {
            // w = dias da semana (0 = domingo), a caixa só dispara nesses dias
            agenda.push({ ...base, h, m, w: rep.daysOfWeek })
        } else {
            agenda.push({ ...base, h, m }) // diário
        }
    }
    return agenda
}

// Função comum (não é hook): pode ser chamada de qualquer lugar, ex.: no onSubmit do addMed.
// Acha a caixa do usuário e grava lá a agenda atual. Devolve false se não houver caixa vinculada.
export async function enviarAgendaParaCaixa() {
    const uid = auth.currentUser?.uid
    if (!uid) return false

    const snap = await getDocs(query(collection(db, 'boxes'), where('ownerUid', '==', uid)))
    if (snap.empty) return false // nenhuma caixa vinculada a esta conta
    
    const [meds, cfg] = await Promise.all([getMedications(), getAlertSettings()])
    const antecedencia = cfg?.advance5 ? 5 : 0
    
    await updateDoc(snap.docs[0].ref, {
        agendaJson: JSON.stringify(montarAgenda(meds, antecedencia)),
        agendaAt: String(Date.now()),
    })
    return true
}

export function useBox(onEvento?: (ev: EventoCaixa) => void) {
    const [box, setBox] = useState<any>(null) // null = nenhuma caixa vinculada
    const [carregando, setCarregando] = useState(false)
    const [, forcar] = useState(0)

    const ultimoEventoId = useRef<string | null>(null)
    const callbackRef = useRef(onEvento)
    callbackRef.current = onEvento

    // Acha a caixa que pertence a este usuário e acompanha em tempo real
    useEffect(() => {
        let parar: (() => void) | null = null

        const sair = onAuthStateChanged(auth, user => {
            // troca de usuário: limpa o listener anterior
            parar?.()
            parar = null
            ultimoEventoId.current = null

            if (!user) {
                setBox(null)
                return
            }

            const q = query(collection(db, 'boxes'), where('ownerUid', '==', user.uid))
            parar = onSnapshot(
                q,
                snap => {
                    const d = snap.docs[0]
                    if (!d) {
                        setBox(null)
                        return
                    }

                    const data = d.data()
                    setBox({ id: d.id, ...data })

                                        const eventoId = typeof data.eventoId === 'string' ? data.eventoId : ''

                    // Primeiro snapshot: só memoriza o evento que já existe, não dispara de novo
                    if (ultimoEventoId.current === null) {
                        ultimoEventoId.current = eventoId
                        return
                    }

                    // Só dispara se o evento for novo (o snapshot também roda a cada lastSeen)
                    if (eventoId && eventoId !== ultimoEventoId.current) {
                        ultimoEventoId.current = eventoId

                        const tipo = data.eventoTipo as TipoEvento
                        const slot = Number(data.eventoSlot)
                        const horario = Number(data.eventoHorario) || 0

                        if (['tomado', 'adiado', 'perdido'].includes(tipo) && slot > 0) {
                            callbackRef.current?.({ id: eventoId, tipo, slot, horario })
                        }
                    }
                },
                err => console.log('Erro ao ler caixa:', err)
            )
        })

        return () => {
            parar?.()
            sair()
        }
    }, [])

    // re-renderiza a cada 5 s
    useEffect(() => {
    const t = setInterval(() => forcar(n => n + 1), 5000)
    return () => clearInterval(t)
    }, [])

    const visto = box?.lastSeen?.toMillis?.() ?? 0           // Timestamp do Firestore
    const recente = Date.now() - visto < 35_000              // 3 batimentos perdidos (10 s cada)
    const status: 'online' | 'standby' | 'offline' =
    !box || !recente ? 'offline'
    : box.estado === 'standby' ? 'standby'
    : 'online' 
    const online = status === 'online'
    // retorne também `status`, `bateria: box?.bateria`

    // agendaAck = a caixa confirmou que recebeu essa versão da agenda
    const ultimaSync = box?.agendaAck ? new Date(Number(box.agendaAck)).toLocaleString('pt-BR') : null

    // Vincula a caixa à conta (o código é o que aparece no Monitor Serial do ESP32)
    const vincular = async (codigo: string) => {
        const uid = auth.currentUser?.uid
        if (!uid) {
            Alert.alert('Usuário não está logado.')
            return
        }
        const id = codigo.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
        if (id.length !== 12) {
            Alert.alert('Código inválido. Ele tem 12 letras/números.')
            return
        }
        setCarregando(true)
        try {
            const ref = doc(db, 'boxes', id)
            const snap = await getDoc(ref)
            if (!snap.exists()) {
                Alert.alert('Caixa não encontrada. Ligue a caixa, espere conectar no Wi-Fi e confira o código.')
                return
            }
            await updateDoc(ref, { ownerUid: uid, pairedAt: Date.now() })
            await enviarAgendaParaCaixa() // já manda a agenda assim que vincula
            Alert.alert('Caixa vinculada!')
        } catch (e: any) {
            if (e?.code === 'permission-denied') {
                Alert.alert('Esta caixa já está vinculada a outra conta.')
            } else {
                Alert.alert('Não foi possível vincular a caixa.')
            }
        } finally {
            setCarregando(false)
        }
    }

    // Botão "Sincronizar": reenvia a agenda (a caixa lê em até 30s)
    const sincronizar = async () => {
        setCarregando(true)
        try {
            const ok = await enviarAgendaParaCaixa()
            Alert.alert(ok ? 'Agenda enviada! A caixa atualiza em até 30 segundos.' : 'Vincule uma caixa primeiro.')
        } catch (e) {
            console.error('Erro ao sincronizar:', e)
            Alert.alert('Não foi possível enviar a agenda.')
        } finally {
            setCarregando(false)
        }
    }

    return { box, online, ultimaSync, carregando, vincular, sincronizar, status }
}