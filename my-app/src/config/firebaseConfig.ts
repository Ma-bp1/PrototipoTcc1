import { initializeApp } from 'firebase/app'
import { initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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

export const auth = initializeAuth(app)

export const db = getFirestore(app)