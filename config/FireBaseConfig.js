// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBAE_API_KEY,
  authDomain: "minimed-28422.firebaseapp.com",
  projectId: "minimed-28422",
  storageBucket: "minimed-28422.appspot.com",
  messagingSenderId: "991180984851",
  appId: "1:991180984851:web:8292299c1c1e3d100025e6",
  measurementId: "G-SDKMP5486N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)