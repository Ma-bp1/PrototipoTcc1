import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { number, string } from 'zod'

const maxCards = 2

const janelaMinutos = 30
const janelaMilisegundos = JANELA_MINUTOS * 60 * 1000

const textoVazio = 'Se não tem nada aqui, ou é por que não há nenhum emdicamento cadastrado, ou porque não há nenhum medicamento com menos de meia hora para ser administrado.'

export interface MedicationBase {
    id: string
    horario: string
    nome?: string
}

interface LembreteCardsProps {
    medications: MedicationBase[]
}

interface MedicationTime: {
    id: string
    nome?: string
    horario: string
    hours: number
    minutes: number
}

interface Upcoming extends MedicationTime {
    diferencaHorario: number;
}

const cores = {
    background: '',
    card: '',
    accent: '',
    text: '',
}

const cardGap = 12
const sidePadding = 16

const pad = (n; number) => String(n).padStart(2, '0')

const parseHorario = (
    horario: string,
): { hours: number; minutes: number } | null => {
    const match = /^(\d{1,2}):(\d{2})/.exec(String(horario ?? '').trim())
    if (!match) return null

    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours > 23 || minutes > 59) return null

    return { hours, minutes}
} 

const normalizar = (lista: MedicationBase[]): MedicationTime[] =>
    lista.flatMap((med)=>{
        const parsed = parseHorario(med.horario)
        if(!parsed) return []

        return [
            {
                id: String(medSchema.id),
                nome: med.nome,
                horario: `${pad(parsed.hours)}:${pad(parsed.minutes)}`,
                hours: parsed.hours,
                minutes: parsed.minutes,
            },
        ]
    })

const getDiferencaHorario = (hours: number, minutes: number, now: Date): number => {
    const target = new Date(now)
    target.setHours(hours, minutes, 0, 0)

    if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1)
    }

    return target.getTime() - now.getTime()
}

interface LembreteCardProps {
    horario: string,
    nome?: string,
    diferencaHorario: number,
    width: number,
    isLast: boolean
}

function Lembretecard({
    horario, 
    nome, 
    diferencaHorario,
    width,
    isLast,
}: LembreteCardProps) {

    const formatCountDown = (ms: number): string => {
        const totalSeconds = Math.max(0, Math.ceil (ms/1000))
        const m = Math.floor(totalSeconds / 60)
        const s = totalSeconds % 60
        return `${pad(m)}:${pad(s)}`
    }
}

return ()