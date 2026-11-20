import * as ImagePicker from 'expo-image-picker'

export async function pickSmallPhoto(): Promise<string | null> {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return null

    const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,   // baixo = arquivo pequeno
        base64: true,
    })
    if (res.canceled) return null

    const asset = res.assets[0]
    if (!asset.base64) return null

    return `data:image/jpeg;base64,${asset.base64}`
}