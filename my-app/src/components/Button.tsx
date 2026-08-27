import { View, TouchableOpacity, TouchableOpacityProps, Text, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width

type ButtonProps = TouchableOpacityProps & {
    label: string,
    variant?: 'red' | 'blue' //ao invés de usar uma string genérica, o uso de 'vermelho' OU 'azul' faz com que este campo se autocomplete em futuras implementações do botão; exemplo: não pode haver uma variant 'green', pois não existe (somente aceito red ou blue).
}

export function Button({label, style, variant = 'red', ...rest}: ButtonProps){

    const variantStyles = {
        red: styles.container,
        blue: styles.blue
    }

    return(
            <TouchableOpacity style={[styles.container, variantStyles[variant], style]} {...rest}>
                <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        paddingHorizontal: 30,
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
    blue: {
        backgroundColor:'#31AEAE'
    }
})