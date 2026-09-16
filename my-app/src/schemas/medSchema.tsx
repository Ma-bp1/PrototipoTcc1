import { z } from 'zod'

const repetitionTypeSchema = z.enum(['horario', 'diario', 'semanal']);

const repetitionSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('horario'),
        intervalHours: z.number().min(1, 'O intervalo deve ser de pelo menos 1 hora'),
    }),
    z.object({
        type: z.literal('semanal'),
        daysOfWeek: z.array(z.number().min(0).max(6)).min(1, 'Selecione pelo menos um dia da semana')
    }),
    z.object({
        type: z.literal('diario'),
    })
])

export const medSchema = z.object({
    medTime: z.string().time(),
    medRepetitions: repetitionSchema,
    medName: z.string(),
    medSlot: z.number(),
    medStock: z.number(),
    medStockConsumption: z.number().positive(),
    medAdminRoute: z.string(),
    medDesc: z.string(),
    medIcon: z.string(),
})

export type MedData = z.infer<typeof medSchema>