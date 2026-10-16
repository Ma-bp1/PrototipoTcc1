import { Stack, router } from 'expo-router';
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Notifications from 'expo-notifications';
import { setupNotifications } from '../../src/notifications/setup';

const semHeader = ['index', 'welcome', 'login', 'signUp', 'home'];

export default function Layout() {
    useEffect(() => {
    setupNotifications().catch(console.warn);

        const open = (n: Notifications.Notification) =>
        router.push({
            pathname: '/doseAlert',
            params: { medId: String(n.request.content.data?.medId ?? '') },
        });

        // app aberto: abre o alerta na hora
        const s1 = Notifications.addNotificationReceivedListener(open);
        // usuário tocou na notificação
        const s2 = Notifications.addNotificationResponseReceivedListener((r) =>
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
            />
        </GestureHandlerRootView>
    );
}