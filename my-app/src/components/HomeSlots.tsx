import { View, StyleSheet, Pressable, Alert } from 'react-native'
import Swipeable, {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
    SharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../config/firebaseConfig'
import { useRef } from 'react'
import { Feather } from '@expo/vector-icons'
import { Medication } from '../schemas/medSchema'
import { AppText } from './AppText'
import { router } from 'expo-router'
import { cancelMedication } from '../notifications/scheduler'

type HomeSlotsProps = {
    medications: Medication[]
    onDeleted?: (id: string) => void
}

function RightAction({ translation }: { translation: SharedValue<number> }) {
    const iconStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    translation.value,
                    [-100, 0],
                    [1, 0.6],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }))

    return (
        <Animated.View style={styles.deleteAction}>
            <Animated.View style={iconStyle}>
                <Ionicons name='trash-outline' size={36} color='#fff'/>
            </Animated.View>
        </Animated.View>
    )
}


export function HomeSlots({ medications, onDeleted }: HomeSlotsProps) {

    const totalSlots = [1, 2, 3, 4, 5, 6]

    const swipeRefs = useRef<Record<number, SwipeableMethods | null>>({})

    const handleDelete = (slotNumber: number, med: Medication) => {
        Alert.alert(
            'Excluir medicamento',
                `Deseja realmente excluir "${med.medName}" do Slot ${slotNumber}?`,
                [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => swipeRefs.current[slotNumber]?.close(),
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                        const userId = auth.currentUser?.uid

                            if (!userId) {
                                Alert.alert('Erro', 'Usuário não está logado.')
                                swipeRefs.current[slotNumber]?.close()
                                return
                            }

                            await deleteDoc(doc(db, 'users', userId, 'medications', med.id))
                            onDeleted?.(med.id)

                            try {
                                await cancelMedication(med.id)
                            } catch (e) {
                                console.warn('Falha ao cancelar notificações', e)
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o medicamento.')
                            swipeRefs.current[slotNumber]?.close()
                        }
                    },
                },
                ],
                { 
                    cancelable: true, 
                    onDismiss: () => swipeRefs.current[slotNumber]?.close()
                }
        )
    }

    return (
        <>
            {totalSlots.map((slotNumber) => {
                const med = medications.find((m) => m.medSlot === `slot_${slotNumber}`)

                const isLowStock = med?.medRepetitions
                    ? med.medStock <= med.medStockConsumption
                    : false

                const card = (
                    <Pressable style={styles.slotCard}>
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
                                Nome: {med ? med.medName : ''}
                            </AppText>

                            <AppText>
                                {`Horário: ${med ? med.medTime : ''}`}
                            </AppText>

                        </View>

                        <Pressable
                            style={styles.editButton}
                            onPress={() =>  {
                                if (!med) return
                                router.push({
                                    pathname: '/home/addMed',
                                    params: {medicineId: med.id}
                                })
                            }}
                        >
                            <Feather name='edit-2' size={20} color='#00796b'/>
                        </Pressable>
                    </Pressable >
                )  

                if (!med) return <View key={slotNumber}>{card}</View>

                return (
                    <Swipeable
                        key={slotNumber}
                        ref={(ref) => {
                            swipeRefs.current[slotNumber] = ref
                        }}
                        containerStyle={styles.slotWrapper}
                        renderRightActions={(progress, translation)=>(
                            <RightAction translation={translation}/>
                        )}
                        rightThreshold={60}
                        overshootRight={false}
                        friction={2}
                        onSwipeableOpen={() => handleDelete(slotNumber, med)}
                    >
                        {card}
                    </Swipeable>
                )
            })}
        </>
    )
}

const styles = StyleSheet.create({
    slotWrapper: {
        margin: 10,
        marginBottom: 12,
        marginHorizontal: 10
    },
    slotCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 21,
        padding: 15,
        alignItems: 'center',
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
    },
    deleteAction: {
        backgroundColor: '#E03538',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        borderTopRightRadius: 21,
        borderBottomRightRadius: 21,
    },
})