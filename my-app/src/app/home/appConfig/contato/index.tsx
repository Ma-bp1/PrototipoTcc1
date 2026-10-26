import { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {AppText} from '../../../../components/AppText'
import {Input} from '../../../../components/Input'
import {Button} from '../../../../components/Button'

export default function Contato() {
    const router = useRouter()

    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!message.trim()) {
            Alert.alert('Atenção', 'Digite uma mensagem antes de enviar.')
            return
        }

        setIsLoading(true)

        try {
            // TODO: enviar a mensagem para o backend / Firebase
            console.log('Mensagem enviada:', message.trim())

            Alert.alert('Enviado', 'Sua mensagem foi enviada com sucesso!')
            setMessage('')
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error)
            Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.container}>

            <View style={styles.content}>
                <AppText style={styles.title}>
                    Digite aqui o que deseja comunicar:
                </AppText>

                <Input
                    style={styles.textArea}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical='top'
                    placeholder=''
                />

                <AppText style={styles.info}>
                    Um atendente irá responder o seu pedido via e-mail em até 72 horas.
                </AppText>

                <View style={styles.buttonWrapper}>
                    <Button
                        label={isLoading ? 'Enviando...' : 'Enviar'}
                        onPress={handleSend}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        bottom: 18,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0B5C5C',
        marginBottom: 14,
    },
    textArea: {
        height: 140,
        backgroundColor: '#DDE6E4',
        borderRadius: 16,
        padding: 12,
    },
    info: {
        fontSize: 13,
        color: '#7A7A7A',
        marginTop: 16,
    },
    buttonWrapper: {
        marginTop: 20,
        alignItems: 'center',
    },
})