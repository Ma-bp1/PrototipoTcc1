import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
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
        <Pressable
            style={({ pressed }) => [
                styles.configItem,
                pressed && styles.configItemPressed,
            ]}
            onPress={onPress}
        >
            {icon}
            <Text style={styles.configLabel}>{label}</Text>
        </Pressable>
    )
}

export default function AppConfig(){
    const router = useRouter()

    return (
        <View style={styles.container}>
            <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={styles.content}
            >
                <View style={styles.configBox}>
                    <ConfigItem
                        icon={<Feather name='lock' size={28} color='#31AEAE' />}
                        label='Conta e Dados (Perfil)'
                        onPress={() => router.navigate({ pathname: '/home/profile', params: { from: 'appConfig' } })}
                    />
                    <ConfigItem
                        icon={<Feather name='bell' size={28} color='#31AEAE' />}
                        label='Alerta e notificações'
                        onPress={() => router.push('/home/appConfig/alertConfig')}
                    />
                    <ConfigItem
                        icon={<Feather name='paperclip' size={28} color='#31AEAE' />}
                        label='Relatório de Uso de Medicamento'
                        onPress={() => router.push('/home/appConfig/relatorio')}
                    />
                    <ConfigItem
                        icon={<Feather name='phone' size={28} color='#31AEAE' />}
                        label='Contato'
                        onPress={() => router.push('/home/appConfig/contato')}
                    />
                    <ConfigItem
                        icon={<MaterialCommunityIcons name='crown-outline' size={28} color='#31AEAE' />}
                        label='Premium'
                        onPress={() => router.push('/home/appConfig/premium')}
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
    configBox: {
        backgroundColor: '#fff',
        borderRadius: 21,
        paddingBottom: 20,
        paddingTop: 20,
        width: '90%',
    },
    configItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 33,
        minHeight: 50,
        paddingHorizontal: 20,
        margin: 22,
        borderRadius: 21,
    },
    configItemPressed: {
        opacity: 0.6,
    },
    configLabel: {
        flex: 1,
        fontSize: 24,
        textAlign: 'left',
        color: '#05534E',
    },
})