import { useEffect, useRef, useState } from 'react'
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
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import * as Print from 'expo-print'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Button } from '../../../../components/Button'
import { AppText } from '../../../../components/AppText'
import { QuestionButton } from '../../../../components/QuestionButton'
import { gerarRelatorio } from '../../../../services/reportService'

const cores = {
    primaria: '#2DB5B0',
    texto: '#05534E',
    fundo: '#F3F3F3',
    branco: '#FFFFFF',
    campoData: '#D3D3D3',
    textoRelatorio: '#555555',
}

type Campo = 'de' | 'ate'

// ---------- Helpers ----------

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const formatarData = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const aa = String(d.getFullYear()).slice(-2)
    return `${dd}/${mm}/${aa}`
}

const dataParaArquivo = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}${mm}${dd}`
}

const nomeDoArquivo = (de: Date, ate: Date) =>
    `relatorio-uso_${dataParaArquivo(de)}_${dataParaArquivo(ate)}`

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// HTML que será convertido em PDF pelo expo-print
function montarHtml(de: Date, ate: Date, texto: string) {
    return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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

// ---------- Tela ----------

export default function RelatorioUsoMedicamentoScreen() {
    const [modalPremium, setModalPremium] = useState(false)

    const hoje = inicioDoDia(new Date())
    const [de, setDe] = useState(new Date(2026, 3, 1))
    const [ate, setAte] = useState(new Date(2026, 3, 13))

    const [relatorio, setRelatorio] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [gerando, setGerando] = useState(false)

    const [dataTemp, setDataTemp] = useState(hoje)

    const requisicaoId = useRef(0)

    const irParaPremium = () => {
        setModalPremium(false)
        router.push('/premium') // ajuste para a rota real da tela Premium
    }

    // Recalcula o relatório sempre que o período muda
    useEffect(() => {
        const id = ++requisicaoId.current
        setCarregando(true)

        gerarRelatorio(de, ate)
            .then(texto => {
                if (id !== requisicaoId.current) return // ignora resposta antiga
                setRelatorio(texto)
            })
            .catch(() => {
                if (id !== requisicaoId.current) return
                setRelatorio('')
                Alert.alert('Erro', 'Não foi possível calcular o relatório.')
            })
            .finally(() => {
                if (id === requisicaoId.current) setCarregando(false)
            })
    }, [de, ate])

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
            
        }
    }

    

    // Gera o PDF em arquivo e entrega ao usuário:
    // - Android: usuário escolhe a pasta (ex.: Downloads) e o PDF é gravado lá
    // - iOS: abre a folha de compartilhamento ("Salvar em Arquivos", Imprimir, etc.)
    const baixarPdf = async () => {
        if (carregando || gerando) return
        try {
            setGerando(true)

            const { uri } = await Print.printToFileAsync({
                html: montarHtml(de, ate, relatorio),
            })
            const nome = nomeDoArquivo(de, ate)

            if (Platform.OS === 'android') {
                const saf = FileSystem.StorageAccessFramework
                const permissao = await saf.requestDirectoryPermissionsAsync()
                if (!permissao.granted) return // usuário cancelou

                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                })
                const destino = await saf.createFileAsync(
                    permissao.directoryUri,
                    nome,
                    'application/pdf'
                )
                await FileSystem.writeAsStringAsync(destino, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                })
                Alert.alert('PDF salvo', 'O relatório foi salvo na pasta escolhida.')
            } else {
                // Renomeia o arquivo temporário para um nome legível
                const novoUri = `${FileSystem.cacheDirectory}${nome}.pdf`
                await FileSystem.moveAsync({ from: uri, to: novoUri })

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(novoUri, {
                        mimeType: 'application/pdf',
                        UTI: 'com.adobe.pdf',
                        dialogTitle: 'Salvar relatório',
                    })
                }
            }
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

                <AppText style={[{ fontSize: 12 }, styles.ultimaExclusao]}>
                    Última exclusão em 12/03/26, 12:00
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

                {/* Card do relatório */}
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
                        style={styles.botaoImprimir}
                        onPress={baixarPdf}
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
    ajuda: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    tituloPeriodo: {
        fontWeight: '600',
        marginBottom: 8,
        paddingRight: 36,
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
    campoData: {
        width: 110,
        height: 34,
        borderRadius: 8,
        backgroundColor: cores.campoData,
        alignItems: 'center',
        justifyContent: 'center',
    },
    campoDataTexto: {
        fontSize: 18,
        fontWeight: '600',
        color: cores.texto,
    },
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
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    carregando: {
        alignSelf: 'center',
    },
    relatorioTexto: {
        color: cores.textoRelatorio,
        lineHeight: 18,
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
    // Modal do picker (iOS)
    modalFundo: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
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
    modalCancelar: {
        fontSize: 16,
        color: cores.textoRelatorio,
    },
    modalConfirmar: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.primaria,
    },
})