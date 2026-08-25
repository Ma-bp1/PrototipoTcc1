import {View, Text, StyleSheet} from 'react-native'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter } from 'expo-router'

export default function Home(){

    const router = useRouter();

    return (

        <View style={styles.container}>
            <Text>Login Screen</Text>
            
            <AppText label="E-mail"/>
            <View style={{width: '90%'}}>
                <Input/>
            </View>

            <AppText label="Senha"/>
            <View style={{width: '90%'}}>
                <Input/>
            </View>

            
            <Button 
                label='Entrar'
                onPress={()=> router.push('/signUp')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})