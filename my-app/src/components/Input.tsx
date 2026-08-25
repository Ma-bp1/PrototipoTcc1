import { View, TextInput, TextInputProps, Text, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width

type TextProps = TextInputProps

export function Input({style, ...rest}: TextProps){
    return(
            <TextInput 
                style={[styles.container, style]} {...rest}
            />
    )
}

const styles = StyleSheet.create({
    container:{
        width: '100%',
        height: 60,
        backgroundColor: '#F3F3F3',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 12,
        padding: 20,
    },
})