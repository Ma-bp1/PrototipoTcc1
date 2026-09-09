import { initializeApp } from 'firebase/app'
import { initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyCPbSqHeV7XcY7yzpJxYiMp9oesD5WDzD8",
    authDomain: "prototipo1-2e5f1.firebaseapp.com",
    projectId: "prototipo1-2e5f1",
    storageBucket: "prototipo1-2e5f1.firebasestorage.app",
    messagingSenderId: "364859622545",
    appId: "1:364859622545:web:58ae2ab84a93ee31966b30",
    measurementId: "G-0E23H7YPY1"
}

const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app)

export const db = getFirestore(app)