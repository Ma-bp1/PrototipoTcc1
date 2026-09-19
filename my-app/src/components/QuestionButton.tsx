import { View, TouchableOpacity, TouchableOpacityProps, Text, StyleProp, StyleSheet, Dimensions } from "react-native";


type ButtonProps = TouchableOpacityProps

export function QuestionButton({style, ...rest}: ButtonProps){

    return(
            <TouchableOpacity style={[styles.container,  style]} {...rest}>
                <Text style={styles.label}>?</Text>
            </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        width: 30,
        height: 30,
        backgroundColor: '#FF6B8A',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 16,
    },
    label:{
        color: 'white',
        fontSize: 16
    }
})