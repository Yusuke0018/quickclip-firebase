import React, { useState, useEffect, useMemo } from 'react';
import Auth from './components/Auth';
import { onAuthChange, getCategories, getSnippets, createCategory, updateCategory, deleteCategory, createSnippet, updateSnippet, deleteSnippet, migrateFromLocalStorage, exportUserData, importUserData } from './firebase';
import { Copy, Plus, Edit2, Trash2, Search, Menu, X, Check, Folder, Star, Hash, Key, FileText, Mail, Code, Globe, Heart, Zap, Settings, Shield, Book, Users, Calendar, DollarSign, Phone, Home, Briefcase, Award, Coffee, Music, Camera, Clock, Download, Upload, AlertCircle } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [newSnippet, setNewSnippet] = useState({ title: '', content: '', categoryId: null });
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'folder', color: '#3B82F6' });

  const iconMap = {
    key: Key, folder: Folder, star: Star, hash: Hash, filetext: FileText,
    mail: Mail, code: Code, globe: Globe, heart: Heart, zap: Zap,
    settings: Settings, shield: Shield, book: Book, users: Users,
    calendar: Calendar, dollar: DollarSign, phone: Phone, home: Home,
    briefcase: Briefcase, award: Award, coffee: Coffee, music: Music,
    camera: Camera, clock: Clock
  };

  const colorOptions = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
  ];

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await loadUserData(authUser.uid);
        
        // Check if local data exists and show migration prompt
        const hasLocalData = localStorage.getItem('quickclip_categories') || localStorage.getItem('quickclip_snippets');
        if (hasLocalData) {
          setShowMigrationModal(true);
        }
      } else {
        setCategories([]);
        setSnippets([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserData = async (userId) => {
    try {
      const [categoriesData, snippetsData] = await Promise.all([
        getCategories(userId),
        getSnippets(userId)
      ]);
      setCategories(categoriesData);
      setSnippets(snippetsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('«¸øn≠ºk1WW~W_');
    }
  };

  const handleMigration = async () => {
    if (!user) return;
    
    try {
      await migrateFromLocalStorage(user.uid);
      await loadUserData(user.uid);
      setShowMigrationModal(false);
      alert('Ì¸´Î«¸øíc8k˚LW~W_');
    } catch (error) {
      console.error('Migration error:', error);
      alert('«¸ø˚Lk1WW~W_');
    }
  };

  const handleExport = async () => {
    if (!user) return;

    try {
      const data = await exportUserData(user.uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickclip-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('®Øπ›¸»k1WW~W_');
    }
  };

  const handleImport = async (event) => {
    if (!user) return;

    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importUserData(user.uid, data);
      await loadUserData(user.uid);
      alert('«¸øíc8k§Û›¸»W~W_');
    } catch (error) {
      console.error('Import error:', error);
      alert('§Û›¸»k1WW~W_');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('≥‘¸k1W:', err);
      alert('≥‘¸k1WW~W_');
    });
  };

  const addCategory = async () => {
    if (!user || !newCategory.name.trim()) return;

    try {
      const categoryData = {
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        order: categories.length
      };
      await createCategory(user.uid, categoryData);
      await loadUserData(user.uid);
      setNewCategory({ name: '', icon: 'folder', color: '#3B82F6' });
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('´∆¥Í¸n˝†k1WW~W_');
    }
  };

  const editCategory = async () => {
    if (!user || !editingCategory) return;

    try {
      const { id, ...categoryData } = editingCategory;
      await updateCategory(user.uid, id, categoryData);
      await loadUserData(user.uid);
      setEditingCategory(null);
      setShowEditCategoryModal(false);
    } catch (error) {
      console.error('Error editing category:', error);
      alert('´∆¥Í¸nË∆k1WW~W_');
    }
  };

  const deleteCategoryHandler = async (categoryId) => {
    if (!user) return;
    
    if (!confirm('Sn´∆¥Í¸íJdW~YK¢#YãöãáÇJdUå~Y')) return;

    try {
      // Delete category
      await deleteCategory(user.uid, categoryId);
      
      // Delete related snippets
      const relatedSnippets = snippets.filter(s => s.categoryId === categoryId);
      await Promise.all(relatedSnippets.map(s => deleteSnippet(user.uid, s.id)));
      
      await loadUserData(user.uid);
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('´∆¥Í¸nJdk1WW~W_');
    }
  };

  const addSnippet = async () => {
    if (!user || !newSnippet.title.trim() || !newSnippet.content.trim()) return;

    try {
      const snippetData = {
        title: newSnippet.title,
        content: newSnippet.content,
        categoryId: newSnippet.categoryId || selectedCategory || categories[0]?.id,
        isPinned: false,
        tags: []
      };
      await createSnippet(user.uid, snippetData);
      await loadUserData(user.uid);
      setNewSnippet({ title: '', content: '', categoryId: null });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding snippet:', error);
      alert('öãán˝†k1WW~W_');
    }
  };

  const editSnippet = async () => {
    if (!user || !editingSnippet) return;

    try {
      const { id, ...snippetData } = editingSnippet;
      await updateSnippet(user.uid, id, snippetData);
      await loadUserData(user.uid);
      setEditingSnippet(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error editing snippet:', error);
      alert('öãánË∆k1WW~W_');
    }
  };

  const deleteSnippetHandler = async (snippetId) => {
    if (!user) return;
    
    if (!confirm('SnöãáíJdW~YK')) return;

    try {
      await deleteSnippet(user.uid, snippetId);
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert('öãánJdk1WW~W_');
    }
  };

  const togglePin = async (snippetId) => {
    if (!user) return;

    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    try {
      await updateSnippet(user.uid, snippetId, { isPinned: !snippet.isPinned });
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('‘ÛYÅnäˇHk1WW~W_');
    }
  };

  const filteredSnippets = useMemo(() => {
    let filtered = selectedCategory
      ? snippets.filter(s => s.categoryId === selectedCategory)
      : snippets;

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [snippets, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">≠º-...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {showMenu ? <X /> : <Menu />}
            </button>
            <h1 className="text-2xl font-bold">QuickClip</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder=""..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="®Øπ›¸»"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <label className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" title="§Û›¸»">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">∞è˝†</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className={`${showMenu ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-4`}>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">´∆¥Í¸</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                Yyf ({snippets.length})
              </button>
              
              {categories.map(category => {
                const Icon = iconMap[category.icon] || Folder;
                const count = snippets.filter(s => s.categoryId === category.id).length;
                
                return (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between group px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <div className={`w-5 h-5 rounded`} style={{ backgroundColor: category.color }}>
                        <Icon className="w-5 h-5 p-0.5" />
                      </div>
                      <span>{category.name} ({count})</span>
                    </button>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(category);
                          setShowEditCategoryModal(true);
                        }}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategoryHandler(category.id);
                        }}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User info */}
          <Auth user={user} />
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name || 'Yyf'
                  : 'Yyfnöãá'
                }
              </h2>
              <span className="text-gray-400">{filteredSnippets.length} ˆ</span>
            </div>

            {filteredSnippets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>öãáLBä~[ì</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  ∞WDöãáí˝†
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSnippets.map(snippet => {
                  const category = categories.find(c => c.id === snippet.categoryId);
                  
                  return (
                    <div
                      key={snippet.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {category && (
                            <div
                              className="w-5 h-5 rounded"
                              style={{ backgroundColor: category.color }}
                            >
                              {iconMap[category.icon] && React.createElement(iconMap[category.icon], {
                                className: "w-5 h-5 p-0.5"
                              })}
                            </div>
                          )}
                          <h3 className="font-semibold">{snippet.title}</h3>
                          {snippet.isPinned && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => togglePin(snippet.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                            title="‘ÛYÅ"
                          >
                            <Star className={`w-4 h-4 ${snippet.isPinned ? 'text-yellow-400 fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => copyToClipboard(snippet.content, snippet.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            {copiedId === snippet.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingSnippet(snippet);
                              setShowEditModal(true);
                            }}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSnippetHandler(snippet.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm line-clamp-3">{snippet.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Migration Modal */}
      {showMigrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold">Ì¸´Î«¸øn˚L</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Ì¸´Îπ»Ï¸∏k›XUå_«¸øLãdKä~W_
              ØÈ¶…k˚LW~YK
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowMigrationModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                åg
              </button>
              <button
                onClick={handleMigration}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ˚LYã
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">∞èöãá</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ø§»Î</label>
                <input
                  type="text"
                  value={newSnippet.title}
                  onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ø§»Îíeõ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">´∆¥Í¸</label>
                <select
                  value={newSnippet.categoryId || selectedCategory || categories[0]?.id || ''}
                  onChange={(e) => setNewSnippet({ ...newSnippet, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Öπ</label>
                <textarea
                  value={newSnippet.content}
                  onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="öãánÖπíeõ"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSnippet({ title: '', content: '', categoryId: null });
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ≠„ÛªÎ
              </button>
              <button
                onClick={addSnippet}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ˝†
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSnippet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">öãáíË∆</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ø§»Î</label>
                <input
                  type="text"
                  value={editingSnippet.title}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">´∆¥Í¸</label>
                <select
                  value={editingSnippet.categoryId}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Öπ</label>
                <textarea
                  value={editingSnippet.content}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSnippet(null);
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ≠„ÛªÎ
              </button>
              <button
                onClick={editSnippet}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ›X
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">∞è´∆¥Í¸</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">´∆¥Í¸</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="´∆¥Í¸íeõ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">¢§≥Û</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.keys(iconMap).map(iconName => {
                    const Icon = iconMap[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => setNewCategory({ ...newCategory, icon: iconName })}
                        className={`p-2 rounded-lg transition-colors ${
                          newCategory.icon === iconName
                            ? 'bg-blue-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">r</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={`h-10 rounded-lg transition-all ${
                        newCategory.color === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategory({ name: '', icon: 'folder', color: '#3B82F6' });
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ≠„ÛªÎ
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ˝†
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">´∆¥Í¸íË∆</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">´∆¥Í¸</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">¢§≥Û</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.keys(iconMap).map(iconName => {
                    const Icon = iconMap[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => setEditingCategory({ ...editingCategory, icon: iconName })}
                        className={`p-2 rounded-lg transition-colors ${
                          editingCategory.icon === iconName
                            ? 'bg-blue-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">r</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                      className={`h-10 rounded-lg transition-all ${
                        editingCategory.color === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ≠„ÛªÎ
              </button>
              <button
                onClick={editCategory}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ›X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;