import { View, Text, StyleSheet, Alert } from 'react-native'
import { Button } from '../../../components/Button'
import { auth } from '../../../config/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'

export default function Profile(){

    const router = useRouter()

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
        <View style = {styles.container}>
            <Text>Profile Screen</Text>

            <Button 
                label='Sair da Conta' 
                variant='red'
                onPress={handleLogout}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
}) 