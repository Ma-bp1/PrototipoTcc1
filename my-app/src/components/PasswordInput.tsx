import { useState } from 'react'
import { View, Pressable, TextInputProps, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Input } from './Input'

export function PasswordInput({ style, ...rest }: TextInputProps) {
    const [show, setShow] = useState(false)

    return (
        <View style={styles.wrapper}>
            <Input
                {...rest}
                secureTextEntry={!show}
                placeholderTextColor="#999"
                autoCapitalize='none'
                style={[
                    styles.input,
                    style,
                ]}
            />
            <Pressable
                onPress={() => setShow(prev => !prev)}
                hitSlop={10}
                style={styles.icon}
            >
                <Feather name={show ? 'eye-off' : 'eye'} size={22} color='#05534E' />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginTop: 12,
        marginBottom: 12,
        justifyContent: 'center',
    },
    input: {
        color:'#000',
        marginTop: 0,
        marginBottom: 0,
        paddingRight: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 4,
    },
    icon: {
        position: 'absolute',
        right: 20,
    },
})