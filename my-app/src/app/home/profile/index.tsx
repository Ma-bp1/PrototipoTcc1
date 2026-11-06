import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, Image, Pressable, ScrollView, KeyboardTypeOptions } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { z } from 'zod'

import { Button } from '../../../components/Button'
import { auth } from '../../../config/firebaseConfig'
import { Input } from '@/src/components/Input'
import { AppText } from '@/src/components/AppText'
import { loginSchema } from '@/src/schemas/authSchema'
import { PasswordInput } from '@/src/components/passwordInput'

const db = getFirestore(auth.app)

const TEAL = '#1E8A8A'
const TEAL_DARK = '#0F5C5C'
const PINK = '#E5566D'

type FieldKey = 'fullName' | 'email' | 'password' | 'ipBox'

type FieldConfig = {
    label: string
    newLabel: string
    schema: z.ZodType
    error: string
    placeholder?: string
    keyboardType?: KeyboardTypeOptions
    secure?: boolean
    isPassword?: boolean
}

// Configuração de cada campo: rótulos, validação (reaproveita o authSchema) e mensagem de erro
const FIELDS: Record<FieldKey, FieldConfig> = {
    fullName: {
        label: 'Nome:',
        newLabel: 'Novo nome:',
        schema: z.string().min(6),
        error: 'O nome precisa ter pelo menos 6 caracteres.',
    },
    email: {
        label: 'E-mail:',
        newLabel: 'Novo e-mail:',
        schema: loginSchema.shape.email,
        error: 'Digite um e-mail válido.',
        keyboardType: 'email-address',
    },
    password: {
        label: 'Senha:',
        newLabel: 'Nova senha:',
        schema: loginSchema.shape.password,
        error: 'A senha precisa ter pelo menos 6 caracteres.',
        placeholder: 'Nova senha',
        secure: true,
        isPassword: true
    },
    ipBox: {
        label: 'IP da caixa:',
        newLabel: 'Novo IP da caixa:',
        schema: loginSchema.shape.ipBox,
        error: 'Digite um IP válido (ex.: 192.168.0.10).',
        placeholder: '192.168.0.10',
        keyboardType: 'numbers-and-punctuation',
    },
}

const FIELD_ORDER: FieldKey[] = ['fullName', 'email', 'password', 'ipBox']

type ProfileFieldProps = {
    config: FieldConfig
    value: string
    editing: boolean
    draft: string
    onChangeDraft: (text: string) => void
    onPressEdit: () => void
    onCancel: () => void
}

// Campo atual (somente leitura) + botão editar/confirmar. Ao editar, surge o campo "Novo ..."
function ProfileField({ config, value, editing, draft, onChangeDraft, onPressEdit, onCancel }: ProfileFieldProps) {
    const newFieldProps = {
        value: draft,
        onChangeText: onChangeDraft,
        placeholder: config.placeholder,
        autoCapitalize: 'none' as const,
        autoFocus: true,
    }
    
    return (
        <View style={styles.field}>
            <AppText>{config.label}</AppText>

            <View>
                <Input value={value} editable={false} autoCapitalize="none" />

                <Pressable onPress={onPressEdit} hitSlop={10} style={styles.fieldIcon}>
                    <Feather name={editing ? 'check' : 'edit'} size={20} color={TEAL} />
                </Pressable>
            </View>

            {editing && (
                <View style={styles.newField}>
                    <AppText>{config.newLabel}</AppText>
                    
                    {config.isPassword ? (
                        <PasswordInput {...newFieldProps} />
                    ) : (
                        <Input {...newFieldProps} keyboardType={config.keyboardType}/>
                    )}
                    <Pressable onPress={onCancel} hitSlop={10}>
                        <Text style={styles.cancel}>Cancelar</Text>
                    </Pressable>
                </View>
            )}
        </View>
    )
}

// TODO: função base do envio do código de verificação do novo e-mail.
// Implementar quando a autenticação por e-mail estiver ativa no Firebase.
// Obs.: o Firebase envia um LINK de confirmação (não um código numérico) com verifyBeforeUpdateEmail.
// Se quiser um código de verdade, será preciso uma Cloud Function própria.
async function sendEmailVerification(newEmail: string) {
     
    console.log('[TODO] enviar verificação para:', newEmail)
}

export default function Profile() {
    const router = useRouter()

    const [data, setData] = useState({ fullName: '', email: '', ipBox: '' })
    const [photo, setPhoto] = useState<string | null>(null)
    const [editing, setEditing] = useState<FieldKey | null>(null)
    const [draft, setDraft] = useState('') //só um campo é editado por vez

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return

            setData((prev) => ({
                ...prev,
                email: user.email ?? '',
                fullName: user.displayName ?? '',
            }))

            try {
                const snap = await getDoc(doc(db, 'users', user.uid))
                if (snap.exists()) {
                    const d = snap.data()
                    setData((prev) => ({
                        ...prev,
                        fullName: d.fullName ?? d.name ?? prev.fullName,
                        ipBox: d.ipBox ?? '',
                    }))
                    setPhoto(d.photo ?? null)
                }
            } catch (error) {
                console.error('Erro ao carregar o perfil.', error)
            }
        })

        return unsubscribe
    }, [])

    function closeEditing() {
        setEditing(null)
        setDraft('')
    }

    function handleSaveError(error: any) {
        console.error('Erro ao salvar.', error)
        Alert.alert(
            error?.code === 'auth/requires-recent-login'
                ? 'Por segurança, saia da conta, entre de novo e tente outra vez.'
                : 'Não foi possível salvar a alteração.'
        )
    }

    async function handlePressEdit(field: FieldKey) {
        // 1º toque: abre o campo "Novo ..."
        if (editing !== field) {
            setEditing(field)
            setDraft('')
            return
        }

        // 2º toque: valida e salva
        const user = auth.currentUser
        if (!user) return

        const config = FIELDS[field]
        const value = field === 'password' ? draft : draft.trim()

        if (!config.schema.safeParse(value).success) {
            Alert.alert(config.error)
            return
        }

        // E-mail: pede confirmação antes de enviar o código de verificação
        if (field === 'email') {
            if (value === user.email) {
                Alert.alert('O novo e-mail é igual ao atual.')
                return
            }

            Alert.alert('Confirmar alteração', `Enviar o código de verificação para ${value}?`, [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar código',
                    onPress: async () => {
                        try {
                            await sendEmailVerification(value)
                            closeEditing()
                            Alert.alert('Verifique seu e-mail', 'Enviamos a confirmação para o novo endereço.')
                        } catch (error) {
                            handleSaveError(error)
                        }
                    },
                },
            ])
            return
        }

        try {
            if (field === 'fullName' || field === 'ipBox') {
                await setDoc(doc(db, 'users', user.uid), { [field]: value }, { merge: true })
                setData((prev) => ({ ...prev, [field]: value }))
            }

            if (field === 'password') {
                await updatePassword(user, value)
                Alert.alert('Senha atualizada.')
            }

            closeEditing()
        } catch (error) {
            handleSaveError(error)
        }
    }

    async function handlePickImage() {
        const user = auth.currentUser
        if (!user) return

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2, // qualidade baixa para a imagem caber no Firestore
            base64: true,
        })

        if (result.canceled) return

        const base64 = result.assets[0].base64
        if (!base64 || base64.length > 900000) {
            Alert.alert('Imagem muito grande. Escolha outra foto.')
            return
        }

        const uri = `data:image/jpeg;base64,${base64}`

        try {
            await setDoc(doc(db, 'users', user.uid), { photo: uri }, { merge: true })
            setPhoto(uri)
        } catch (error) {
            console.error('Erro ao salvar a foto.', error)
            Alert.alert('Não foi possível atualizar a foto.')
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth)
            router.replace('/login')
            Alert.alert('Deslogado com sucesso.')
        } catch (error) {
            console.error('Ocorreu um erro ao deslogar.', error)
            Alert.alert('Ocorreu um erro ao deslogar.')
        }
    }

    // Valor exibido no campo atual (a senha nunca é exibida)
    function displayValue(field: FieldKey) {
        return field === 'password' ? '*********' : data[field]
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/* Foto + botão de editar */}
            <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                    {photo ? (
                        <Image source={{ uri: photo }} style={styles.avatarImage} />
                    ) : (
                        <Feather name="user" size={64} color={TEAL} />
                    )}
                </View>

                <Pressable onPress={handlePickImage} hitSlop={10} style={styles.avatarEdit}>
                    <Feather name="edit" size={22} color={PINK} />
                </Pressable>
            </View>

            <Text style={styles.welcome}>Seja Bem Vindo(a)</Text>

            {/* Dados */}
            <View style={styles.card}>
                {FIELD_ORDER.map((field) => (
                    <ProfileField
                        key={field}
                        config={FIELDS[field]}
                        value={displayValue(field)}
                        editing={editing === field}
                        draft={draft}
                        onChangeDraft={setDraft}
                        onPressEdit={() => handlePressEdit(field)}
                        onCancel={closeEditing}
                    />
                ))}
            </View>

            <View style={styles.buttons}>
                <Button label="Assinar Premium" variant="red" onPress={() => Alert.alert('Em breve!')} />
                <Button label="Sair da Conta" variant="red" onPress={handleLogout} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 120,
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        width: 192,
        height: 192,
    },
    avatar: {
        width: 192,
        height: 192,
        borderRadius: 96,
        overflow: 'hidden',
        backgroundColor: '#E0E8E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarEdit: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        padding: 4,
    },
    welcome: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '800',
        color: TEAL_DARK,
    },
    card: {
        width: '100%',
        marginTop: 28,
        padding: 16,
        borderRadius: 24,
        backgroundColor: '#fff',
        gap: 12,
    },
    field: {
        gap: 4,
    },
    fieldIcon: {
        position: 'absolute',
        right: 14,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    newField: {
        gap: 4,
        marginTop: 4,
    },
    cancel: {
        alignSelf: 'flex-end',
        fontSize: 14,
        color: PINK,
    },
    buttons: {
        width: '100%',
        marginTop: 24,
        gap: 12,
        alignItems: 'center',
    },
})