import { View, Text, StyleSheet, Image, ScrollView} from 'react-native'
import { Button } from '../components/Button'
import { useRouter } from 'expo-router'

export default function Welcome() {

    const router = useRouter()
   
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
                <View style={{alignItems: 'center'}}>
                    <Image
                        style={{position: 'absolute',}}
                        source={require('../../assets/welcome.png')}
                    />
                </View>
                
                <View>
                    <Image
                        style={{marginTop: 100}}
                        source={require('../../assets/Chronomedi.png')}
                    />
                </View>

                <View style={{}}>
                    <Image
                        style={{position: 'absolute', top: '20%', left: '30%', transform: [{ scale: 0.8 }] }}
                        source={require('../../assets/mascot.png')}
                    />
                </View>

                <View style={{flex: 1}}>
                    <Text style={styles.title}> Bem Vindo! </Text>
                    <Text style={[styles.title, {fontSize: 24, fontWeight: 400, width: 160,}]}> 
                        Gerencie seus medicamentos de forma simples e segura. 
                    </Text>
                </View>

                <Button label='Vamos Começar!' onPress={()=>router.push('/login')}/>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 36,
        textAlign: 'left',
        marginLeft: 30
    }
})