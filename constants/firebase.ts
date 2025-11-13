import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtLKE5hwEh8bXwc9k6VAoOia3JJYvHoRA",
  authDomain: "skillflowapp-3c4f7.firebaseapp.com",
  projectId: "skillflowapp-3c4f7",
  storageBucket: "skillflowapp-3c4f7.firebasestorage.app",
  messagingSenderId: "770255968398",
  appId: "1:770255968398:web:a9af344bae2770397051df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
