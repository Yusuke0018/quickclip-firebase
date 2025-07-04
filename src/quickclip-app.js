import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged,
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// State management
let currentUser = null;
let categories = [];
let snippets = [];
let editingCategory = null;
let selectedCategory = 'all';
let searchQuery = '';
let showCompleted = false;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auth state observer
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            console.log('User logged in:', user.email);
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            
            await loadUserData(user.uid);
            renderApp();
        } else {
            console.log('User not logged in');
            document.getElementById('authSection').style.display = 'flex';
            document.getElementById('mainApp').style.display = 'none';
            
            categories = [];
            snippets = [];
            renderApp();
        }
    });

    // Initialize all event listeners
    initializeEventListeners();
});

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        // Load categories
        const categoriesQuery = query(
            collection(db, 'users', userId, 'categories'),
            orderBy('order', 'asc')
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Load snippets
        const snippetsQuery = query(
            collection(db, 'users', userId, 'snippets'),
            orderBy('isPinned', 'desc'),
            orderBy('createdAt', 'desc')
        );
        const snippetsSnapshot = await getDocs(snippetsQuery);
        snippets = snippetsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('データの読み込みに失敗しました');
    }
}

// Sign in function
function signIn() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log('Login successful:', result.user.email);
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert('ログインに失敗しました: ' + error.message);
        });
}

// Sign out function  
function signOut() {
    if (confirm('ログアウトしますか？')) {
        firebaseSignOut(auth)
            .then(() => {
                console.log('Signed out successfully');
            })
            .catch((error) => {
                console.error('Sign out error:', error);
            });
    }
}

// Render app
function renderApp() {
    renderCategories();
    renderSnippets();
    updateActiveCategory();
}

// Render categories
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <button 
            class="category-item ${selectedCategory === 'all' ? 'active' : ''}"
            onclick="selectCategory('all')"
        >
            <span class="category-icon">📋</span>
            <span class="category-name">すべて</span>
            <span class="category-count">${snippets.length}</span>
        </button>
        ${categories.map(category => {
            const count = snippets.filter(s => s.categoryId === category.id).length;
            return `
                <button 
                    class="category-item ${selectedCategory === category.id ? 'active' : ''}"
                    onclick="selectCategory('${category.id}')"
                    style="--category-color: ${category.color}"
                >
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${count}</span>
                </button>
            `;
        }).join('')}
    `;
}

// Render snippets
function renderSnippets() {
    const container = document.getElementById('snippetsContainer');
    if (!container) return;
    
    let filteredSnippets = snippets;
    
    // Filter by category
    if (selectedCategory !== 'all') {
        filteredSnippets = filteredSnippets.filter(s => s.categoryId === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredSnippets = filteredSnippets.filter(snippet => 
            snippet.title.toLowerCase().includes(query) ||
            snippet.content.toLowerCase().includes(query) ||
            (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }
    
    if (filteredSnippets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>定型文がありません</p>
                <button class="btn btn-primary" onclick="createNewSnippet()">
                    新規作成
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredSnippets.map(snippet => `
        <div class="snippet-card ${snippet.isPinned ? 'pinned' : ''}" onclick="copyToClipboard('${snippet.id}')">
            ${snippet.isPinned ? '<span class="pin-icon">📌</span>' : ''}
            <h3 class="snippet-title">${escapeHtml(snippet.title)}</h3>
            <p class="snippet-content">${escapeHtml(snippet.content)}</p>
            ${snippet.tags && snippet.tags.length > 0 ? `
                <div class="snippet-tags">
                    ${snippet.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="snippet-actions">
                <button class="icon-button" onclick="editSnippet('${snippet.id}'); event.stopPropagation();">
                    <svg><!-- Edit icon --></svg>
                </button>
                <button class="icon-button" onclick="togglePin('${snippet.id}'); event.stopPropagation();">
                    <svg><!-- Pin icon --></svg>
                </button>
                <button class="icon-button" onclick="deleteSnippet('${snippet.id}'); event.stopPropagation();">
                    <svg><!-- Delete icon --></svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// Category management
export function openCategoryModal(category = null) {
    editingCategory = category;
    document.getElementById('categoryModalTitle').textContent = 
        category ? 'カテゴリーを編集' : 'カテゴリーを追加';
    
    if (category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('deleteCategoryBtn').style.display = 'block';
    } else {
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryIcon').value = '📁';
        document.getElementById('categoryColor').value = '#3B82F6';
        document.getElementById('deleteCategoryBtn').style.display = 'none';
    }
    
    document.getElementById('categoryModal').style.display = 'block';
}

export function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    editingCategory = null;
}

export async function deleteCategory() {
    if (!editingCategory) return;
    
    const categorySnippets = snippets.filter(s => s.categoryId === editingCategory.id);
    if (categorySnippets.length > 0) {
        alert(`このカテゴリーには${categorySnippets.length}個の定型文があります。先に定型文を削除するか、他のカテゴリーに移動してください。`);
        return;
    }
    
    if (!confirm('このカテゴリーを削除しますか？')) return;
    
    try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'categories', editingCategory.id));
        await loadUserData(currentUser.uid);
        closeCategoryModal();
        renderApp();
        showSuccess('カテゴリーを削除しました');
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('削除中にエラーが発生しました');
    }
}

// Export to global scope for HTML event handlers
window.signIn = signIn;
window.signOut = signOut;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.deleteCategory = deleteCategory;
window.selectCategory = (categoryId) => {
    selectedCategory = categoryId;
    renderApp();
};

// Initialize event listeners
function initializeEventListeners() {
    // Category form submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('categoryName').value;
            const icon = document.getElementById('categoryIcon').value;
            const color = document.getElementById('categoryColor').value;
            
            try {
                if (editingCategory) {
                    await updateDoc(doc(db, 'users', currentUser.uid, 'categories', editingCategory.id), {
                        name: name,
                        icon: icon,
                        color: color,
                        updatedAt: serverTimestamp()
                    });
                    showSuccess('カテゴリーを更新しました');
                } else {
                    await addDoc(collection(db, 'users', currentUser.uid, 'categories'), {
                        name: name,
                        icon: icon,
                        color: color,
                        order: categories.length,
                        createdAt: serverTimestamp()
                    });
                    showSuccess('カテゴリーを追加しました');
                }
                
                await loadUserData(currentUser.uid);
                closeCategoryModal();
                renderApp();
            } catch (error) {
                console.error('Error saving category:', error);
                alert('保存中にエラーが発生しました');
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderSnippets();
        });
    }
}

// Additional snippet management functions
window.copyToClipboard = async (snippetId) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;
    
    // テキストを無害化（制御文字のみを除去）
    // 制御文字（0x00-0x1F, 0x7F-0x9F）を除去し、タブ・改行・キャリッジリターンは保持
    const cleanedText = snippet.content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    
    try {
        await navigator.clipboard.writeText(cleanedText);
        showSuccess('コピーしました');
    } catch (error) {
        console.error('Copy failed:', error);
        alert('コピーに失敗しました');
    }
};

window.createNewSnippet = () => {
    // Implementation for creating new snippet
    console.log('Create new snippet');
};

window.editSnippet = (snippetId) => {
    // Implementation for editing snippet
    console.log('Edit snippet:', snippetId);
};

window.togglePin = async (snippetId) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;
    
    try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'snippets', snippetId), {
            isPinned: !snippet.isPinned,
            updatedAt: serverTimestamp()
        });
        await loadUserData(currentUser.uid);
        renderSnippets();
        showSuccess(snippet.isPinned ? 'ピン留めを解除しました' : 'ピン留めしました');
    } catch (error) {
        console.error('Error toggling pin:', error);
        alert('エラーが発生しました');
    }
};

window.deleteSnippet = async (snippetId) => {
    if (!confirm('この定型文を削除しますか？')) return;
    
    try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'snippets', snippetId));
        await loadUserData(currentUser.uid);
        renderSnippets();
        showSuccess('削除しました');
    } catch (error) {
        console.error('Error deleting snippet:', error);
        alert('削除中にエラーが発生しました');
    }
};

function updateActiveCategory() {
    // Update active category styles
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(button => {
        button.classList.remove('active');
    });
}

// Add missing modal functions
window.openSnippetModal = (snippet = null) => {
    // Implementation for opening snippet modal
    console.log('Open snippet modal');
};

window.closeSnippetModal = () => {
    document.getElementById('snippetModal').style.display = 'none';
};

window.openMobileMenu = () => {
    document.getElementById('sidebar').classList.add('mobile-active');
};

window.closeMobileMenu = () => {
    document.getElementById('sidebar').classList.remove('mobile-active');
};