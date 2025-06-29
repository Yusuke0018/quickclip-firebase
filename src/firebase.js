// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjrzvuPGmNrQuqzBnN_y5xDStCU-y5HlM",
  authDomain: "quickclip-4446c.firebaseapp.com",
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

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore helper functions
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const createUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Category functions
export const getCategories = async (userId) => {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};

export const createCategory = async (userId, categoryData) => {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const docRef = doc(categoriesRef);
    await setDoc(docRef, {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (userId, categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await setDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (userId, categoryId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'categories', categoryId));
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Snippet functions
export const getSnippets = async (userId) => {
  try {
    const snippetsRef = collection(db, 'users', userId, 'snippets');
    const q = query(snippetsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting snippets:", error);
    throw error;
  }
};

export const createSnippet = async (userId, snippetData) => {
  try {
    const snippetsRef = collection(db, 'users', userId, 'snippets');
    const docRef = doc(snippetsRef);
    await setDoc(docRef, {
      ...snippetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating snippet:", error);
    throw error;
  }
};

export const updateSnippet = async (userId, snippetId, snippetData) => {
  try {
    const snippetRef = doc(db, 'users', userId, 'snippets', snippetId);
    await setDoc(snippetRef, {
      ...snippetData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating snippet:", error);
    throw error;
  }
};

export const deleteSnippet = async (userId, snippetId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'snippets', snippetId));
  } catch (error) {
    console.error("Error deleting snippet:", error);
    throw error;
  }
};

// Data migration functions
export const migrateFromLocalStorage = async (userId) => {
  try {
    // Get data from localStorage
    const localCategories = JSON.parse(localStorage.getItem('quickclip_categories') || '[]');
    const localSnippets = JSON.parse(localStorage.getItem('quickclip_snippets') || '[]');
    
    // Migrate categories
    for (const category of localCategories) {
      await createCategory(userId, {
        name: category.name,
        icon: category.icon || 'folder',
        color: category.color || '#3B82F6',
        order: category.order || 0
      });
    }
    
    // Migrate snippets
    for (const snippet of localSnippets) {
      await createSnippet(userId, {
        title: snippet.title,
        content: snippet.content,
        category: snippet.category,
        isPinned: snippet.isPinned || false,
        tags: snippet.tags || []
      });
    }
    
    // Clear localStorage after successful migration
    localStorage.removeItem('quickclip_categories');
    localStorage.removeItem('quickclip_snippets');
    
    return { success: true, message: 'Data migrated successfully' };
  } catch (error) {
    console.error("Error migrating data:", error);
    throw error;
  }
};

// Export/Import functions
export const exportUserData = async (userId) => {
  try {
    const categories = await getCategories(userId);
    const snippets = await getSnippets(userId);
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories,
      snippets
    };
    
    return exportData;
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
};

export const importUserData = async (userId, importData) => {
  try {
    // Validate import data
    if (!importData.categories || !importData.snippets) {
      throw new Error('Invalid import data format');
    }
    
    // Import categories
    const categoryIdMap = {};
    for (const category of importData.categories) {
      const oldId = category.id;
      const { id, createdAt, updatedAt, ...categoryData } = category;
      const newId = await createCategory(userId, categoryData);
      categoryIdMap[oldId] = newId;
    }
    
    // Import snippets with updated category IDs
    for (const snippet of importData.snippets) {
      const { id, createdAt, updatedAt, ...snippetData } = snippet;
      if (snippet.category && categoryIdMap[snippet.category]) {
        snippetData.category = categoryIdMap[snippet.category];
      }
      await createSnippet(userId, snippetData);
    }
    
    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
};

export { auth, db };