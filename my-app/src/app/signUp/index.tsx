import {View, Text, StyleSheet, ScrollView} from 'react-native'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter, Link } from 'expo-router'

export default function Home(){

    const router = useRouter();

    return (
        <ScrollView>
            <View style={styles.container}>
                <Text>Tela Cadastro</Text>
                
                <AppText> Nome Completo </AppText>
                <View style={{width: '90%'}}>
                    <Input/>
                </View>

                <AppText> E-mail </AppText>
                <View style={{width: '90%'}}>
                    <Input/>
                </View>

                <AppText>Senha</AppText>
                <View style={{width: '90%'}}>
                    <Input/>
                </View>

                <AppText>Confirmar Senha</AppText>
                <View style={{width: '90%'}}>
                    <Input/>
                </View>

                <AppText>IP da Caixa</AppText>
                <View style={{width: '90%'}}>
                    <Input/>
                </View>

                <Button 
                    label='Cadastrar'
                    onPress={()=> router.push('/home')}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})