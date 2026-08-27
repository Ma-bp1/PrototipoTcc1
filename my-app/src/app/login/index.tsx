import {View, Text, StyleSheet} from 'react-native'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter, Link } from 'expo-router'

export default function Home(){

    const router = useRouter();

    return (

        <View style={styles.container}>
            <Text>Login Screen</Text>
            
            <AppText> E-mail </AppText>
            <View style={{width: '90%'}}>
                <Input/>
            </View>

            <AppText> Senha </AppText>
            <View style={{width: '90%'}}>
                <Input/>
            </View>

            <AppText>Ip da Caixa</AppText>
            <View style={{width: '90%'}}>
                <Input/>
            </View>

            <AppText fontSize={18}> Esqueci minha Senha </AppText>
            
            <Link href='/signUp'>
                <AppText fontSize={18}> Não tem cadastro ainda? Cadastre-se. </AppText>
            </Link>
            
            
            <Button 
                label='Entrar'
                onPress={()=> router.push('/home')}
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