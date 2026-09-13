import {View, Text, StyleSheet} from 'react-native'
import { Input } from '../../../components/Input'

export default function AddMed(){
    return (
        <View style = {styles.container}>
            <Text>Add Medicine Screen</Text>
            
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