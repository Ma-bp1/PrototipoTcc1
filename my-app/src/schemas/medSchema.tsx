import { z } from 'zod'

export const medSchema = z.object({
    time: z.iso.time(),
    reps: z.string(),
    name: z.string(),
    slot: z.number(),
    stock: z.number(),
    stockComsumption: z.number(),
    viaAdmin: z.string(),
    description: z.string(),
    icon: z.string(),
})

export type medData = z.infer<typeof medSchema>