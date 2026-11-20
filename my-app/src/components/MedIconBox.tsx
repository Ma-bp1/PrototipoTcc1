import { View, Image, StyleSheet } from 'react-native'
import { Medication } from '../schemas/medSchema'
import { MED_ICONS, MedIconKey } from './MedIcons'
import { DEFAULT_ICON_COLOR } from './IconPicker'

type MedIconBoxProps = {
    med?: Medication
    size?: number
}

export function MedIconBox({ med, size = 50 }: MedIconBoxProps) {
    const boxStyle = [styles.box, { width: size, height: size }]

    // Slot vazio -> quadradinho cinza
    if (!med) return <View style={boxStyle} />

    // 1) Foto tem prioridade
    if (med.medPhoto) {
        return (
            <Image
                source={{ uri: med.medPhoto }}
                style={[boxStyle, styles.photo]}
            />
        )
    }

    // 2) Ícone escolhido no IconPicker
    if (med.medIcon) {
        const iconKey = med.medIcon as MedIconKey
        const IconComponent = MED_ICONS[iconKey] // ajuste conforme seu IconPicker

        return (
            <View style={boxStyle}>
                {/* Se o seu mapa guarda um componente: */}
                {IconComponent && (
                    <IconComponent
                        size={size * 0.6}
                        color={med.medIconColor ?? DEFAULT_ICON_COLOR}
                    />
                )}
            </View>
        )
    }

    // 3) Nada cadastrado -> quadradinho cinza
    return <View style={boxStyle} />
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: '#DFDFDF',
        borderRadius: 10,
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photo: {
        backgroundColor: 'transparent',
    },
})