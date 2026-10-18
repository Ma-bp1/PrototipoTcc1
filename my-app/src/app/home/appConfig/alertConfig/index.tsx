import { View, Text, StyleSheet, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { AppText } from '../../../../components/AppText'

// TODO: ajuste os caminhos conforme onde você salvou os arquivos
import {
    AlertSettings,
    getAlertSettings,
    saveAlertSettings,
} from '../../../../services/alertSettings'
import { cancelAllMedicationAlerts } from '../../../../notifications/scheduler'
import { rescheduleAllMedications } from '../../../../services/rescheduleAll'

type SwitchRowProps = {
    label: string
    value: boolean
    onChange: () => void
    disabled?: boolean
}

function SwitchRow({ label, value, onChange, disabled }: SwitchRowProps) {
    return (
        <View style={styles.boxItem}>
            <View style={{ flex: 1 }}>
                <AppText>{label}</AppText>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                trackColor={{ false: '#FF6B8A', true: '#31AEAE' }}
                thumbColor='#fff'
            />
        </View>
    )
}

export default function AlertConfig() {
    const [settings, setSettings] = useState<AlertSettings | null>(null)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        getAlertSettings().then(setSettings)
    }, [])

    const toggle = async (key: keyof AlertSettings) => {
        if (!settings || syncing) return

        const previous = settings
        const next = { ...settings, [key]: !settings[key] }
        setSettings(next)
        setSyncing(true)

        try {
            // salva primeiro: o agendador lê esta configuração
            await saveAlertSettings(next)

            if (key === 'medAlert') {
                if (next.medAlert) await rescheduleAllMedications()
                else await cancelAllMedicationAlerts()
            }
        } catch (error) {
            console.error('Erro ao aplicar configuração de alerta', error)
            setSettings(previous)
            await saveAlertSettings(previous).catch(() => {})
            Alert.alert('Não foi possível salvar a configuração.', 'Tente novamente.')
        } finally {
            setSyncing(false)
        }
    }

    if (!settings) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator color='#31AEAE' />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <Text style={styles.screenTitle}>Alertas</Text>

                <Text style={styles.title}>Notificações do Aplicativo</Text>
                <View style={styles.box}>
                    <SwitchRow
                        label='Notificações para alerta dos medicamentos'
                        value={settings.medAlert}
                        onChange={() => toggle('medAlert')}
                        disabled={syncing}
                    />
                    {/* Baixo estoque: salvo, mas sem efeito até a lógica de estoque existir */}
                    <SwitchRow
                        label='Baixo Estoque'
                        value={settings.lowStock}
                        onChange={() => toggle('lowStock')}
                        disabled={syncing}
                    />
                    <SwitchRow
                        label='Conflito de Horário'
                        value={settings.timeConflict}
                        onChange={() => toggle('timeConflict')}
                        disabled={syncing}
                    />
                    <SwitchRow
                        label='Conflito de Slot'
                        value={settings.slotConflict}
                        onChange={() => toggle('slotConflict')}
                        disabled={syncing}
                    />
                    <SwitchRow
                        label='Vibração'
                        value={settings.vibration}
                        onChange={() => toggle('vibration')}
                        disabled={syncing}
                    />
                </View>

                <Text style={styles.title}>Alertas da Caixa</Text>
                <View style={styles.box}>
                    <SwitchRow
                        label='Alerta Sonoro'
                        value={settings.sound}
                        onChange={() => toggle('sound')}
                        disabled={syncing}
                    />
                    <SwitchRow
                        label='Alerta Luminoso'
                        value={settings.light}
                        onChange={() => toggle('light')}
                        disabled={syncing}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
        width: '100%',
    },
    content: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingBottom: 100,
    },
    screenTitle: {
        fontSize: 30,
        color: '#31AEAE',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    title: {
        color: '#647272',
        fontSize: 24,
        textAlign: 'center',
        marginTop: 12,
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 21,
        padding: 10,
        marginVertical: 10,
        width: '90%',
        gap: 8,
    },
    boxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 6,
    },
})