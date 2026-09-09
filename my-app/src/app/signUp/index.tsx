import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native'
import { useState } from 'react'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter } from 'expo-router'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '../../config/firebaseConfig'
import { signUpSchema, type SignUpData } from '../../schemas/authSchema'

export default function signUp(){

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)
    
    const {control, handleSubmit, formState: {errors}} = useForm<SignUpData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {fullName: '', email: '', password: '', confirmPassword: '', ipBox: '',}
    })

    const handleSignUpData = async (data: SignUpData) => {
        setIsLoading(true)

        const cleanEmail = data.email.trim().toLowerCase()

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password)
            const user = userCredential.user

            console.log('Usuário cadastrado com sucesso. Credenciais:', userCredential.user)

            await signOut(auth)

            Alert.alert('', 'Cadastro realizado com sucesso. Ir para a tela de Login.', [
                {
                    text: 'OK',
                    onPress: () => router.push('/login')
                }
            ])
        } catch (error: any) {
            console.error('Erro no Firebase:', error)
        } finally {
            setIsLoading(false)
            console.log('Cadastro finalizado. Dados inseridos:', data)
        }
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <Text>Tela Cadastro</Text>
                
                <AppText> Nome Completo </AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='fullName'
                        render= {({field: {onChange, onBlur, value} }) => (
                            <Input 
                                placeholder=''
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.fullName && <AppText>{errors.fullName.message}</AppText>}
                </View>

                <AppText> E-mail </AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='email'
                        render= {({field: {onChange, onBlur, value} }) => (
                            <Input 
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

                <AppText>Senha</AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='password'
                        render= {({field: {onChange, onBlur, value} }) => (
                            <Input 
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

                <AppText>Confirmar Senha</AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='confirmPassword'
                        render= {({field: {onChange, onBlur, value} }) => (
                            <Input 
                                placeholder=''
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry={true}
                                autoCapitalize='none'
                            />
                        )}
                    />
                    {errors.confirmPassword && <AppText>{errors.confirmPassword.message}</AppText>}
                </View>

                <AppText>IP da Caixa</AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='ipBox'
                        render= {({field: {onChange, onBlur, value} }) => (
                            <Input 
                                placeholder=''
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.ipBox && <AppText>{errors.ipBox.message}</AppText>}
                </View>

                <Button 
                    label={isLoading ? 'Aguarde...' : 'Cadastrar'}
                    onPress={ handleSubmit(handleSignUpData) }
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