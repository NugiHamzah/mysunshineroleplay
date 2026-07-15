// ==========================================
// My Sunshine Roleplay
// Firebase Configuration
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// ==========================================
// GANTI DENGAN CONFIG FIREBASE KAMU
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyBZ-EcUgi2570KS-pos8wK0smxFOuFMUjw",
    authDomain: "mysunshineroleplay.firebaseapp.com",
    projectId: "mysunshineroleplay",
    storageBucket: "mysunshineroleplay.firebasestorage.app",
    messagingSenderId: "441072977699",
    appId: "1:441072977699:web:769b05865f434111d26e96"
};

// ==========================================
// Initialize Firebase
// ==========================================

const app = initializeApp(firebaseConfig);

// ==========================================
// Authentication
// ==========================================

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

// ==========================================
// Firestore
// ==========================================

const db = getFirestore(app);

// ==========================================
// Storage
// ==========================================

const storage = getStorage(app);

// ==========================================
// Export
// ==========================================

export {
    auth,
    db,
    storage,
    googleProvider,
    serverTimestamp
};