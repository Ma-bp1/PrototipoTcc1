import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { CustomTabButton } from '../../components/CustomTabButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

function CustomTabBar({state, navigation}: BottomTabBarProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets()

    const currentRoute = state.routes[state.index].name;
    const isHome = currentRoute === 'index';

    return (
        <View style={[styles.container, 
            {
                paddingBottom: insets.bottom > 0 ? insets.bottom : 15,
                height: 65 + (insets.bottom > 0 ? insets.bottom : 15)
            }
        ]}>
            <CustomTabButton
                icon='settings'
                isFocused={currentRoute === 'appConfig/index'}
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
            screenOptions={{
                headerShown: false
            }}
        >
            <Tabs.Screen name='index'/>
            <Tabs.Screen name='stock/index'/>
            <Tabs.Screen name='profile/index'/>
            <Tabs.Screen name='boxConfig/index'/>
            <Tabs.Screen name='appConfig/index'/>
            <Tabs.Screen name='addMed/index'/>
            <Tabs.Screen/>
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
        backgroundColor: '#31AEAE',
        top: -20,
    },
    floatingButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})