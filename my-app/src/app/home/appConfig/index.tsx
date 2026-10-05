import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Button } from '../../../components/Button'
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type ConfigItemProps = {
    icon: React.ReactNode
    label: string
    onPress?: () => void
}

function ConfigItem({ icon, label, onPress }: ConfigItemProps) {
    return (
        <View style={styles.configItem}>
            {icon}
            <View style={{ flex: 1 }}>
                <Button variant='white' label={label} onPress={onPress} />
            </View>
        </View>
    )
}

export default function AppConfig(){
    const router = useRouter()

    return (
        <View style = {styles.container}>
            <ScrollView
                style={{flex: 1, width: '100%'}}
                contentContainerStyle={styles.content}
            >
                <Text>App Config Screen</Text>
                <View style={styles.configBox}>
                    <ConfigItem
                        icon={<Feather name='lock' size={28} color='#31AEAE' />}
                        label='Conta e Dados'
                    />
                    <ConfigItem
                        icon={<Feather name='bell' size={28} color='#31AEAE' />}
                        label='Alerta e notificações'
                        onPress={() => router.push('/home/appConfig/alertConfig')}
                    />
                    <ConfigItem
                        icon={<Feather name='paperclip' size={28} color='#31AEAE' />}
                        label='Relatório de Uso de Medicamento'
                    />
                    <ConfigItem
                        icon={<Feather name='phone' size={28} color='#31AEAE' />}
                        label='Contato'
                    />
                    <ConfigItem
                        icon={<MaterialCommunityIcons name='crown-outline' size={28} color='#31AEAE' />}
                        label='Premium'
                    />
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    
    content: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingBottom: 100,
    },
    configButton: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        borderRadius: 21,
    },
     configBox: {
        backgroundColor: '#fff',
        borderRadius: 21,
        padding: 10,
        width: '90%',
        gap: 8,
    },
    configItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 6,
    }
}) 