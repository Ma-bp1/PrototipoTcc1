import {View, Text, StyleSheet} from 'react-native'

export default function AppConfig(){
    return (
        <View style = {styles.container}>
            <Text>App Config Screen</Text>
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