// Firebase configuration with redirect authentication
// This method works better with domain restrictions

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjrzvuPGmNrQuqzBnN_y5xDStCU-y5HlM",
  authDomain: "quickclip-4446c.firebaseapp.com",
  projectId: "quickclip-4446c",
  storageBucket: "quickclip-4446c.firebasestorage.app",
  messagingSenderId: "31602504581",
  appId: "1:31602504581:web:c80fe6bf2a0e60c281caec",
  measurementId: "G-H0GXNRP5TW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// リダイレクト方式でのログイン
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    // リダイレクト後に結果を取得
  } catch (error) {
    console.error("Error signing in with redirect:", error);
    throw error;
  }
};

// リダイレクト結果の確認
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting redirect result:", error);
    throw error;
  }
};

export { auth, db, onAuthStateChanged, signOut };