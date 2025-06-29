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
