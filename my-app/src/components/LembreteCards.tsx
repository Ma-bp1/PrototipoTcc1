import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

import { Button } from './Button'
import { QuestionButton } from './QuestionButton'
import { MedData } from '../schemas/medSchema'

const maxCards = 2

const minutoMilisegundos = 60 * 1000
const horaMilisegundos = 60 * minutoMilisegundos

// O card só aparece quando faltar menos que isso
const janelaMinutos = 30
const janelaMilisegundos = janelaMinutos * minutoMilisegundos

// Confirmar/Adiar só ficam disponíveis quando faltar menos que isso
const janelaAcaoMinutos = 5
const janelaAcaoMilisegundos = janelaAcaoMinutos * minutoMilisegundos

// Quanto o "Adiar" empurra a dose
const adiarMinutos = 10
const adiarMilisegundos = adiarMinutos * minutoMilisegundos

const textoSemCadastro = 'Nenhum medicamento cadastrado.'
const textoSemProximos = `Nenhum medicamento nos próximos ${janelaMinutos} minutos.`

const ajudaTitulo = 'Sobre os lembretes'
const ajudaParagrafos = [
    'No canto superior direito do card aparece a contagem regressiva do tempo que resta até o horário de administração do medicamento.',
    `Quando restarem menos de ${janelaAcaoMinutos} minutos para o horário da administração, você pode confirmar a dose ou adiá-la em ${adiarMinutos} minutos.`,
]

export interface MedicationBase {
    id: string
    medTime: string
    medName?: string
    medRepetitions?: MedData['medRepetitions']
    /** Horário (epoch ms) da última dose confirmada */
    medLastConfirmed?: number
    /** Novo horário (epoch ms) quando a dose foi adiada */
    medSnoozedUntil?: number
}

interface LembreteCardsProps {
    medications: MedicationBase[]
    /** doseMs = horário (epoch ms) da dose confirmada */
    onConfirmar?: (id: string, doseMs: number) => void
    /** adiadaAteMs = novo horário (epoch ms) da dose adiada */
    onAdiar?: (id: string, adiadaAteMs: number) => void
}

interface MedicationTime {
    id: string
    nome?: string
    hours: number
    minutes: number
    repeticao?: MedData['medRepetitions']
    ultimaConfirmada?: number
    adiadaAte?: number
}

interface Lembrete {
    id: string
    nome?: string
    horario: string
    alvoMs: number
    diferencaHorario: number
    adiado: boolean
}

const cores = {
    background: '#FFFFFF',
    card: '#FFFFFF',
    accent: '#EC516A',
    text: '#D3344D',
    textSecondary: '#5B6B68',
    border: '#D9DEDD',
}

const cardGap = 12
const sidePadding = 16

const pad = (n: number) => String(n).padStart(2, '0')

const formatCountDown = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${pad(m)}:${pad(s)}`
}

const parseHorario = (
    horario: string,
): { hours: number; minutes: number } | null => {
    const match = /^(\d{1,2}):(\d{2})/.exec(String(horario ?? '').trim())
    if (!match) return null

    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours > 23 || minutes > 59) return null

    return { hours, minutes }
}

const normalizar = (lista: MedicationBase[]): MedicationTime[] =>
    lista.flatMap<MedicationTime>((med) => {
        const parsed = parseHorario(med.medTime)
        if (!parsed) return []

        return [
            {
                id: med.id,
                nome: med.medName,
                hours: parsed.hours,
                minutes: parsed.minutes,
                repeticao: med.medRepetitions,
                ultimaConfirmada: med.medLastConfirmed,
                adiadaAte: med.medSnoozedUntil,
            },
        ]
    })

// Próxima dose estritamente depois de "now", respeitando a repetição.
// - diario (ou sem repetição definida): todo dia no horário
// - semanal: só nos dias de daysOfWeek (0 = domingo, igual a Date.getDay())
// - horario: a cada intervalHours, ancorado no medTime de hoje
const getProximaDose = (med: MedicationTime, now: Date): Date | null => {
    const base = new Date(now)
    base.setHours(med.hours, med.minutes, 0, 0)

    const { repeticao } = med

    if (repeticao?.type === 'horario') {
        if (repeticao.intervalHours <= 0) return null

        const intervalo = repeticao.intervalHours * horaMilisegundos
        const k = Math.floor((now.getTime() - base.getTime()) / intervalo) + 1
        return new Date(base.getTime() + k * intervalo)
    }

    if (repeticao?.type === 'semanal') {
        for (let i = 0; i <= 7; i++) {
            const candidata = new Date(base)
            candidata.setDate(base.getDate() + i)

            const jaPassou = candidata.getTime() <= now.getTime()
            if (!jaPassou && repeticao.daysOfWeek.includes(candidata.getDay())) {
                return candidata
            }
        }
        return null
    }

    if (base.getTime() <= now.getTime()) base.setDate(base.getDate() + 1)
    return base
}

// Horário que o lembrete está esperando: a dose adiada (se ainda vale)
// ou a próxima dose normal. Retorna null se essa dose já foi confirmada.
const getAlvoDose = (med: MedicationTime, now: Date): Date | null => {
    if (med.adiadaAte && med.adiadaAte > now.getTime()) {
        return new Date(med.adiadaAte)
    }

    const proxima = getProximaDose(med, now)
    if (!proxima) return null

    if (med.ultimaConfirmada && proxima.getTime() <= med.ultimaConfirmada) {
        return null
    }

    return proxima
}

interface LembreteCardProps {
    nome?: string
    horario: string
    adiado: boolean
    diferencaHorario: number
    podeAgir: boolean
    width: number
    onConfirmar?: () => void
    onAdiar?: () => void
}

function LembreteCard({
    nome,
    horario,
    adiado,
    diferencaHorario,
    podeAgir,
    width,
    onConfirmar,
    onAdiar,
}: LembreteCardProps) {
    return (
        <View style={[styles.card, { width }]}>
            <View style={styles.cardAccent} />

            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitulos}>
                        <Text style={styles.cardNome} numberOfLines={1}>
                            {nome ?? 'Medicamento'}
                        </Text>
                        <Text style={styles.cardSubtitulo}>
                            {adiado ? `Adiado para as ${horario}` : `Horário às ${horario}`}
                        </Text>
                    </View>

                    <Text style={styles.countdown}>{formatCountDown(diferencaHorario)}</Text>
                </View>

                {/* flexWrap: em telas estreitas os botões descem de linha em vez de serem cortados */}
                <View style={styles.cardFooter}>
                    <QuestionButton
                        style={styles.semMargem}
                        titulo={ajudaTitulo}
                        paragrafos={ajudaParagrafos}
                    />

                    <View
                        style={[styles.cardActions, !podeAgir && styles.acoesDesativadas]}
                        pointerEvents={podeAgir ? 'auto' : 'none'}
                    >
                        <Button
                            label="Confirmar dose"
                            variant="grey"
                            style={styles.semMargem}
                            onPress={onConfirmar}
                        />
                        <Button
                            label="Adiar"
                            variant="grey"
                            style={styles.semMargem}
                            onPress={onAdiar}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

export default function LembreteCards({
    medications,
    onConfirmar,
    onAdiar,
}: LembreteCardsProps) {
    const { width: screenWidth } = useWindowDimensions()

    const [now, setNow] = useState<Date>(() => new Date())

    const horarios = useMemo(
        () => normalizar(medications ?? []),
        [medications],
    )

    const temMedicamentos = horarios.length > 0

    useEffect(() => {
        if (!temMedicamentos) return

        setNow(new Date())

        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [temMedicamentos])

    const upcoming = useMemo<Lembrete[]>(
        () =>
            horarios
                .flatMap<Lembrete>((med) => {
                    const alvo = getAlvoDose(med, now)
                    if (!alvo) return []

                    const diferencaHorario = alvo.getTime() - now.getTime()
                    if (diferencaHorario > janelaMilisegundos) return []

                    return [
                        {
                            id: med.id,
                            nome: med.nome,
                            horario: `${pad(alvo.getHours())}:${pad(alvo.getMinutes())}`,
                            alvoMs: alvo.getTime(),
                            diferencaHorario,
                            adiado: alvo.getTime() === med.adiadaAte,
                        },
                    ]
                })
                .sort((a, b) => a.diferencaHorario - b.diferencaHorario)
                .slice(0, maxCards),
        [horarios, now],
    )

    if (upcoming.length === 0) {
        return (
            <View style={styles.containerVazio}>
                <Text style={styles.textoVazio}>
                    {temMedicamentos ? textoSemProximos : textoSemCadastro}
                </Text>
            </View>
        )
    }

    const cardWidth =
        upcoming.length > 1
            ? Math.round(screenWidth * 0.85)
            : screenWidth - sidePadding * 2

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + cardGap}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.listContent}
        >
            {upcoming.map((item) => (
                <LembreteCard
                    key={item.id}
                    nome={item.nome}
                    horario={item.horario}
                    adiado={item.adiado}
                    diferencaHorario={item.diferencaHorario}
                    podeAgir={item.diferencaHorario <= janelaAcaoMilisegundos}
                    width={cardWidth}
                    onConfirmar={() => onConfirmar?.(item.id, item.alvoMs)}
                    onAdiar={() => onAdiar?.(item.id, item.alvoMs + adiarMilisegundos)}
                />
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    containerVazio: {
        marginHorizontal: sidePadding,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: cores.border,
        backgroundColor: cores.background,
    },
    textoVazio: {
        fontSize: 14,
        lineHeight: 20,
        color: cores.textSecondary,
        textAlign: 'center',
    },

    listContent: {
        paddingHorizontal: sidePadding,
        gap: cardGap,
    },

    card: {
        flexDirection: 'row',
        minHeight: 200,
        borderRadius: 21,
        backgroundColor: cores.card,
        overflow: 'hidden',
    },
    cardAccent: {
        width: 5,
        backgroundColor: cores.accent,
    },
    cardBody: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    cardTitulos: {
        flex: 1,
    },
    cardNome: {
        fontSize: 21,
        fontWeight: 'bold',
        color: cores.text,
    },
    cardSubtitulo: {
        marginTop: 2,
        fontSize: 13,
        color: cores.textSecondary,
    },
    countdown: {
        fontSize: 24,
        fontWeight: '700',
        color: cores.accent,
        fontVariant: ['tabular-nums'],
    },
    cardFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    acoesDesativadas: {
        opacity: 0.45,
    },
    semMargem: {
        margin: 0,
    },
})