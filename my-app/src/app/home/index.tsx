import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../config/firebaseConfig'

import { AppText } from '../../components/AppText'
import { Button } from '../../components/Button'
import { QuestionButton } from '../../components/QuestionButton'
import { Feather } from '@expo/vector-icons'
import { boolean } from 'zod'

interface Medication {
    id: string,
    medName: string,
    medRepetitions?: {
        medSlot: string,
        medTime: string,
        medStock: number,
        medStockConsumption: number,
    }
    
    /* isLowStock?: boolean */
}

export default function Home(){
    const [medications, setMedications] = useState<Medication[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const caixaLigada = useState(false)

    const totalSlots= [1, 2, 3, 4, 5, 6]

    useEffect(() => {
        fetchMedications()
    }, [])

    const fetchMedications = async () => {
        try {
            const userId = auth.currentUser?.uid

            if (!userId) {
                setIsLoading(false)
                return
            }

            const userMedsCollection = collection(db, 'users', userId, 'medications')
            const querySnapshot = await getDocs(userMedsCollection)

            const medsList: Medication[] = []
            querySnapshot.forEach((doc) => {
                medsList.push({ id: doc.id, ...doc.data() } as Medication)
            })

            setMedications(medsList)
        } catch (error) {
            console.error('Erro ao buscar medicamentos no Firestore:', error)
            Alert.alert('Não foi possível carregar os slots.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style = {styles.container}>
            <ScrollView>
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

                <View style={styles.lembretes}>
                    <View style={styles.lembreteHeader}>
                        <Text style={{fontWeight: 'bold', fontSize: 21, flex: 1, textAlign: 'left', color: '#D3344D' }}> 
                            Dipirona 
                        </Text>
                        <Text style={{fontSize: 21, flex: 1, textAlign: 'right', color: '#EC516A' }}> 15:30 </Text>
                    </View>

                    <View style={styles.lembreteButtons}>
                        <QuestionButton/>
                        <Button label='Confirmar Dose' variant='grey'/>
                        <Button label='Adiar' variant='grey'/>
                    </View>
                </View>

                <AppText style={{flex: 1, margin: 15, fontSize: 26}}> 
                    Slots da Caixa 
                </AppText>
                
                {/* slots */}
                {totalSlots.map((slotNumber) => {
                    const med = medications.find((m) => Number(m.medRepetitions?.medSlot === `slot_${slotNumber}`) === slotNumber)

                    const isLowStock = med?.medRepetitions
                        ? med.medRepetitions.medStock <= med.medRepetitions.medStockConsumption
                        : false

                    return (
                        <View key={slotNumber} style={styles.slotCard}>
                            <View style={styles.slotIconContainer}>
                            </View>

                            <View style={styles.slotInfo}>
                                <View style={styles.slotHeaderRow}>
                                    <AppText style={styles.slotTitle}>Slot {slotNumber}</AppText>
                                    {isLowStock && (
                                        <View> 
                                            <AppText style={styles.lowStockText}> Estoque Baixo! </AppText>
                                        </View>
                                    )}
                                </View>

                                <AppText>
                                    Nome: {med ? med.medName : 'Vazio'}
                                </AppText>

                                <AppText>
                                   {`Horário: ${med ? med.medRepetitions?.medTime : '--:--'}`}
                                </AppText>

                            </View>

                            <TouchableOpacity style={styles.editButton}>
                                <Feather name='edit-2' size={20} color='#00796b'/>
                            </TouchableOpacity>
                        </View>
                    )
                })}
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
    slotCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 21,
        padding: 15,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    slotIconContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#DFDFDF',
        margin: 20,
        borderRadius: 10,
    },
    slotInfo: {
        flex: 1,
    },
    slotHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    slotTitle: {
        color: '#198982'
    },
    slotText: {
        fontSize: 16,
        color: '#05534E'
    },
    lowStockBadge: {
        backgroundColor: '#F98295',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    lowStockText: {
        color: '#fff',
        fontSize: 10,
    },
    editButton: {
        padding: 5,
    }
}) 