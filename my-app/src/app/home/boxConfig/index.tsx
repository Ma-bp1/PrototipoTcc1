import { useEffect, useState } from 'react'
import { View, ScrollView, Switch, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../components/Button'
import { AppText } from '../../../components/AppText'
import { useBox, STATUS, enviarAgendaParaCaixa } from '../../../hooks/useBox'
import { AlertSettings, getAlertSettings, saveAlertSettings } from '@/src/services/alertSettings'
import { rescheduleAllMedications } from '@/src/services/rescheduleAll'

const cores = {
    primaria: '#2DB5B0',
    texto: '#05534E',
    fundo: '#F3F3F3',
    branco: '#FFFFFF',
    pill: '#F3F3F3',
    divisor: '#E6E6E6',
    textoSecundario: '#6B6B6B',
}


export default function BoxConfigScreen() {
    const [settings, setSettings] = useState<AlertSettings | null>(null)

    useEffect(() => {
    getAlertSettings().then(setSettings)
    }, [])

    const alternarAntecedencia = async (valor: boolean) => {
    if (!settings) return
        const anterior = settings
        const novo = { ...settings, advance5: valor }
        setSettings(novo)
    try {
        await saveAlertSettings(novo)
        if (novo.medAlert) await rescheduleAllMedications()
        await enviarAgendaParaCaixa().catch(() => {})
    } catch {
        setSettings(anterior)
        await saveAlertSettings(anterior).catch(() => {})
        Alert.alert('Não foi possível salvar.', 'Tente novamente.')
    }
    }

    const [codigo, setCodigo] = useState('')
    const { box, status, ultimaSync, carregando, vincular, sincronizar } = useBox()
    const { label, cor, fundo } = STATUS[status]

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                style={styles.conteudo}
                contentContainerStyle={styles.conteudoInterno}
                showsVerticalScrollIndicator={false}
            >
                {/* Sem caixa vinculada: formulário de vínculo */}
                {!box && (
                    <View style={styles.card}>
                        <AppText style={styles.rotulo}>Código da caixa (aparece no Monitor Serial)</AppText>
                        <TextInput
                            value={codigo}
                            onChangeText={setCodigo}
                            placeholderTextColor='#999'
                            autoCapitalize="characters"
                            placeholder="A0B1C2D3E4F5"
                            style={{ backgroundColor: cores.pill, borderRadius: 8, padding: 10, marginVertical: 12 }}
                        />
                        <Button
                            label={carregando ? 'Vinculando...' : 'Vincular caixa'}
                            variant="blue"
                            onPress={() => vincular(codigo)}
                        />
                    </View>
                )}

                {/* Com caixa vinculada: configurações gerais */}
                {box && (
                    <>
                        <AppText style={styles.tituloSecao}>Configurações Gerais</AppText>

                        <View style={styles.card}>
                            <View style={styles.linhaStatus}>
                                <AppText style={styles.rotuloStatus}>Status da caixa</AppText>

                                <View style={[styles.statusPill, { backgroundColor: fundo }]}>
                                    <View style={[styles.statusBolinha, { backgroundColor: cor }]} />
                                    <AppText style={[styles.statusTexto, { color: cor }]}>
                                        {label}
                                    </AppText>
                                </View>
                            </View>

                            <View style={styles.divisor} />

                            <Pressable
                                onPress={sincronizar}
                                disabled={carregando}
                                style={({ pressed }) => [
                                    styles.botaoSync,
                                    pressed && styles.botaoSyncPressionado,
                                    carregando && styles.botaoSyncDesabilitado,
                                ]}
                            >
                                {carregando && <ActivityIndicator size="small" color={cores.branco} />}
                                <AppText style={styles.botaoSyncTexto}>
                                    {carregando ? 'Sincronizando...' : 'Sincronizar agora'}
                                </AppText>
                            </Pressable>

                            <AppText style={styles.ultimaSync}>
                                {ultimaSync ? `Última sincronização feita em ${ultimaSync}` : 'Ainda não sincronizada'}
                            </AppText>
                        </View>
                    </>
                )}

                <AppText style={styles.tituloSecao}>Noficações</AppText>

                <View style={[styles.card, styles.cardNotificacao]}>
                    <AppText style={styles.textoNotificacao}>
                        Notificar com 5 minutos de antecedência
                    </AppText>
                    <Switch
                        value={settings?.advance5 ?? false}
                        onValueChange={alternarAntecedencia}
                        disabled={!settings}
                        trackColor={{ false: '#FF6B8A', true: cores.primaria }}
                        ios_backgroundColor={cores.primaria}
                        thumbColor={cores.branco}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    conteudo: {
        flex: 1,
        backgroundColor: cores.fundo,
    },
    conteudoInterno: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    tituloSecao: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
    card: {
        backgroundColor: cores.branco,
        borderRadius: 21,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    // Status / Bateria: rótulos alinhados à direita, valores à esquerda
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    rotulo: {
        width: '48%',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
        paddingRight: 12,
    },
    colunaValor: {
        flex: 1,
        alignItems: 'flex-start',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: cores.pill,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        minWidth: 84,
    },
    pillTexto: {
        fontSize: 12,
        fontWeight: '500',
    },
    bolinha: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: cores.primaria,
    },
    bateria: {
        width: 14,
        height: 8,
        borderRadius: 2,
        backgroundColor: cores.primaria,
    },
    botaoSincronizar: {
        width: 'auto',
        height: 28,
        alignSelf: 'center',
        paddingHorizontal: 18,
        paddingVertical: 0,
        marginTop: 6,
        marginBottom: 8,
    },
    divisor: {
        height: 1,
        backgroundColor: cores.divisor,
    },
    cardNotificacao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    textoNotificacao: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    linhaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    },
    rotuloStatus: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.texto,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusBolinha: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusTexto: {
        fontSize: 13,
        fontWeight: '600',
    },
    botaoSync: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 44,
        borderRadius: 12,
        backgroundColor: cores.primaria,
        marginTop: 14,
    },
    botaoSyncPressionado: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    botaoSyncDesabilitado: {
        opacity: 0.6,
    },
    botaoSyncTexto: {
        color: cores.branco,
        fontSize: 15,
        fontWeight: '600',
    },
    ultimaSync: {
        fontSize: 12,
        color: cores.textoSecundario,
        textAlign: 'center',
        marginTop: 10,
    },
})