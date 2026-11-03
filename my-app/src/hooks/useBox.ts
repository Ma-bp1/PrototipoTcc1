import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../config/firebaseConfig'
import { getMedications } from '../services/medicationService'

// Transforma os medicamentos no formato simples que a caixa entende:
// [{ s: compartimento, h: hora, m: minuto }]
function montarAgenda(meds: any[]) {
    return meds.map(med => {
        const [h, m] = String(med.medTime).split(':').map(Number)
        return { s: Number(med.medSlot), h, m }
    })
}

export function useBox() {
    const [box, setBox] = useState<any>(null) // null = nenhuma caixa vinculada
    const [carregando, setCarregando] = useState(false)
    const [, forcar] = useState(0)

    // Acha a caixa que pertence a este usuário e acompanha em tempo real
    useEffect(() => {
        const uid = auth.currentUser?.uid
        if (!uid) return
        const q = query(collection(db, 'boxes'), where('ownerUid', '==', uid))
        const parar = onSnapshot(
            q,
            snap => {
                const d = snap.docs[0]
                setBox(d ? { id: d.id, ...d.data() } : null)
            },
            err => console.log('Erro ao ler caixa:', err)
        )
        const timer = setInterval(() => forcar(n => n + 1), 30000) // reavalia "online"
        return () => {
            parar()
            clearInterval(timer)
        }
    }, [])

    // Caixa manda sinal a cada 30s; sem sinal há 2 min = desligada
    const online = !!box?.lastSeen && Date.now() / 1000 - box.lastSeen < 120
    const bateria: number | null = box?.battery ?? null
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

    // Envia a agenda de medicamentos para a caixa (ela lê em até 30s)
    const sincronizar = async () => {
        const uid = auth.currentUser?.uid
        if (!uid || !box) {
            Alert.alert('Vincule uma caixa primeiro.')
            return
        }
        setCarregando(true)
        try {
            const meds = await getMedications() // já usa o usuário logado
            await updateDoc(doc(db, 'boxes', box.id), {
                agendaJson: JSON.stringify(montarAgenda(meds)),
                agendaAt: String(Date.now()),
            })
            Alert.alert('Agenda enviada! A caixa atualiza em até 30 segundos.')
        } catch (e) {
            console.error('Erro ao sincronizar:', e)
            Alert.alert('Não foi possível enviar a agenda.')
        } finally {
            setCarregando(false)
        }
    }

    return { box, online, bateria, ultimaSync, carregando, vincular, sincronizar }
}