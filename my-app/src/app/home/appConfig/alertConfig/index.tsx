import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native'
import { useState } from 'react'
import { AppText } from '../../../../components/AppText'

type SwitchRowProps = {
    label: string
    value: boolean
    onChange: () => void
}

function SwitchRow({ label, value, onChange }: SwitchRowProps) {
    return (
        <View style={styles.boxItem}>
            <View style={{ flex: 1 }}>
                <AppText>{label}</AppText>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#FF6B8A', true: '#31AEAE' }}
                thumbColor='#fff'
            />
        </View>
    )
}

export default function AlertConfig() {
    const [settings, setSettings] = useState({
        medAlert: true,
        lowStock: true,
        timeConflict: true,
        slotConflict: true,
        vibration: false,
        sound: true,
        light: true,
    })

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
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
                    />
                    <SwitchRow
                        label='Baixo Estoque'
                        value={settings.lowStock}
                        onChange={() => toggle('lowStock')}
                    />
                    <SwitchRow
                        label='Conflito de Horário'
                        value={settings.timeConflict}
                        onChange={() => toggle('timeConflict')}
                    />
                    <SwitchRow
                        label='Conflito de Slot'
                        value={settings.slotConflict}
                        onChange={() => toggle('slotConflict')}
                    />
                    <SwitchRow
                        label='Vibração'
                        value={settings.vibration}
                        onChange={() => toggle('vibration')}
                    />
                </View>

                <Text style={styles.title}>Alertas da Caixa</Text>
                <View style={styles.box}>
                    <SwitchRow
                        label='Alerta Sonoro'
                        value={settings.sound}
                        onChange={() => toggle('sound')}
                    />
                    <SwitchRow
                        label='Alerta Luminoso'
                        value={settings.light}
                        onChange={() => toggle('light')}
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