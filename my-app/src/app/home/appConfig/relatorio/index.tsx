import { useEffect, useState } from 'react'
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import * as Print from 'expo-print'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Button } from '../../../../components/Button'
import { AppText } from '../../../../components/AppText'
import { QuestionButton } from '../../../../components/QuestionButton'
import {
    gerarRelatorio,
    limparRelatorio,
    buscarUltimaExclusao,
} from '../../../../services/reportService'
import {
    inicioDoDia,
    formatarData,
    formatarDataHora,
    dataParaArquivo,
} from '../../../../utils/data'

const cores = {
    primaria: '#2DB5B0',
    texto: '#05534E',
    fundo: '#F3F3F3',
    branco: '#FFFFFF',
    campoData: '#D3D3D3',
    textoRelatorio: '#555555',
    perigo: '#D9534F',
}

type Campo = 'de' | 'ate'

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// HTML que será convertido em PDF pelo expo-print
function montarHtml(de: Date, ate: Date, texto: string) {
    return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #333; }
          h1 { color: ${cores.texto}; font-size: 22px; margin-bottom: 4px; }
          h2 { font-size: 14px; font-weight: normal; color: #777; margin-top: 0; }
          p { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Relatório de uso de medicamentos</h1>
        <h2>Período: ${formatarData(de)} a ${formatarData(ate)}</h2>
        <p>${escapeHtml(texto)}</p>
      </body>
    </html>`
}

export default function RelatorioUsoMedicamentoScreen() {
    const hoje = inicioDoDia(new Date())

    const [de, setDe] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
    const [ate, setAte] = useState(hoje)

    const [relatorio, setRelatorio] = useState('')
    const [ultimaExclusao, setUltimaExclusao] = useState<Date | null>(null)

    const [carregando, setCarregando] = useState(false)
    const [gerando, setGerando] = useState(false)
    const [limpando, setLimpando] = useState(false)

    // Usado só no iOS (modal do seletor de data)
    const [campoAberto, setCampoAberto] = useState<Campo | null>(null)
    const [dataTemp, setDataTemp] = useState(hoje)

    const carregarRelatorio = async () => {
        setCarregando(true)
        try {
            setRelatorio(await gerarRelatorio(de, ate))
        } catch (e) {
            setRelatorio('')
            Alert.alert('Erro', 'Não foi possível carregar o relatório.')
        } finally {
            setCarregando(false)
        }
    }

    // Recarrega o relatório sempre que o período muda
    useEffect(() => {
        carregarRelatorio()
    }, [de, ate])

    // Busca a data da última exclusão ao abrir a tela
    useEffect(() => {
        buscarUltimaExclusao()
            .then(setUltimaExclusao)
            .catch(() => {})
    }, [])

    // Aplica a data escolhida mantendo "De" <= "A"
    const aplicarData = (campo: Campo, valor: Date) => {
        const d = inicioDoDia(valor)
        if (campo === 'de') {
            setDe(d)
            if (d > ate) setAte(d)
        } else {
            setAte(d)
            if (d < de) setDe(d)
        }
    }

    const abrirPicker = (campo: Campo) => {
        const valorAtual = campo === 'de' ? de : ate

        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: valorAtual,
                mode: 'date',
                maximumDate: hoje,
                onChange: (event, selecionada) => {
                    if (event.type === 'set' && selecionada) aplicarData(campo, selecionada)
                },
            })
        } else {
            setDataTemp(valorAtual)
            setCampoAberto(campo)
        }
    }

    const confirmarDataIos = () => {
        if (campoAberto) aplicarData(campoAberto, dataTemp)
        setCampoAberto(null)
    }

    // Apaga do Firebase os registros do período escolhido
    const limpar = async () => {
        try {
            setLimpando(true)
            await limparRelatorio(de, ate)
            setUltimaExclusao(new Date())
            await carregarRelatorio()
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível limpar o relatório.')
        } finally {
            setLimpando(false)
        }
    }

    const confirmarLimpeza = () => {
        Alert.alert(
            'Limpar relatório',
            `Deseja apagar todos os registros de ${formatarData(de)} a ${formatarData(ate)}? Essa ação não pode ser desfeita.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar', style: 'destructive', onPress: limpar },
            ]
        )
    }

    // Gera o PDF e abre a folha de compartilhamento (salvar em arquivos, imprimir, etc.)
    const baixarPdf = async () => {
        if (carregando || gerando) return
        try {
            setGerando(true)

            const { uri } = await Print.printToFileAsync({
                html: montarHtml(de, ate, relatorio),
            })

            // Renomeia o arquivo temporário para um nome legível
            const novoUri = `${FileSystem.cacheDirectory}relatorio-uso_${dataParaArquivo(de)}_${dataParaArquivo(ate)}.pdf`
            await FileSystem.moveAsync({ from: uri, to: novoUri })

            await Sharing.shareAsync(novoUri, {
                mimeType: 'application/pdf',
                UTI: 'com.adobe.pdf',
                dialogTitle: 'Salvar relatório',
            })
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível gerar o PDF.')
        } finally {
            setGerando(false)
        }
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                style={styles.conteudo}
                contentContainerStyle={styles.conteudoInterno}
                showsVerticalScrollIndicator={false}
            >
                <QuestionButton
                    style={styles.ajuda}
                    titulo="Relatório de uso"
                    paragrafos={[
                        'Selecione o período desejado para gerar o relatório de uso dos medicamentos.',
                        'Use o botão Imprimir/Salvar para exportar o relatório ou Limpar período para apagar os registros do período escolhido.',
                    ]}
                />

                <AppText fontSize={18} style={styles.tituloPeriodo}>
                    Selecione entre um período:
                </AppText>

                <AppText style={[{ fontSize: 12 }, styles.ultimaExclusao]}>
                    {ultimaExclusao
                        ? `Última exclusão em ${formatarDataHora(ultimaExclusao)}`
                        : 'Nenhuma exclusão realizada'}
                </AppText>

                <View style={styles.linhaPeriodo}>
                    <AppText fontSize={18} style={styles.rotuloPeriodo}>De</AppText>
                    <TouchableOpacity
                        style={styles.campoData}
                        activeOpacity={0.7}
                        onPress={() => abrirPicker('de')}
                    >
                        <Text style={styles.campoDataTexto}>{formatarData(de)}</Text>
                    </TouchableOpacity>

                    <AppText fontSize={18} style={styles.rotuloPeriodo}>A</AppText>
                    <TouchableOpacity
                        style={styles.campoData}
                        activeOpacity={0.7}
                        onPress={() => abrirPicker('ate')}
                    >
                        <Text style={styles.campoDataTexto}>{formatarData(ate)}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <View style={styles.relatorioBox}>
                        {carregando ? (
                            <ActivityIndicator color={cores.primaria} style={styles.carregando} />
                        ) : (
                            <AppText style={[{ fontSize: 12 }, styles.relatorioTexto]}>
                                {relatorio}
                            </AppText>
                        )}
                    </View>

                    <Button
                        label={gerando ? 'Gerando...' : 'Imprimir/Salvar'}
                        variant="blue"
                        style={styles.botao}
                        onPress={baixarPdf}
                    />

                    <Button
                        label={limpando ? 'Limpando...' : 'Limpar período'}
                        variant="blue"
                        style={[styles.botao, { backgroundColor: cores.perigo }]}
                        onPress={confirmarLimpeza}
                    />
                </View>
            </ScrollView>

            {/* Seletor de data do iOS */}
            <Modal visible={campoAberto !== null} transparent animationType="slide">
                <View style={styles.modalFundo}>
                    <View style={styles.modalCard}>
                        <DateTimePicker
                            value={dataTemp}
                            mode="date"
                            display="spinner"
                            maximumDate={hoje}
                            onChange={(event, selecionada) => {
                                if (selecionada) setDataTemp(selecionada)
                            }}
                        />
                        <View style={styles.modalBotoes}>
                            <TouchableOpacity onPress={() => setCampoAberto(null)}>
                                <Text style={styles.modalCancelar}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmarDataIos}>
                                <Text style={styles.modalConfirmar}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    conteudo: { flex: 1, backgroundColor: cores.fundo},
    conteudoInterno: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 200 },
    ajuda: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
    tituloPeriodo: { fontWeight: '600', marginBottom: 8, paddingRight: 36 },
    ultimaExclusao: { marginBottom: 12, marginLeft: 4 },
    linhaPeriodo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    rotuloPeriodo: { fontWeight: '600' },
    campoData: {
        width: 110,
        height: 34,
        borderRadius: 8,
        backgroundColor: cores.campoData,
        alignItems: 'center',
        justifyContent: 'center',
    },
    campoDataTexto: { fontSize: 18, fontWeight: '600', color: cores.texto },
    card: {
        backgroundColor: cores.branco,
        borderRadius: 30,
        padding: 20,
        marginBottom: 12,
        alignItems: 'center',
    },
    relatorioBox: {
        width: '100%',
        minHeight: 320,
        backgroundColor: cores.fundo,
        borderRadius: 21,
        padding: 20,
    },
    carregando: { alignSelf: 'center' },
    relatorioTexto: { color: cores.textoRelatorio, lineHeight: 18 },
    botao: {
        width: 'auto',
        height: 44,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingVertical: 0,
        marginTop: 12,
        marginBottom: 0,
    },
    modalFundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
    modalCard: {
        backgroundColor: cores.branco,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: 32,
    },
    modalBotoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        marginTop: 8,
    },
    modalCancelar: { fontSize: 16, color: cores.textoRelatorio },
    modalConfirmar: { fontSize: 16, fontWeight: '600', color: cores.primaria },
})