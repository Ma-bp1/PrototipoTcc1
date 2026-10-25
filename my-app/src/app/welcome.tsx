import { View, Text, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native'
import { Button } from '../components/Button'
import { useRouter } from 'expo-router'

export default function Welcome() {
    const router = useRouter()
    const { width, height } = useWindowDimensions()

    const logoWidth = width * 0.68
    const logoHeight = logoWidth / 1.5 // Figma box ratio

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Wrapper keeps at least a full screen of height, and scrolls if content is taller */}
            <View style={{ flex: 1, minHeight: height }}>
                <Image
                    source={require('../../assets/welcome.png')}
                    style={styles.background}
                    resizeMode="cover"
                />

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/Chronomedi.png')}
                        style={{ width: logoWidth, height: logoHeight }}
                        resizeMode="contain"
                    />
                </View>

                {/* Text + mascot */}
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Bem vindo!</Text>
                        <Text style={styles.subtitle}>
                            Gerencie seus medicamentos de forma{' '}
                            <Text style={{ fontStyle: 'italic' }}>simples</Text> e segura.
                        </Text>
                    </View>

                    <Image
                        source={require('../../assets/mascot.png')}
                        style={[
                            styles.mascot,
                            { width: width * 0.55, height: height * 0.4 },
                        ]}
                        resizeMode="contain"
                    />
                </View>

                {/* Button */}
                <View style={styles.footer}>
                    <View style={styles.buttonWrapper}>
                        <Button label="Entrar" onPress={() => router.push('/login')} />
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '75%',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    content: {
        flex: 1,
        marginTop: 10,
    },
    textContainer: {
        paddingLeft: 24,
        width: '55%',
        zIndex: 2,
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 32,
        marginBottom: 12,
    },
    subtitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 28,
    },
    mascot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    footer: {
        paddingBottom: 40,
        paddingTop: 16,
    },
    buttonWrapper: {
        alignSelf: 'center',
        width: '50%',
        minWidth: 160,
    },
})