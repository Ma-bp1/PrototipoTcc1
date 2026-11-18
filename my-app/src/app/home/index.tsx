import { View, ScrollView, StyleSheet, Image } from 'react-native'
import { useCallback, useEffect } from 'react'
import { useFocusEffect } from 'expo-router'

import { AppText } from '../../components/AppText'
import LembreteCards from '../../components/LembreteCards'
import { HomeSlots } from '../../components/HomeSlots'
import { useMedications } from '../../hooks/useMedication'
import { useDoseActions } from '../../hooks/useDoseActions'
import { useBox } from '../../hooks/useBox'
import { limparNotificacoesOrfas } from '../../notifications/scheduler'

const STATUS = {
    online:  { label: 'Ligada',    cor: '#198289', fundo: '#E3F7F5' },
    standby: { label: 'Em espera', cor: '#C98A0B', fundo: '#FFF4DB' },
    offline: { label: 'Desligada', cor: '#8A9796', fundo: '#EEF1F1' },
}

export default function Home() {
    const { status } = useBox()
    const { medications, setMedications, refetch } = useMedications()
    const { confirmarDose, adiarDose } = useDoseActions(medications, setMedications)

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )

    useEffect(() => {
        // só limpa quando já tem a lista carregada
        if (medications.length === 0) return
        limparNotificacoesOrfas(medications.map((m) => m.id))
    }, [medications])

    const { label, cor, fundo } = STATUS[status]

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>

                <View style={styles.header}>
                    <Image
                        source={require('../../../assets/android-icon-foreground.png')}
                        style={styles.logo}
                    />

                    <AppText style={styles.title}>Caixa Organizadora</AppText>

                    <View style={[styles.badge, { backgroundColor: fundo }]}>
                        <View style={[styles.dot, { backgroundColor: cor }]} />
                        <AppText style={[styles.badgeText, { color: cor }]}>{label}</AppText>
                    </View>
                </View>

                <AppText style={styles.section}>Lembretes</AppText>
                <LembreteCards
                    medications={medications}
                    onConfirmar={confirmarDose}
                    onAdiar={adiarDose}
                />

                <AppText style={styles.section}>Slots da Caixa</AppText>
                <HomeSlots
                    medications={medications}
                    onDeleted={(id) => setMedications((prev) => prev.filter((m) => m.id !== id))}
                />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 140,                 
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 30,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    logo: {
        position: 'absolute',    
        left: -40,
        width: 150,
        height: 150,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#198289', marginBottom: 10 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    dot: { width: 10, height: 10, borderRadius: 5 },
    badgeText: { fontSize: 14, fontWeight: 'bold' },
    section: { margin: 15, fontSize: 26 },
})