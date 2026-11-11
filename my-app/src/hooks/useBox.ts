import { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../config/firebaseConfig'
import { getMedications } from '../services/medicationService' // AJUSTE só se o nome do arquivo for outro
import { Medication } from '../schemas/medSchema'
import { onAuthStateChanged } from 'firebase/auth'

type DoseConfirmada = { slot: number; horario: number } // horario em segundos (unixtime)

// Transforma os medicamentos no formato que a caixa entende.
// Cada item = um horário de alarme:
// { s: slot, h: hora, m: minuto, n: nome, d: dose, q: estoque, led, buzzer, w?: dias da semana }
function montarAgenda(meds: Medication[]) {
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

    const meds = await getMedications()
    await updateDoc(snap.docs[0].ref, {
        agendaJson: JSON.stringify(montarAgenda(meds)),
        agendaAt: String(Date.now()),
    })
    return true
}

export function useBox(onDoseConfirmada?: (dose: DoseConfirmada) => void) {
    const [box, setBox] = useState<any>(null) // null = nenhuma caixa vinculada
    const [carregando, setCarregando] = useState(false)
    const [, forcar] = useState(0)

    const ultimaDoseProcessada = useRef<number | null>(null)

    const callbackRef = useRef(onDoseConfirmada)
    callbackRef.current = onDoseConfirmada

    // Acha a caixa que pertence a este usuário e acompanha em tempo real
    useEffect(() => {
        let parar: (() => void) | null = null

        const sair = onAuthStateChanged(auth, user => {
            // troca de usuário: limpa o listener anterior
            parar?.()
            parar = null
            ultimaDoseProcessada.current = null

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

                    const horario = Number(data.ultimaDoseHorario) || 0
                    const slot = Number(data.ultimaDoseSlot)

                    // Primeiro snapshot: só registra o que já existe
                    if (ultimaDoseProcessada.current === null) {
                        ultimaDoseProcessada.current = horario
                        return
                    }

                    if (
                        data.ultimaDoseConfirmada === true &&
                        slot > 0 &&
                        horario > ultimaDoseProcessada.current
                    ) {
                        ultimaDoseProcessada.current = horario
                        callbackRef.current?.({ slot, horario })
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

    useEffect(() => {
        const t = setInterval(() => forcar(n => n + 1), 30000)
        return () => clearInterval(t)
    }, [])

    // Caixa manda sinal a cada 30s; sem sinal há 2 min = desligada
    const online = !!box?.lastSeen && Date.now() / 1000 - box.lastSeen < 120
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

    return { box, online, ultimaSync, carregando, vincular, sincronizar }
}