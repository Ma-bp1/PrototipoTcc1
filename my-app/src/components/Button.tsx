import { View, TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from "react-native";

type ButtonProps = TouchableOpacityProps & {
    label: string
}

export function Button({label, ...rest}: ButtonProps){
    return(
            <TouchableOpacity style={styles.container} {...rest}>
                <Text>{label}</Text>
            </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        width: '100%',
        height: 48,
        backgroundColor: 'blue',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    label:{
        color: 'black',
        fontSize: 14
    }
})