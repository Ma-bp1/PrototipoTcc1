import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { getMedications } from '../services/medicationService'
import { Medication } from '../schemas/medSchema'

export function useMedications() {
    const [medications, setMedications] = useState<Medication[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refetch = useCallback(async () => {
        try {
        setIsLoading(true)
        const list = await getMedications()
        setMedications(list)
        } catch (error) {
        console.error('Erro ao buscar medicamentos:', error)
        Alert.alert('Não foi possível carregar os slots.')
        } finally {
        setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { medications, setMedications, isLoading, refetch }
}