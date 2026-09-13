import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import {Redirect} from 'expo-router'

export default function Index(){
    return (

        <Redirect href='/home'/>
    )
}