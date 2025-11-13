import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDtLKE5hwEh8bXwc9k6VAoOia3JJYvHoRA',
  authDomain: 'skillflowapp-3c4f7.firebaseapp.com',
  projectId: 'skillflowapp-3c4f7',
  storageBucket: 'skillflowapp-3c4f7.appspot.com',
  messagingSenderId: '770255968398',
  appId: '1:770255968398:web:a9af344bae2770397051df',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const persistence = Platform.OS === 'web' 
  ? indexedDBLocalPersistence 
  : getReactNativePersistence(AsyncStorage);

const auth = initializeAuth(app, {
  persistence,
});

const db = getFirestore(app);

export { app, auth, db };
