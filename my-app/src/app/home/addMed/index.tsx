import {View, Text, StyleSheet} from 'react-native'
import { Input } from '../../../components/Input'
import { AppText } from '../../../components/AppText'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medSchema, type MedData } from '../../../schemas/medSchema'
import { useState } from 'react'
import { useRouter } from 'expo-router'

export default function AddMed(){
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)

    const {control, handleSubmit, formState: {errors}} = useForm<MedData>({
        resolver: zodResolver(medSchema),
        defaultValues: {
            medName: '', 
            medDosage: 0, 
            medRepetitions: {type: 'diario'}, 
            medTime: '', 
            medStock: 0, 
            medStockConsumption: 0, 
            medAdminRoute: '', 
            medDescription: '', 
            medIcon: ''
        }   
    })
    return (
        <View style = {styles.container}>
            <Text>Add Medicine Screen</Text>
            <Controller
                control={control}
                name='medName'
                render= {({field: {onChange, onBlur, value} }) => (
                    <Input 
                        placeholder=''
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{backgroundColor:'#DEE6E6', borderColor: '#198982', borderWidth: 3, margin: '5%'}}
                    />
                )}
            />
            {errors.medName && <AppText>{errors.medName.message}</AppText>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5'
    }
}) 