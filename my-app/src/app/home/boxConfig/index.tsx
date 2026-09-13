import {View, Text, StyleSheet} from 'react-native'

export default function BoxConfig(){
    return (
        <View style = {styles.container}>
            <Text>Box Config Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
}) 