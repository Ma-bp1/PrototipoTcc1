import { z } from 'zod'

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    ipBox: z.string()
})

export type LoginData = z.infer<typeof loginSchema>

export const signUpSchema = loginSchema.extend({
    fullName: z.string().min(6),
    confirmPassword: z.string(),
}).refine(( data ) => data.password === data.confirmPassword, {
    message: 'Senhas não combinam.',
    path: ['confirmPassword']
})

export type SignUpData = z.infer<typeof signUpSchema>