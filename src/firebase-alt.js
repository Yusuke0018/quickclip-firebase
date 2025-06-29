// Alternative Firebase configuration using default Firebase domain
// This avoids the authorized domain issue

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Use Firebase's default domain to avoid domain authorization issues
const firebaseConfig = {
  apiKey: "AIzaSyDjrzvuPGmNrQuqzBnN_y5xDStCU-y5HlM",
  authDomain: "quickclip-4446c.firebaseapp.com", // Use Firebase default domain
  projectId: "quickclip-4446c",
  storageBucket: "quickclip-4446c.firebasestorage.app",
  messagingSenderId: "31602504581",
  appId: "1:31602504581:web:c80fe6bf2a0e60c281caec",
  measurementId: "G-H0GXNRP5TW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure the OAuth redirect
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export all the same functions as before
export * from './firebase';
export { auth, db };