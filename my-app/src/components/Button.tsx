import { View, TouchableOpacity, TouchableOpacityProps, Text, StyleProp, StyleSheet, Dimensions } from "react-native";


type ButtonProps = TouchableOpacityProps & {
    label: string,
    variant?: 'red' | 'blue' | 'grey' //ao invés de usar uma string genérica, o uso de 'vermelho' OU 'azul' faz com que este campo se autocomplete em futuras implementações do botão; exemplo: não pode haver uma variant 'green', pois não existe (somente aceito red ou blue).
}

export function Button({label, style, variant = 'red', ...rest}: ButtonProps){

    const variantStyles = {
        red: styles.container,
        blue: styles.blue,
        grey: styles.grey
    }

    const labelStyles = {
        red: styles.label,
        blue: styles.label,
        grey: styles.greyLabel
    }

    return(
            <TouchableOpacity style={[styles.container, variantStyles[variant], style]} {...rest}>
                <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
            </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        paddingHorizontal: 20,
        height: 48,
        backgroundColor: '#FF6B8A',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 12,
    },
    label:{
        color: 'white',
        fontSize: 26
    },
    greyLabel: {
        color: '#8E8E93',
        fontSize: 16,
    },
    blue: {
        backgroundColor:'#31AEAE'
    },
    grey: {
        backgroundColor: '#F5F5F5',
        
    }
})