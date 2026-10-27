import { useState } from 'react'
import { View, ScrollView, Switch, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../components/Button'
import { AppText } from '../../../components/AppText'

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
    const [notificar, setNotificar] = useState(false)

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                style={styles.conteudo}
                contentContainerStyle={styles.conteudoInterno}
                showsVerticalScrollIndicator={false}
            >
                
                <AppText style={styles.tituloSecao}>Configurações Gerais</AppText>

                <View style={styles.card}>
        
                    <View style={styles.linha}>
                        <AppText style={styles.rotulo}>Status da Caixa:</AppText>
                        <View style={styles.colunaValor}>
                            <View style={styles.pill}>
                                <View style={styles.bolinha} />
                                <AppText style={styles.pillTexto}>Ligada</AppText>
                            </View>
                        </View>
                    </View>

              
                    <View style={styles.linha}>
                        <AppText style={styles.rotulo}>Bateria:</AppText>
                        <View style={styles.colunaValor}>
                            <View style={styles.pill}>
                                <View style={styles.bateria} />
                                <AppText style={styles.pillTexto}>100%</AppText>
                            </View>
                        </View>
                    </View>

                    <Button
                        label="Sincronizar"
                        variant="blue"
                        style={styles.botaoSincronizar}
                    />

                    <AppText style={styles.ultimaSync}>
                        Última sincronização feita em 08/04/2026
                    </AppText>

                    <View style={styles.divisor} />
                </View>

             
                <AppText style={styles.tituloSecao}>Notificações</AppText>

                <View style={[styles.card, styles.cardNotificacao]}>
                    <AppText style={styles.textoNotificacao}>
                        Notificar com 5 minutos de antecedência
                    </AppText>
                    <Switch
                        value={notificar}
                        onValueChange={setNotificar}
                        trackColor={{ false: cores.primaria, true: cores.primaria }}
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
    ultimaSync: {
        fontSize: 10,
        color: cores.textoSecundario,
        textAlign: 'center',
        marginBottom: 16,
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
})