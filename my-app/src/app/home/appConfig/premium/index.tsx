import React from 'react'
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { QuestionButton } from '../../../../components/QuestionButton'

const qrcode = require('../../../../../assets/qrcode.png')

const cores = {
    primaria: '#2DB5B0', 
    texto: '#0B5C4D',
    fundo: '#F0F0F0',
    branco: '#FFFFFF',
    rosa: '#FF6F91',
}

export default function AdquirirPremiumScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.conteudoWrapper}>
                <QuestionButton
                    style={styles.ajuda}
                    titulo="Como pagar com Pix"
                    paragrafos={[
                        'Escolha o plano desejado (mensal ou anual).',
                        'Abra o app do seu banco e escaneie o QR Code, ou use o Pix Copia e Cola.',
                        'Após o pagamento, seu acesso Premium será liberado.',
                        'O usuário poderá fazer a assinatura premium através de pagamento via PIX. Porém, a cobrança não é automática.'
                    ]}
                />

                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Plano mensal */}
                    <Text style={styles.tituloPlano}>Assinatura - R$ 30 (Mensal)</Text>
                    <View style={styles.qrCard}>
                        <Image source={qrcode} style={styles.qr} resizeMode="contain" />
                    </View>

                    <Text style={styles.instrucao}>
                        Abra o app do seu banco e insira o código copia e cola, ou escaneie o
                        QR Code.
                    </Text>

                    {/* Plano anual */}
                    <Text style={styles.tituloPlano}>Assinatura - R$ 230 (Anual)</Text>
                    <View style={styles.qrCard}>
                        <Image source={qrcode} style={styles.qr} resizeMode="contain" />
                    </View>

                    {/* Ação principal */}
                    <TouchableOpacity style={styles.botaoCopiar} activeOpacity={0.8}>
                        <Text style={styles.botaoCopiarLabel}>Copiar Pix Copia e Cola</Text>
                    </TouchableOpacity>

                    <Text style={styles.prazo}>Prazo de Pagamento: 23h 30m 6s</Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    voltar: {
        position: 'absolute',
        left: 12,
        top: 0,
        bottom: 0,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    voltarIcone: {
        fontSize: 26,
        color: cores.branco,
    },
    conteudoWrapper: {
        flex: 1,
        backgroundColor: cores.fundo,
    },
    ajuda: {
        position: 'absolute',
        top: 10,
        right: 12,
        zIndex: 1,
    },
    conteudo: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 32,
        paddingHorizontal: 24,
    },
    tituloPlano: {
        fontSize: 15,
        fontWeight: '600',
        color: cores.texto,
        textAlign: 'center',
        marginBottom: 12,
    },
    qrCard: {
        backgroundColor: cores.branco,
        padding: 8,
        marginBottom: 12,
    },
    qr: {
        width: 140,
        height: 140,
    },
    instrucao: {
        fontSize: 12,
        color: cores.texto,
        textAlign: 'center',
        marginBottom: 14,
        paddingHorizontal: 8,
    },
    botaoCopiar: {
        marginTop: 16,
        backgroundColor: cores.rosa,
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 22,
    },
    botaoCopiarLabel: {
        color: cores.branco,
        fontSize: 15,
        fontWeight: '600',
    },
    prazo: {
        marginTop: 16,
        fontSize: 12,
        color: cores.texto,
    },
})