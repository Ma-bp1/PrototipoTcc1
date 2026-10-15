import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const semHeader = ['index', 'welcome', 'login', 'signUp', 'home'];

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={({ route }) => ({
                    headerShown: !semHeader.some(
                        (nome) => route.name === nome || route.name.startsWith(`${nome}/`)
                    ),
                })}
            />
        </GestureHandlerRootView>
    );
}