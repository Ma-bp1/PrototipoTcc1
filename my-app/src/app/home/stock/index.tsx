import { useCallback } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router' // se não usa expo-router: '@react-navigation/native'
import { AppText } from '@/src/components/AppText'
import { NumberStepper } from '@/src/components/NumberStepper'
import { Medication } from '@/src/schemas/medSchema'
import { useMedications } from '@/src/hooks/useMedication'
import { updateMedication } from '@/src/services/medicationService'


type StockSlotsProps = {
    medications: Medication[]
    onChangeStock: (med: Medication, newStock: number) => void
}

function StockSlots({ medications, onChangeStock }: StockSlotsProps) {
    const totalSlots = [1, 2, 3, 4, 5, 6]

    return (
        <>
            {totalSlots.map((slotNumber) => {
                const med = medications.find((m) => m.medSlot === `slot_${slotNumber}`)

                // quantas doses ainda dá pra tomar com o estoque atual
                const dosesLeft = med ? Math.floor(med.medStock / med.medStockConsumption) : 0

                return (
                    <View key={slotNumber} style={styles.slotCard}>
                        <View style={styles.slotIconContainer} />

                        <View style={styles.slotInfo}>
                            <View style={styles.slotHeaderRow}>
                                <AppText style={styles.slotTitle}>Slot {slotNumber}</AppText>
                            </View>

                            {med ? (
                                <>
                                    <AppText>Nome: {med.medName}</AppText>

                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <AppText>Estoque:</AppText>
                                        <NumberStepper
                                            value={med.medStock}
                                            onChange={(newStock) => onChangeStock(med, newStock)}
                                        />
                                    </View>

                                    <AppText style={styles.infoText}>
                                        Consumo por dose: {med.medStockConsumption} · Doses restantes: {dosesLeft}
                                    </AppText>
                                </>
                            ) : (
                                <AppText>Slot vazio</AppText>
                            )}
                        </View>
                    </View>
                )
            })}
        </>
    )
}

export default function Stock() {
    const { medications, setMedications, refetch } = useMedications()

    // Recarrega do banco toda vez que a tela ganha foco.
    // Assim, o que foi confirmado na Home ou no alerta de dose já aparece aqui.
    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )

    // Ajuste manual do estoque (ex.: o usuário repôs a cartela)
    const handleChangeStock = async (med: Medication, newStock: number) => {
        // atualiza na tela na hora
        setMedications((list) =>
            list.map((m) => (m.id === med.id ? { ...m, medStock: newStock } : m))
        )

        try {
            await updateMedication(med.id, { medStock: newStock })
        } catch (error) {
            console.error('Erro ao salvar estoque:', error)
            Alert.alert('Não foi possível salvar o estoque.')
            refetch() // volta pro valor real do banco
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StockSlots medications={medications} onChangeStock={handleChangeStock} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
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
        color: '#198982',
    },
    infoText: {
        fontSize: 13,
    }
})