import { initializeApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
    apiKey: "AIzaSyCdH_Y6ubkcqECLsWJ-DBAyYA7FtqggRRw",
    authDomain: "projeto-1-c7102.firebaseapp.com",
    projectId: "projeto-1-c7102",
    storageBucket: "projeto-1-c7102.firebasestorage.app",
    messagingSenderId: "258440549920",
    appId: "1:258440549920:web:a28f7841592b9073c3ce45",
    measurementId: "G-MMRV653NPF"
};

const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

export const db = getFirestore(app)

