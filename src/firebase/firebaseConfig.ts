import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAIj4AydPrNIpoYrPLJEPYdpBla66-YC7Q",
    authDomain: "team-cherry.firebaseapp.com",
    projectId: "team-cherry",
    storageBucket: "team-cherry.firebasestorage.app",
    messagingSenderId: "807077609620",
    appId: "1:807077609620:web:fd9bade00797a5f434f481",
    measurementId: "G-NT9RHRJ4Y4"
};

// initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp)

export { firebaseApp, auth }
