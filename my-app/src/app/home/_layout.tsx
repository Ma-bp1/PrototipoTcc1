import { Tabs, useRouter, Href } from 'expo-router';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { CustomTabButton } from '../../components/CustomTabButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

const corHeader = '#31AEAE'

// `to`: destino fixo (ex.: alertas -> configurações). Sem `to`, volta no histórico.
function BackButton({ to }: { to?: Href }) {
    const router = useRouter()

    return (
        <Pressable
            onPress={() => {
                if (to) {
                    router.navigate(to);
                } else if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace('/home');
                }
            }}
            hitSlop={10}
            style={({ pressed }) => ({
                marginLeft: 16,
                opacity: pressed ? 0.5 : 1,
            })}
        >

            <Feather name='arrow-left' size={26} color='#fff' />
        </Pressable>
    )
}

function CustomTabBar({state, navigation}: { state: any; navigation: any }) {
    const router = useRouter();
    const insets = useSafeAreaInsets()

    const currentRoute = state.routes[state.index].name;
    const isHome = currentRoute === 'index';
    // a engrenagem fica ativa também nas telas filhas de appConfig
    const isConfig = currentRoute.startsWith('appConfig/');

    return (
        <View style={[styles.container, 
            {
                paddingBottom: insets.bottom > 0 ? insets.bottom : 15,
                height: 65 + (insets.bottom > 0 ? insets.bottom : 15)
            }
        ]}>
            <CustomTabButton
                icon='settings'
                isFocused={isConfig}
                onPress={()=> navigation.navigate('appConfig/index')}
            />
            <CustomTabButton
                icon='user'
                isFocused={currentRoute === 'profile/index'}
                onPress={()=> navigation.navigate('profile/index')}
            />
        
            <View style={styles.centerButtonContainer}>
                <Pressable
                    style={({pressed})=>[
                        styles.floatingButton,
                        {opacity: pressed ? 0.5 : 1}
                    ]}
                    onPress={()=>{
                        if (isHome) {
                            navigation.navigate('addMed/index');
                        } else {
                            navigation.navigate('index');
                        }
                    }}
                >
                    <Feather
                        name={isHome ? 'plus' : 'home'}
                        size={26}
                        color='#fff'
                    />
                </Pressable>
            </View>

            <CustomTabButton
                icon='box'
                isFocused={currentRoute === 'boxConfig/index'}
                onPress={()=> navigation.navigate('boxConfig/index')}
            />
            <CustomTabButton
                icon='pill'
                isFocused={currentRoute === 'stock/index'}
                onPress={()=> navigation.navigate('stock/index')}
            />
        </View>
    )
}

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props)=> <CustomTabBar {...props}/>}
            screenOptions={({ route }) => ({
                headerShown: route.name !== 'index',
                headerStyle: { backgroundColor: corHeader },
                headerShadowVisible: false,
                headerTitleAlign: 'center',
                headerLeft: () => <BackButton />,
                headerTitle: ({ children }) => (
                    <Text
                        numberOfLines={2}
                        style={{
                            color: '#fff',
                            fontSize: 20,
                            fontWeight: '600',
                            textAlign: 'center',
                        }}
                    >
                        {children}
                    </Text>
                ),
            })}
        >
            <Tabs.Screen name='index'/>
            <Tabs.Screen name='stock/index' options={{ title: 'Estoque' }}/>
            <Tabs.Screen name='profile/index' options={{ title: 'Perfil' }}/>
            <Tabs.Screen name='boxConfig/index' options={{ title: 'Configurações da Caixa' }}/>
            <Tabs.Screen name='appConfig/index' options={{ title: 'Configurações' }} />
            <Tabs.Screen
                name='appConfig/alertConfig/index'
                options={{
                    title: 'Alertas',
                    headerLeft: () => <BackButton to='/home/appConfig' />,
                }}
            />
            <Tabs.Screen name='addMed/index' options={{ title: 'Cadastro de Medicamento' }}/>
            <Tabs.Screen name='esqueciSenha/index' options={{headerShown: false}}/>
        </Tabs>
    );
}

const styles = StyleSheet.create({
    container: {
        position:'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 65,  
    },
    centerButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#50CFC7',
        top: -20,
    },
    floatingButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})