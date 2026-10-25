import {View,  StyleSheet, Image} from 'react-native'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter, } from 'expo-router'
import {  Controller, useForm } from 'react-hook-form'
import { loginSchema, type LoginData } from '../../schemas/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'



export default function esqueciSenha(){

    const router = useRouter();

    const {control, handleSubmit, formState: {errors}} = useForm<LoginData>({
            resolver: zodResolver(loginSchema),
            defaultValues: {email: '', password: '', ipBox: ''}
        })

    return (

        <View style={styles.container}>
            <View>
                <Image source={require('../../../assets/Chronomedi.png')}
                    style={{height: 200, width: 250}}
                />
            </View>

            <AppText style={{fontWeight: 'bold', fontSize: 26, marginBottom: 30}}> 
                Recuperar Senha
            </AppText>

            <AppText> E-mail </AppText>
            <View style={{width: '90%'}}>
                <Controller
                    control={control}
                    name='email'
                    render= {({field: {onChange, onBlur, value} }) => (
                        <Input 
                            style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 6,
                                    elevation: 4,
                                }}
                            placeholder=''
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                    )}
                />
                {errors.email && <AppText>{errors.email.message}</AppText>}
            </View>

            <Button 
                label='Enviar'
                onPress={()=>{}}
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