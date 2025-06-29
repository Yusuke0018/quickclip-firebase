# Firebase認証設定ガイド

## Google認証エラーの解決方法

### 1. Firebase Consoleでの設定

1. [Firebase Console](https://console.firebase.google.com/project/quickclip-4446c/authentication/providers)にアクセス
2. 「Google」プロバイダーが有効になっているか確認
3. サポートメールが設定されているか確認

### 2. 承認済みドメインの追加

Firebase Console > Authentication > Settings > Authorized domainsで以下を追加：

- `localhost`
- `quickclip-4446c.firebaseapp.com`
- `quickclip-4446c.web.app`
- `quickclip-firebase.vercel.app`
- その他のVercelドメイン

### 3. よくあるエラーと対処法

#### エラー: "auth/unauthorized-domain"
- 承認済みドメインにVercelのURLを追加してください

#### エラー: "auth/operation-not-allowed"
- Googleプロバイダーが有効になっているか確認してください

#### エラー: "auth/popup-blocked"
- ポップアップブロッカーを無効にしてください

### 4. デバッグ方法

ブラウザのコンソールで詳細なエラーを確認：
```javascript
// コンソールで実行
console.log('Firebase Auth Error Details');
```

### 5. 代替案：メール/パスワード認証

Googleログインが機能しない場合は、一時的にメール/パスワード認証を使用することもできます。