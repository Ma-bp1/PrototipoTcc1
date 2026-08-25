import { View, TouchableOpacity, TouchableOpacityProps, Text, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width

type ButtonProps = TouchableOpacityProps & {
    label: string
}

export function Button({label, style, ...rest}: ButtonProps){
    return(
            <TouchableOpacity style={[styles.container, style]} {...rest}>
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
    }
})