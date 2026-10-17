import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setupNotifications } from '../notifications/setup';
import { getNotifications } from '../notifications/native';

const semHeader = ['index', 'welcome', 'login', 'signUp', 'home'];

export default function Layout() {
    useEffect(() => {
        const N = getNotifications();
        if (!N) return; // build sem o módulo: o app abre normalmente

        setupNotifications().catch(console.warn);

        const open = (n: any) =>
            router.push({
                pathname: '/doseAlert',
                params: { medId: String(n.request.content.data?.medId ?? '') },
            });

        // app aberto: abre o alerta na hora
        const s1 = N.addNotificationReceivedListener(open);
        // usuário tocou na notificação
        const s2 = N.addNotificationResponseReceivedListener((r: any) =>
            open(r.notification)
        );
        return () => { s1.remove(); s2.remove(); };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={({ route }) => ({
                    headerShown: !semHeader.some(
                        (nome) => route.name === nome || route.name.startsWith(`${nome}/`)
                    ),
                })}
            >
                <Stack.Screen
                    name="doseAlert"
                    options={{ presentation: 'fullScreenModal', headerShown: false }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}