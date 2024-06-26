// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCZ_xJdQapJ8l4H0iayOu6qxrzud-7GPBU",
    authDomain: "contact-app-34768.firebaseapp.com",
    projectId: "contact-app-34768",
    storageBucket: "contact-app-34768.appspot.com",
    messagingSenderId: "197446217097",
    appId: "1:197446217097:web:f6ec9f2a3e6cfdb44a8558",
    measurementId: "G-NYFW7WWLK6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
