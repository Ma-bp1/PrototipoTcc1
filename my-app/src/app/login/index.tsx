import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import {Button} from '../../components/Button.js'

export default function Home(){
    return (
        <View>
            <Text>Login Screen</Text>
            <Button label='Entrar' />
        </View>
    )
}

const styles = StyleSheet.create({
    
})