import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native'
import { useState, useCallback } from 'react'
import { Feather } from '@expo/vector-icons'
import { MedData } from '../../schemas/medSchema'
import { boolean } from 'zod'

import { AppText } from '../../components/AppText'
import LembreteCards from '../../components/LembreteCards'
import { HomeSlots } from '../../components/HomeSlots'
import { useMedications } from '../../hooks/useMedication'
import { useDoseActions } from '../../hooks/useDoseActions'

import { useFocusEffect } from 'expo-router'

export default function Home(){
    
    const caixaLigada = useState(false)

    const { medications, setMedications, isLoading, refetch } = useMedications()
    const { confirmarDose, adiarDose } = useDoseActions(medications, setMedications)
    
    useFocusEffect(
            useCallback(() => {
                refetch()
            }, [refetch])
        )

    return (
        <View style = {styles.container}>
            <ScrollView
                contentContainerStyle={{paddingBottom: 130}}
            >
                <Text>Home Screen</Text>

                <View style={styles.header}>
                    {/* if caixaLigada = true, set boxStatus to styles.boxStatus:ligada else boxStatus:desligada */} 
                    <View style={styles.headerLogo}>
                        <Image 
                            source={require('../../../assets/android-icon-foreground.png')}
                            style={{width: 150, height: 150, zIndex: -1, position: 'absolute', top: -70, left: -40, }}
                        />
                    </View>

                    <AppText style={{fontWeight: 'bold', color: '#198289', textAlign: 'center'}}>Caixa Organizadora</AppText>
                    
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{
                            flex: 1, 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: '#FAFAFA', 
                            flexDirection: 'row', 
                            borderRadius: 21, 
                            width: 300, 
                            margin: 15, 
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                        }}>
                            <View style={styles.boxStatus}>
                                <View style={{height: 20, width: 20, borderRadius: 20, backgroundColor: '#67E0D8'}}/>
                                <Text style={styles.headerText}>Ligada {/* ligada = boolean {boxStatus} */}</Text>
                            </View>

                            <View style={{flex: 1, marginLeft: 20, flexDirection: 'row'}}>
                                <Text style={styles.headerText}> 100% </Text>
                                <Feather name='battery' size={26} color={'#67E0D8'}/>
                            </View>
                        </View>
                    </View>          
                </View>

                <AppText style={{flex: 1, margin: 15, fontSize: 26}}> 
                    Lembretes
                </AppText>

                <LembreteCards 
                    medications={medications}
                    onConfirmar={confirmarDose}
                    onAdiar={adiarDose}
                />

                <AppText style={{flex: 1, margin: 15, fontSize: 26}}> 
                    Slots da Caixa 
                </AppText>
                
                <HomeSlots
                    medications={medications}
                    onDeleted={(id) =>
                        setMedications((prev) => prev.filter((m) => m.id !== id))
                    }
                />
                
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,        
    },
    header: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        paddingTop: 40,
        zIndex: -3
    },
    headerLogo: {
        zIndex: -2,
        position: 'relative'
    },
    boxStatus: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 15,
        color: '#05534E',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
    },
    lembretes: {
        flex: 1,
        height: 200,
        borderRadius: 21,
        margin: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lembreteHeader: {
        padding: 20,
        flexDirection: 'row',
        marginBottom: 25,
    },
    lembreteButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#05534E',
        marginBottom: 15,
    },
    
}) 