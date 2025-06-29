# QuickClip Firebase

定型文管理アプリケーション（Firebase対応版）

## 機能

- 🔐 **Google認証** - セキュアなログイン
- ☁️ **クラウド同期** - Firestoreでデータを安全に保存
- 📂 **カテゴリー管理** - カスタマイズ可能なカテゴリー
- ⭐ **ピン留め機能** - 重要な定型文を上部に固定
- 🔍 **検索機能** - タイトルと内容から検索
- 📤 **エクスポート/インポート** - データのバックアップと復元
- 🔄 **データ移行** - ローカルストレージからの自動移行

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 開発サーバーの起動
```bash
npm start
```

3. 本番ビルド
```bash
npm build
```

## Firebase設定

プロジェクトは既にFirebaseが設定されています。
- **プロジェクトID**: quickclip-4446c
- **認証**: Google認証
- **データベース**: Firestore

## データ構造

```
users/
  {userId}/
    categories/
      {categoryId}
        - name
        - icon
        - color
        - order
    snippets/
      {snippetId}
        - title
        - content
        - categoryId
        - isPinned
        - tags
```

## 使用技術

- React 18
- Firebase (Auth, Firestore)
- Tailwind CSS
- Lucide Icons
- Webpack