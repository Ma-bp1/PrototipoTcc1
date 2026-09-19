import {View,  StyleSheet, Image} from 'react-native'
import { useState } from 'react'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter, Link } from 'expo-router'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import { loginSchema, type LoginData } from '../../schemas/authSchema'


export default function Home(){

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false)

    const {control, handleSubmit, formState: {errors}} = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: '', password: '', ipBox: ''}
    })

    const handleLoginData = async (data: LoginData) => {
        setIsLoading(true)

        const cleanEmail = data.email.trim().toLowerCase()

        try{
            const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, data.password)

            console.log('Usuário logado com sucesso. Credenciais:', userCredential.user)

            /* router.replace('/home') -> adicionar para o usuário não poder 'voltar' a tela de login*/

            router.push('/home')

        } catch (error: any) {
            console.error('Erro ao fazer login:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (

        <View style={styles.container}>
            <View>
                <Image source={require('../../../assets/Chronomedi.png')}
                    style={{height: 200, width: 250}}
                />
            </View>

            <AppText style={{fontWeight: 'bold', fontSize: 26, marginBottom: 30}}> 
                Login 
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

            <AppText> Senha </AppText>
            <View style={{width: '90%'}}>
                <Controller
                    control={control}
                    name='password'
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
                            secureTextEntry={true}
                            autoCapitalize='none'
                        />
                    )}
                />
                {errors.password && <AppText>{errors.password.message}</AppText>}
            </View>

            <AppText>Ip da Caixa</AppText>
            <View style={{width: '90%'}}>
                <Controller
                    control={control}
                    name='ipBox'
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
                        />
                    )}
                />
                {errors.ipBox && <AppText>{errors.ipBox.message}</AppText>}
            </View>

            <AppText fontSize={18} style={{textAlign: 'left', marginLeft: 40, width: '100%', color: '#198289'}}> Esqueci minha Senha </AppText>
            
            <Link href='/signUp' asChild>
                <AppText fontSize={18} style={{textAlign: 'left', marginLeft: 40, marginTop: 10, width: '100%', color: '#198289'}}> Não tem cadastro ainda? Cadastre-se. </AppText>
            </Link>
            
            
            <Button 
                label={isLoading ? 'Entrando...' : 'Entrar'}
                onPress={ handleSubmit(handleLoginData) }
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