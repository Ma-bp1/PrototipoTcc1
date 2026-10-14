import React, { useState } from 'react'
import {
    GestureResponderEvent,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from 'react-native'

type QuestionButtonProps = TouchableOpacityProps & {
    /** Título do modal. Junto com `paragrafos`, ativa o modal de ajuda. */
    titulo?: string
    /** Um texto por parágrafo. */
    paragrafos?: string[]
    /** Texto do botão que fecha o modal. */
    textoFechar?: string
}

export function QuestionButton({
    style,
    titulo,
    paragrafos,
    textoFechar = 'Ok',
    onPress,
    ...rest
}: QuestionButtonProps) {
    const [visivel, setVisivel] = useState(false)

    // Sem título nem parágrafos, o botão se comporta como antes (só chama onPress)
    const temModal = Boolean(titulo) || Boolean(paragrafos?.length)

    const abrir = (e: GestureResponderEvent) => {
        if (temModal) setVisivel(true)
        onPress?.(e)
    }

    const fechar = () => setVisivel(false)

    return (
        <>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Ajuda"
                style={[styles.container, style]}
                {...rest}
                onPress={abrir}
            >
                <Text style={styles.label}>?</Text>
            </TouchableOpacity>

            {temModal && (
                <Modal
                    visible={visivel}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={fechar}
                >
                    {/* Tocar fora do modal fecha */}
                    <Pressable style={styles.backdrop} onPress={fechar}>
                        {/* Pressable vazio para o toque dentro do modal não fechar */}
                        <Pressable style={styles.modal} onPress={() => {}}>
                            {titulo ? (
                                <View style={styles.cabecalho}>
                                    <View style={styles.iconeTitulo}>
                                        <Text style={styles.iconeLabel}>?</Text>
                                    </View>
                                    <Text style={styles.titulo}>{titulo}</Text>
                                </View>
                            ) : null}

                            <ScrollView style={styles.corpo}>
                                {paragrafos?.map((texto, i) => (
                                    <Text key={i} style={styles.paragrafo}>
                                        {texto}
                                    </Text>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={styles.botaoOk} onPress={fechar}>
                                <Text style={styles.botaoOkLabel}>{textoFechar}</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 30,
        height: 30,
        backgroundColor: '#FF6B8A',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 16,
    },
    label: {
        color: 'white',
        fontSize: 16,
    },

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        width: '100%',
        maxWidth: 380,
        maxHeight: '90%',
        backgroundColor: '#FFF',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignItems: 'center',
    },
    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    iconeTitulo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF6B8A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconeLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    titulo: {
        flexShrink: 1,
        fontSize: 26,
        fontWeight: 'bold',
        color: '#EC516A',
    },
    corpo: {
        alignSelf: 'stretch',
        flexGrow: 0,
    },
    paragrafo: {
        fontSize: 17,
        lineHeight: 26,
        color: '#05534E',
        marginBottom: 20,
    },
    botaoOk: {
        backgroundColor: '#FF6B8A',
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 48,
        marginTop: 4,
    },
    botaoOkLabel: {
        color: 'white',
        fontSize: 18,
    },
})