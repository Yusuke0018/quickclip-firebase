import React from 'react';
import { signInWithGoogle, logOut } from '../firebase';
import { LogIn, LogOut, User } from 'lucide-react';

const Auth = ({ user, onAuthStateChange }) => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      alert('ログインに失敗しました');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign out error:', error);
      alert('ログアウトに失敗しました');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-300">{user.displayName || user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">QuickClip</h1>
        <p className="text-gray-400 mb-8">定型文管理アプリケーション</p>
        <button
          onClick={handleSignIn}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Googleでログイン
        </button>
      </div>
    </div>
  );
};

export default Auth;