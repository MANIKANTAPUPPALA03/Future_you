import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCi5gL8SgIBST-sq55fmzK9r2AIkKxqCNc",
    authDomain: "futureyou-2021.firebaseapp.com",
    projectId: "futureyou-2021",
    storageBucket: "futureyou-2021.firebasestorage.app",
    messagingSenderId: "726614223613",
    appId: "1:726614223613:web:10fdcc52bdabd9a2d5ec94",
    measurementId: "G-BC9DGTFB0P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
