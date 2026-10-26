import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, Image, Pressable, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { signOut, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'

import { Button } from '../../../components/Button'
import { auth } from '../../../config/firebaseConfig'
import { Input } from '@/src/components/Input'
import { AppText } from '@/src/components/AppText'

const db = getFirestore(auth.app)

const TEAL = '#1E8A8A'
const TEAL_DARK = '#0F5C5C'
const PINK = '#E5566D'

type FieldKey = 'name' | 'email' | 'password'

type ProfileFieldProps = {
    label: string
    value: string
    editing: boolean
    onChangeText: (text: string) => void
    onPressEdit: () => void
    secureTextEntry?: boolean
    placeholder?: string
}

// Campo com botão de edição (Pressable + ícone Feather)
function ProfileField({
    label,
    value,
    editing,
    onChangeText,
    onPressEdit,
    secureTextEntry,
    placeholder,
}: ProfileFieldProps) {
    return (
        <View style={styles.field}>
            <AppText>{label}</AppText>

            <View>
                <Input
                    value={value}
                    onChangeText={onChangeText}
                    editable={editing}
                    secureTextEntry={secureTextEntry}
                    placeholder={placeholder}
                    autoCapitalize="none"
                />

                <Pressable onPress={onPressEdit} hitSlop={10} style={styles.fieldIcon}>
                    <Feather name={editing ? 'check' : 'edit'} size={20} color={TEAL} />
                </Pressable>
            </View>
        </View>
    )
}

export default function Profile() {
    const router = useRouter()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [photo, setPhoto] = useState<string | null>(null)
    const [editing, setEditing] = useState<FieldKey | null>(null)

    // Carrega os dados do usuário (e-mail vem do Auth; nome e foto, do Firestore)
    useEffect(() => {
        async function loadProfile() {
            const user = auth.currentUser
            if (!user) return

            setEmail(user.email ?? '')
            setName(user.displayName ?? '')

            try {
                const snap = await getDoc(doc(db, 'users', user.uid))
                if (snap.exists()) {
                    setName(snap.data().name ?? user.displayName ?? '')
                    setPhoto(snap.data().photo ?? null)
                }
            } catch (error) {
                console.error('Erro ao carregar o perfil.', error)
            }
        }

        loadProfile()
    }, [])

    async function handlePressEdit(field: FieldKey) {
        // 1º toque: libera o campo para edição
        if (editing !== field) {
            setEditing(field)
            setPassword('')
            return
        }

        // 2º toque: salva
        const user = auth.currentUser
        if (!user) return

        try {
            if (field === 'name') {
                await setDoc(doc(db, 'users', user.uid), { name: name.trim() }, { merge: true })
            }

            if (field === 'email' && email.trim() !== user.email) {
                // O Firebase só troca o e-mail depois que o usuário clica no link enviado
                await verifyBeforeUpdateEmail(user, email.trim())
                setEmail(user.email ?? '')
                Alert.alert('Confirme o novo e-mail', 'Enviamos um link de confirmação para ele.')
            }

            if (field === 'password') {
                if (password.length < 6) {
                    Alert.alert('A senha precisa ter pelo menos 6 caracteres.')
                    return
                }
                await updatePassword(user, password)
                setPassword('')
                Alert.alert('Senha atualizada.')
            }

            setEditing(null)
        } catch (error: any) {
            console.error('Erro ao salvar.', error)
            Alert.alert(
                error?.code === 'auth/requires-recent-login'
                    ? 'Por segurança, saia da conta, entre de novo e tente outra vez.'
                    : 'Não foi possível salvar a alteração.'
            )
        }
    }

    async function handlePickImage() {
        const user = auth.currentUser
        if (!user) return

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2, // qualidade baixa para a imagem caber no Firestore (limite de 1 MB por documento)
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
                <ProfileField
                    label="Nome:"
                    value={name}
                    editing={editing === 'name'}
                    onChangeText={setName}
                    onPressEdit={() => handlePressEdit('name')}
                />

                <ProfileField
                    label="E-mail:"
                    value={email}
                    editing={editing === 'email'}
                    onChangeText={setEmail}
                    onPressEdit={() => handlePressEdit('email')}
                />

                <ProfileField
                    label="Senha:"
                    value={editing === 'password' ? password : '*********'}
                    editing={editing === 'password'}
                    onChangeText={setPassword}
                    onPressEdit={() => handlePressEdit('password')}
                    secureTextEntry={editing === 'password'}
                    placeholder="Nova senha"
                />
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
        paddingBottom: 120, // espaço para a tab bar
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
    buttons: {
        width: '100%',
        marginTop: 24,
        gap: 12,
        alignItems: 'center',
    },
})