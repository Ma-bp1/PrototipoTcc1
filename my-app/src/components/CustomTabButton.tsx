import * as React from "react";
import { Pressable, View, Text, StyleSheet, PressableProps } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


type CustomTabButtonProps = PressableProps & {
    //registra chaves dos ícones como nomes dos ícones (glyphMap)
    icon: keyof typeof Feather.glyphMap | 'pill';
    isFocused: boolean;
}

export function CustomTabButton({icon, isFocused, ...rest}: CustomTabButtonProps) {
    const iconColor = isFocused ? '#FF6B8A' : '#31AEAE';

    return (
        <Pressable 
            style={({pressed}) => [
                styles.button,
                {opacity: pressed ? 0.5 : 1}
            ]}
            {...rest}
        >
                {icon === 'pill' ? (
                    <MaterialCommunityIcons
                        name='pill'
                        size={24}
                        color={iconColor}
                    />
                ) : (
                    <Feather
                        name ={icon as keyof typeof Feather.glyphMap}
                        size={24}
                        color={iconColor}
                    />
                )}
        </Pressable>
    )
} 
            

const styles = StyleSheet.create({
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    }
})