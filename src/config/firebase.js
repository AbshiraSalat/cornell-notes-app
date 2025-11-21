import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRzJFG8FydpWcCbqnWRiQPPLvC-BFZRSE",
  authDomain: "cornell-notes-80a20.firebaseapp.com",
  projectId: "cornell-notes-80a20",
  storageBucket: "cornell-notes-80a20.firebasestorage.app",
  messagingSenderId: "392044719836",
  appId: "1:392044719836:web:600ceff75528d184cc4e19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;