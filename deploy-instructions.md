# デプロイ方法

## 1. Firebase Hosting（推奨）

すでにFirebaseプロジェクトが設定されているので、最も簡単です。

```bash
# Firebase CLIでログイン
firebase login

# プロジェクトを初期化（すでに設定済み）
# firebase init

# デプロイ
firebase deploy --only hosting
```

デプロイ後のURL: https://quickclip-4446c.web.app

## 2. Vercel

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel

# プロンプトに従って設定
# - プロジェクト名を入力
# - ビルドコマンド: npm run build
# - 出力ディレクトリ: dist
```

## 3. Netlify

1. [Netlify](https://app.netlify.com/)にログイン
2. GitHubリポジトリを接続
3. ビルド設定：
   - ビルドコマンド: `npm run build`
   - 公開ディレクトリ: `dist`

## 現在のビルドエラーについて

App.jsの309行目に文字化けがあるため、手動で修正が必要です：
- `placeholder=""..."` を `placeholder="検索..."` に変更

または、Firebase Hostingで静的ファイルとして直接デプロイすることも可能です。