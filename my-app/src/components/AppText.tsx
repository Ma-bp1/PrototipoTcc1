import { View, Text, TextProps, StyleSheet, } from "react-native";



type AppTextProps = TextProps & {
    fontSize?: 20 | 18
}

export function AppText({style, children, fontSize = 20, ...rest}: AppTextProps){

    return(
            <Text style={[styles.container, {fontSize}, style]} {...rest}>
                {children}
            </Text>
    )
}

const styles = StyleSheet.create({
    container:{
        color: '#05534E',
    },
})