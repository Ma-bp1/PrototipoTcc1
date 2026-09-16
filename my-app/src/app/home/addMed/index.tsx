import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView} from 'react-native'
import { Input } from '../../../components/Input'
import { AppText } from '../../../components/AppText'
import TimePicker from '../../../components/TimePicker'
import { NumberStepper } from '../../../components/NumberStepper'
import { CustomDropdown } from '../../../components/CustomDropDown'
import { Button } from '../../../components/Button'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medSchema, type MedData } from '../../../schemas/medSchema'
import { useState } from 'react'
import { useRouter } from 'expo-router'

const DAYS = [
  { label: 'D', value: 0 },
  { label: 'S', value: 1 },
  { label: 'T', value: 2 },
  { label: 'Q', value: 3 },
  { label: 'Q', value: 4 },
  { label: 'S', value: 5 },
  { label: 'S', value: 6 },
];


export default function AddMed(){
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)

    const {control, handleSubmit, watch, setValue, formState: {errors}} = useForm<MedData>({
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

    const currentRepetition = watch('medRepetitions')

    const onSubmit = (data: MedData) => {
        console.log(data)
    }

    return (
        <ScrollView style = {styles.container}>
            <Text>Add Medicine Screen</Text>
            <AppText>Horário de Administração</AppText>

            <Controller
                control={control}
                name="medTime"
                render={({ field: { value, onChange } }) => {
                    // Extrai hora e minuto da string 'HH:mm'
                    const [currentHour, currentMinute] = (value || '16:01').split(':').map(Number);

                    return (
                        <TimePicker
                            selectedHour={currentHour}
                            selectedMinute={currentMinute}
                            onTimeChange={(hour, minute) => {
                                const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                                onChange(formattedTime); // Atualiza o valor no useForm
                            }}
                        />
                    );
                }}
            />
            {errors.medTime && <AppText style={{ color: 'red' }}>{errors.medTime.message}</AppText>}

            <AppText>Repetições?</AppText>
            <View style={styles.row}>
                <AppText>A cada X horas</AppText>
                <Switch
                    value={currentRepetition.type === 'horario'}
                    onValueChange={(isEnabled) => {
                        if (isEnabled) {
                            setValue('medRepetitions', { type: 'horario', intervalHours: 8 });
                        } else {
                            setValue('medRepetitions', { type: 'diario' });
                        }
                    }}
                />
            </View>

            {currentRepetition.type === 'horario' && (
                <Controller
                    control={control}
                    name="medRepetitions"
                    render={() => (
                        <View style={styles.subContainer}>
                            <AppText>Intervalo em horas:</AppText>
                            <Input
                                keyboardType="numeric"
                                placeholder="8"
                                onChangeText={(text) => {
                                    const num = Number(text);
                                    setValue('medRepetitions', { type: 'horario', intervalHours: isNaN(num) ? 0 : num });
                                }}
                                value={String((currentRepetition as any).intervalHours || '')}
                            />
                        </View>
                    )}
                />
            )}

            <View style={styles.row}>
                <AppText>Semanalmente?</AppText>
                <Switch
                    value={currentRepetition.type === 'semanal'}
                    onValueChange={(isEnabled) => {
                        if (isEnabled) {
                            setValue('medRepetitions', { type: 'semanal', daysOfWeek: [3] }); // Ex: Quarta-feira por padrão
                        } else {
                            setValue('medRepetitions', { type: 'diario' });
                        }
                    }}
                />
            </View>

            {currentRepetition.type === 'semanal' && (
                <View style={styles.daysContainer}>
                    {DAYS.map((day) => {
                        const selectedDays = (currentRepetition as any).daysOfWeek || [];
                        const isSelected = selectedDays.includes(day.value);

                        return (
                            <TouchableOpacity
                                key={day.value}
                                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                                onPress={() => {
                                    let updatedDays = [...selectedDays];
                                    if (isSelected) {
                                        updatedDays = updatedDays.filter((d: number) => d !== day.value);
                                    } else {
                                        updatedDays.push(day.value);
                                    }
                                    setValue('medRepetitions', { type: 'semanal', daysOfWeek: updatedDays });
                                }}
                            >
                                <AppText style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                                    {day.label}
                                </AppText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
            {errors.medRepetitions && <AppText style={{ color: 'red' }}>Erro nas repetições</AppText>}


            <AppText>Nome do medicamento</AppText>
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

            <AppText>Slot:</AppText>
            <Controller
                control={control}
                name="medSlot" // Certifique-se de adicionar no schema Zod
                render={({ field: { value, onChange } }) => (
                    <CustomDropdown
                        label="Slot"
                        options={[
                            { label: 'Slot 1', value: 'slot_1' },
                            { label: 'Slot 2', value: 'slot_2' },
                        ]}
                        selectedValue={value}
                        onSelect={onChange}
                    />
                )}
            />

            <AppText>Via de Administração:</AppText>
            <Controller
                control={control}
                name="medAdminRoute" // Certifique-se de adicionar no schema Zod
                render={({ field: { value, onChange } }) => (
                    <CustomDropdown
                        label="Slot"
                        options={[
                            { label: 'Slot 1', value: 'slot_1' },
                            { label: 'Slot 2', value: 'slot_2' },
                        ]}
                        selectedValue={value}
                        onSelect={onChange}
                    />
                )}
            />

            <AppText>Quantidade a Ser Colocada no Slot:</AppText>
            <Controller
                control={control}
                name="medStock" 
                render={({ field: { value, onChange } }) => (
                    <NumberStepper
                        value={value}
                        onChange={onChange}
                        min={0}
                    />
                )}
            />

            <AppText>Quantidade a Ser Colocada no Slot:</AppText>
            <Controller
                control={control}
                name="medStockComsumption" 
                render={({ field: { value, onChange } }) => (
                    <NumberStepper
                        value={value}
                        onChange={onChange}
                        min={0}
                    />
                )}
            />

            <AppText> Descrição: </AppText>
            <Controller
                control={control}
                name='medDesc'
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
            {errors.medDesc && <AppText>{errors.medDesc.message}</AppText>}




            <Button variant='blue' label='Salvar Medicamento' onPress={handleSubmit(onSubmit)}/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
    },
    sectionTitle: {
        marginTop: 15,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    subContainer: {
        marginVertical: 5,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    dayButton: {
        width: 35,
        height: 35,
        borderRadius: 8,
        backgroundColor: '#DEE6E6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayButtonSelected: {
        backgroundColor: '#198982',
    },
    dayText: {
        color: '#333',
    },
    dayTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#DEE6E6', 
        borderColor: '#198982', 
        borderWidth: 3, 
        marginVertical: 5,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#198982',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
}) 