import { View, Text, TextProps, StyleSheet, } from "react-native";



type AppTextProps = TextProps & {
    label: string
}

export function AppText({style, label, ...rest}: TextProps){
    return(
            <Text style={[styles.container, style]} {...rest}>
                {label}
            </Text>
    )
}

const styles = StyleSheet.create({
    container:{
        color: '#05534E',
        fontSize: 20,
    },
})