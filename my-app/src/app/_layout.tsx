import { Stack, router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setupNotifications } from '../notifications/setup';
import { getNotifications } from '../notifications/native';
import { useBox } from '../hooks/useBox';
import { confirmarDosePelaCaixa } from '../services/doseActions';
import { useMissedDoseAlert } from '../hooks/useMissedDoseAlert';

const semHeader = ['index', 'welcome', 'login', 'signUp', 'home'];

export default function Layout() {
    const pathname = usePathname()

    const pathnameRef = useRef(pathname)
    useEffect(() => {
        pathnameRef.current = pathname
    }, [pathname])

    useBox(async ({ slot, horario }) => {
        await confirmarDosePelaCaixa(slot, horario);

        if (pathnameRef.current.includes('doseAlert')) {
            if (router.canGoBack()) router.back();
            else router.replace('/home');
        }
    });

    useMissedDoseAlert();

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
                <Stack.Screen 
                    name='esqueciSenha/index' options={{headerShown: false}}
                />
                <Stack.Screen 
                    name='politicaPrivacidade' options={{headerShown: false}}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}