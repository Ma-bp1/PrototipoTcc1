import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'

export default function Index(){


    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser)=> {
            console.log('auth state:', firebaseUser?.email)
            setUser(firebaseUser)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    if (loading){
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size='large'/>
            </View>
        )
    }

    if (user) {
        return <Redirect href='/home'/>
    }

    return (

        <Redirect href='/login'/>
    )
}