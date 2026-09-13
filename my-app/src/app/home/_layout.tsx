import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#FF6B8A',
                tabBarShowLabel: false,
                headerShown: false
            }}
        >
            <Tabs.Screen name='index'
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Feather 
                            name="home" 
                            size={size} 
                            color={color} 
                        />
                    ),
                    
                }}
            />
            <Tabs.Screen name='stock/index'
                options={{
                    tabBarIcon: ({color, size}) => (
                        <MaterialCommunityIcons 
                            name="pill" 
                            size={size} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen name='profile/index'
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Feather 
                            name="user" 
                            size={size} 
                            color={color}  
                        />
                    ),
                }}
            />
            <Tabs.Screen name='boxConfig/index'
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Feather 
                            name="box" 
                            size={size} 
                            color={color}  
                        />
                    ),
                }}
            />
            <Tabs.Screen name='appConfig/index'
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Feather 
                            name="settings" 
                            size={size} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen name='addMed/index'
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Feather 
                            name="plus-circle" 
                            size={size} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen/>
        </Tabs>
    );
}