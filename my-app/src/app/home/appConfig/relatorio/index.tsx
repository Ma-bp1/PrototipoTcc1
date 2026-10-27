import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../../components/Button'
import { Input } from '../../../../components/Input'
import { AppText } from '../../../../components/AppText'
import { QuestionButton } from '../../../../components/QuestionButton'

const cores = {
    primaria: '#2DB5B0',
    texto: '#05534E',
    fundo: '#F3F3F3',
    branco: '#FFFFFF',
    campoData: '#D3D3D3',
    textoRelatorio: '#555555',
}

const RELATORIO_EXEMPLO = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In suscipit gravida magna non congue. Nunc vestibulum mauris vel ipsum lobortis, id imperdiet ex tristique. Phasellus dapibus at lectus vel aliquam. Nulla facilisi. Sed id nibh lorem. Pellentesque luctus turpis ac elit pulvinar, volutpat dapibus libero varius. Morbi molestie arcu non dui imperdiet vestibulum. Cras semper in lacus eget pulvinar. Praesent ac metus tempus, tempus nibh sit amet, venenatis est. Duis vel ullamcorper ex.

Suspendisse sed metus elementum, ultrices sapien sit, efficitur massa. Nullam felis neque, gravida id tortor et, feugiat consectetur lectus. Sed maximus porttitor dolor vel dictum. Integer mattis feugiat odio eu efficitur. Duis sit amet euismod metus, non molestie libero. Sed auctor felis enim, eu ullamcorper purus dignissim et.`

export default function RelatorioUsoMedicamentoScreen({ navigation }: any) {
    const [modalPremium, setModalPremium] = useState(false)

    const irParaPremium = () => {
        setModalPremium(false)
        router.push('/premium') // ajuste para a rota real da tela Premium
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>

            <ScrollView
                style={styles.conteudo}
                contentContainerStyle={styles.conteudoInterno}
                showsVerticalScrollIndicator={false}
            >
                {/* Ajuda */}
                <QuestionButton
                    style={styles.ajuda}
                    titulo="Relatório de uso"
                    paragrafos={[
                        'Selecione o período desejado para gerar o relatório de uso dos medicamentos.',
                        'Depois, use o botão Imprimir/Salvar para exportar o relatório.',
                    ]}
                />

                {/* Seleção de período */}
                <AppText fontSize={18} style={styles.tituloPeriodo}>
                    Selecione entre um período:
                </AppText>

                <AppText style={[{fontSize: 12}, styles.ultimaExclusao]}>
                    Última exclusão em 12/03/26, 12:00
                </AppText>

                <View style={styles.linhaPeriodo}>
                    <AppText fontSize={18} style={styles.rotuloPeriodo}>De</AppText>
                    <Input
                        style={styles.campoData}
                        defaultValue="01/04/26"
                        textAlign="center"
                    />
                    <AppText fontSize={18} style={styles.rotuloPeriodo}>A</AppText>
                    <Input
                        style={styles.campoData}
                        defaultValue="13/04/26"
                        textAlign="center"
                    />
                </View>

                {/* Card do relatório */}
                <View style={styles.card}>
                    <View style={styles.relatorioBox}>
                        <AppText style={[{fontSize: 12}, styles.relatorioTexto]}>
                            {RELATORIO_EXEMPLO}
                        </AppText>
                    </View>

                    <Button
                        label="Imprimir/Salvar"
                        variant="blue"
                        style={styles.botaoImprimir}
                        onPress={() => setModalPremium(true)}
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
    conteudo: {
        flex: 1,
        backgroundColor: cores.fundo,
    },
    // Padding movido para cá para rolar junto com o conteúdo
    conteudoInterno: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    ajuda: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    tituloPeriodo: {
        fontWeight: '600',
        marginBottom: 8,
        paddingRight: 36, // espaço para o botão de ajuda
    },
    ultimaExclusao: {
        marginBottom: 12,
        marginLeft: 4,
    },
    linhaPeriodo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    rotuloPeriodo: {
        fontWeight: '600',
    },
    // Sobrescreve o Input padrão (que é grande e cinza claro)
    campoData: {
        width: 110,
        height: 34,
        marginTop: 0,
        marginBottom: 0,
        padding: 0,
        borderRadius: 8,
        backgroundColor: cores.campoData,
        fontSize: 18,
        fontWeight: '600',
        color: cores.texto,
    },
    // Sem flex: 1, o card cresce conforme o tamanho do relatório
    card: {
        backgroundColor: cores.branco,
        borderRadius: 30,
        padding: 20,
        marginBottom: 12,
        alignItems: 'center',
    },
    relatorioBox: {
        width: '100%',
        backgroundColor: cores.fundo,
        borderRadius: 21,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    relatorioTexto: {
        color: cores.textoRelatorio,
        lineHeight: 15,
    },
    botaoImprimir: {
        width: 'auto',
        height: 44,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingVertical: 0,
        marginTop: 12,
        marginBottom: 0,
    },
})