import {View, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView} from 'react-native'
import { useState } from 'react'
import {Button} from '../../components/Button'
import {Input} from '../../components/Input'
import {AppText} from '../../components/AppText'
import { useRouter, Link } from 'expo-router'
import { Checkbox } from 'expo-checkbox'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '../../config/firebaseConfig'
import { signUpSchema, type SignUpData } from '../../schemas/authSchema'
import { PasswordInput } from '@/src/components/PasswordInput'

export default function signUp(){

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)
    const [isChecked, setChecked] = useState(false);
    
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
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior='height'
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps='handled'
                showsHorizontalScrollIndicator={false}
            >
                <View>
                    <Image source={require('../../../assets/Chronomedi.png')}
                        style={{height: 200, width: 250}}
                    />
                </View>
                <AppText style={{fontWeight: 'bold', fontSize: 26, marginBottom: 30}}> 
                    Cadastro 
                </AppText>
                
                <AppText> Nome Completo </AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='fullName'
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
                    {errors.fullName && <AppText>{errors.fullName.message}</AppText>}
                </View>

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

                <AppText>Senha</AppText>
                <View style={{width: '90%'}}>
                    <Controller
                        control={control}
                        name='password'
                        render= {({field: {onChange, onBlur, value} }) => (
                            <PasswordInput
                                placeholder=''
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
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
                            <PasswordInput
                                placeholder=''
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
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

                <View style={{flex: 1, flexDirection: 'row', marginLeft: 50, marginRight: 30}}>
                    <Checkbox
                        style={{margin: 8}}
                        value={isChecked}
                        onValueChange={setChecked}
                    />
                    <Link href={'/politicaPrivacidade'}>
                        <AppText fontSize={18}>
                            Concordo com a política de segurança e termos de uso do Chronomedi.
                        </AppText>
                    </Link>
                    
                </View>
                
                
                <Button
                    label={isLoading ? 'Aguarde...' : 'Cadastrar'}
                    onPress={ handleSubmit(handleSignUpData) }
                />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        paddingBottom: 100     
    }
})