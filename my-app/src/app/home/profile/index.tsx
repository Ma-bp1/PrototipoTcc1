import { useEffect, useRef, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Modal,
    ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import {
    signOut,
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    verifyBeforeUpdateEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import { Button } from '../../../components/Button'
import { auth } from '../../../config/firebaseConfig'
import { Input } from '@/src/components/Input'
import { AppText } from '@/src/components/AppText'

const TEAL = '#1E8A8A'
const TEAL_DARK = '#0F5C5C'
const PINK = '#E5566D'

type FieldKey = 'name' | 'email' | 'password'

/* -------------------------------------------------------------------------- */
/*  Campo com botão de edição (Pressable + ícone Feather)                      */
/* -------------------------------------------------------------------------- */

type ProfileFieldProps = {
    label: string
    value: string
    editing: boolean
    saving: boolean
    onChangeText: (text: string) => void
    onPressEdit: () => void
    secureTextEntry?: boolean
    placeholder?: string
    keyboardType?: 'default' | 'email-address'
}

function ProfileField({
    label,
    value,
    editing,
    saving,
    onChangeText,
    onPressEdit,
    secureTextEntry,
    placeholder,
    keyboardType = 'default',
}: ProfileFieldProps) {
    return (
        <View style={styles.fieldWrapper}>
            <AppText>{label}</AppText>

            <View>
                <Input
                    value={value}
                    onChangeText={onChangeText}
                    editable={editing}
                    secureTextEntry={secureTextEntry}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Pressable
                    onPress={onPressEdit}
                    disabled={saving}
                    hitSlop={10}
                    style={({ pressed }) => [styles.fieldIcon, pressed && { opacity: 0.5 }]}
                    accessibilityRole="button"
                    accessibilityLabel={editing ? `Salvar ${label}` : `Editar ${label}`}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={TEAL} />
                    ) : (
                        <Feather name={editing ? 'check' : 'edit'} size={20} color={TEAL} />
                    )}
                </Pressable>
            </View>
        </View>
    )
}

/* -------------------------------------------------------------------------- */
/*  Tela                                                                       */
/* -------------------------------------------------------------------------- */

export default function Profile() {
    const router = useRouter()

    // Dados vindos do Firebase
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('') // só preenchida durante a edição
    const [photoURL, setPhotoURL] = useState<string | null>(null)

    // Estado da interface
    const [editing, setEditing] = useState<FieldKey | null>(null)
    const [saving, setSaving] = useState<FieldKey | null>(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)

    // Reautenticação (exigida pelo Firebase para trocar e-mail/senha)
    const [reauthVisible, setReauthVisible] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const pendingAction = useRef<(() => Promise<void>) | null>(null)

    /* ------------------------- Carrega dados do usuário ------------------------ */

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) return
            setName(user.displayName ?? '')
            setEmail(user.email ?? '')
            setPhotoURL(user.photoURL)
        })
        return unsubscribe
    }, [])

    /* ------------------------------- Reautenticação ---------------------------- */

    async function runWithReauth(action: () => Promise<void>) {
        try {
            await action()
        } catch (error: any) {
            if (error?.code === 'auth/requires-recent-login') {
                pendingAction.current = action
                setReauthVisible(true)
                return
            }
            throw error
        }
    }

    async function confirmReauth() {
        const user = auth.currentUser
        if (!user?.email) return

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword)
            await reauthenticateWithCredential(user, credential)
        } catch {
            Alert.alert('Senha atual incorreta.')
            return
        }

        setReauthVisible(false)
        setCurrentPassword('')

        try {
            await pendingAction.current?.()
        } catch (error) {
            console.error('Erro ao salvar após reautenticar.', error)
            Alert.alert('Não foi possível salvar a alteração.')
        } finally {
            pendingAction.current = null
        }
    }

    /* --------------------------------- Salvar campos --------------------------- */

    async function saveName() {
        const user = auth.currentUser
        if (!user) return
        const trimmed = name.trim()
        if (!trimmed) {
            Alert.alert('Digite um nome.')
            return
        }
        await updateProfile(user, { displayName: trimmed })
        setName(trimmed)
        Alert.alert('Nome atualizado.')
    }

    async function saveEmail() {
        const user = auth.currentUser
        if (!user) return
        const trimmed = email.trim()
        if (!trimmed.includes('@')) {
            Alert.alert('Digite um e-mail válido.')
            return
        }
        if (trimmed === user.email) return

        // O Firebase só troca o e-mail depois que o usuário confirma pelo link enviado.
        await runWithReauth(async () => {
            await verifyBeforeUpdateEmail(user, trimmed)
            setEmail(user.email ?? '') // continua mostrando o e-mail atual até confirmar
            Alert.alert(
                'Confirme o novo e-mail',
                `Enviamos um link de confirmação para ${trimmed}. O e-mail será alterado depois que você clicar nele.`
            )
        })
    }

    async function savePassword() {
        const user = auth.currentUser
        if (!user) return
        if (password.length < 6) {
            Alert.alert('A senha precisa ter pelo menos 6 caracteres.')
            return
        }

        await runWithReauth(async () => {
            await updatePassword(user, password)
            setPassword('')
            Alert.alert('Senha atualizada.')
        })
    }

    async function handlePressEdit(field: FieldKey) {
        // 1º toque: entra em modo de edição
        if (editing !== field) {
            setEditing(field)
            setPassword('')
            return
        }

        // 2º toque: salva
        setSaving(field)
        try {
            if (field === 'name') await saveName()
            if (field === 'email') await saveEmail()
            if (field === 'password') await savePassword()
            setEditing(null)
        } catch (error: any) {
            console.error('Erro ao salvar perfil.', error)
            Alert.alert(
                error?.code === 'auth/email-already-in-use'
                    ? 'Esse e-mail já está em uso.'
                    : 'Não foi possível salvar a alteração.'
            )
        } finally {
            setSaving(null)
        }
    }

    /* ----------------------------- Foto de perfil ------------------------------ */

    async function handlePickImage() {
        const user = auth.currentUser
        if (!user) return

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        })

        if (result.canceled) return

        const localUri = result.assets[0].uri
        const previousPhoto = photoURL

        setPhotoURL(localUri) // mostra a nova imagem na hora
        setUploadingPhoto(true)

        try {
            const response = await fetch(localUri)
            const blob = await response.blob()

            // Nome único por upload evita que o React Native mostre a imagem antiga em cache
            const storage = getStorage(auth.app)
            const photoRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}.jpg`)

            await uploadBytes(photoRef, blob, { contentType: 'image/jpeg' })
            const downloadURL = await getDownloadURL(photoRef)

            await updateProfile(user, { photoURL: downloadURL })
            setPhotoURL(downloadURL)
        } catch (error) {
            console.error('Erro ao enviar a foto.', error)
            setPhotoURL(previousPhoto)
            Alert.alert('Não foi possível atualizar a foto.')
        } finally {
            setUploadingPhoto(false)
        }
    }

    /* --------------------------------- Logout ---------------------------------- */

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

    /* ---------------------------------- UI ------------------------------------- */

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/* Avatar + botão de editar foto */}
            <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                    {photoURL ? (
                        <Image source={{ uri: photoURL }} style={styles.avatarImage} />
                    ) : (
                        <Feather name="user" size={64} color={TEAL} />
                    )}

                    {uploadingPhoto && (
                        <View style={styles.avatarLoading}>
                            <ActivityIndicator color="#fff" />
                        </View>
                    )}
                </View>

                <Pressable
                    onPress={handlePickImage}
                    disabled={uploadingPhoto}
                    hitSlop={10}
                    style={({ pressed }) => [styles.avatarEdit, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Alterar foto de perfil"
                >
                    <Feather name="edit" size={22} color={PINK} />
                </Pressable>
            </View>

            <Text style={styles.welcome}>Seja Bem Vindo(a)</Text>

            {/* Card com os dados */}
            <View style={styles.card}>
                <ProfileField
                    label="Nome:"
                    value={name}
                    editing={editing === 'name'}
                    saving={saving === 'name'}
                    onChangeText={setName}
                    onPressEdit={() => handlePressEdit('name')}
                />

                <ProfileField
                    label="E-mail:"
                    value={email}
                    editing={editing === 'email'}
                    saving={saving === 'email'}
                    onChangeText={setEmail}
                    onPressEdit={() => handlePressEdit('email')}
                    keyboardType="email-address"
                />

                <ProfileField
                    label="Senha:"
                    value={editing === 'password' ? password : '*********'}
                    editing={editing === 'password'}
                    saving={saving === 'password'}
                    onChangeText={setPassword}
                    onPressEdit={() => handlePressEdit('password')}
                    secureTextEntry={editing === 'password'}
                    placeholder="Nova senha"
                />
            </View>
            
            <View style={styles.buttons}>
                <Button
                    label="Assinar Premium"
                    variant="red"
                    onPress={() => Alert.alert('Em breve!')}
                />
                <Button label="Sair da Conta" variant="red" onPress={handleLogout} />
            </View>

            {/* Modal de reautenticação */}
            <Modal
                visible={reauthVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setReauthVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Confirme sua identidade</Text>
                        <Text style={styles.modalText}>
                            Para alterar e-mail ou senha, digite sua senha atual.
                        </Text>

                        <Input
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            placeholder="Senha atual"
                            autoCapitalize="none"
                        />

                        <View style={styles.buttons}>
                            <Button label="Confirmar" variant="red" onPress={confirmReauth} />
                            <Pressable
                                onPress={() => {
                                    setReauthVisible(false)
                                    setCurrentPassword('')
                                    pendingAction.current = null
                                }}
                                style={styles.modalCancel}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
    avatarLoading: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
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
    fieldWrapper: {
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

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TEAL_DARK,
    },
    modalText: {
        color: '#4A5B5B',
    },
    modalCancel: {
        padding: 8,
    },
    modalCancelText: {
        color: TEAL,
        fontWeight: '600',
    },
})