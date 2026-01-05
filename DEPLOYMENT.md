# デプロイガイド - Python版

## 🚀 デプロイ方法

このアプリケーションは複数のプラットフォームにデプロイできます。

---

## 1️⃣ Render (推奨 - 無料プラン有り)

### 手順

1. **Renderにアクセス**
   - https://render.com にアクセス
   - GitHubアカウントでサインイン

2. **新しいWeb Serviceを作成**
   - 「New +」→「Web Service」をクリック
   - GitHubリポジトリを接続

3. **設定**
   - **Name**: `kentiku-exam`
   - **Environment**: `Python 3`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: `Free`

4. **環境変数（オプション）**
   - 必要に応じて設定

5. **デプロイ**
   - 「Create Web Service」をクリック
   - 自動的にビルド＆デプロイが開始されます

6. **完了**
   - 数分後に `https://kentiku-exam.onrender.com` のようなURLでアクセス可能

### メリット
- ✅ 無料プランあり（月750時間）
- ✅ 自動デプロイ（GitHubプッシュで自動更新）
- ✅ SSL/HTTPS自動対応
- ✅ カスタムドメイン設定可能
- ✅ 環境変数管理

---

## 2️⃣ Railway

### 手順

1. **Railwayにアクセス**
   - https://railway.app にアクセス
   - GitHubアカウントでサインイン

2. **新しいプロジェクトを作成**
   - 「New Project」をクリック
   - 「Deploy from GitHub repo」を選択

3. **リポジトリを選択**
   - このリポジトリを選択
   - 自動的に検出＆設定されます

4. **環境変数（オプション）**
   - Settings → Variables で設定

5. **完了**
   - 自動的にデプロイされます
   - Settings → Domains でURLを確認

### メリット
- ✅ 無料プラン（$5/月のクレジット）
- ✅ 非常にシンプルなセットアップ
- ✅ 自動スケーリング
- ✅ データベース統合が簡単

---

## 3️⃣ Heroku

### 手順

1. **Heroku CLIをインストール**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # https://devcenter.heroku.com/articles/heroku-cli からインストーラーをダウンロード
   ```

2. **ログイン**
   ```bash
   heroku login
   ```

3. **アプリを作成**
   ```bash
   heroku create kentiku-exam
   ```

4. **デプロイ**
   ```bash
   git push heroku main
   ```

5. **アプリを開く**
   ```bash
   heroku open
   ```

### メリット
- ✅ 信頼性が高い
- ✅ 豊富なアドオン
- ✅ 詳細なログ
- ⚠️ 無料プランは2022年11月に終了（有料プランのみ）

---

## 4️⃣ Vercel (Serverless)

### 手順

1. **Vercel CLIをインストール**
   ```bash
   npm i -g vercel
   ```

2. **デプロイ**
   ```bash
   vercel
   ```

3. **プロダクションデプロイ**
   ```bash
   vercel --prod
   ```

### メリット
- ✅ 無料プラン（十分な容量）
- ✅ 超高速デプロイ
- ✅ エッジネットワーク
- ✅ 自動HTTPS
- ⚠️ Serverless環境（一部制限あり）

---

## 5️⃣ PythonAnywhere

### 手順

1. **PythonAnywhereにサインアップ**
   - https://www.pythonanywhere.com

2. **Bashコンソールを開く**
   - Consoles → Bash

3. **リポジトリをクローン**
   ```bash
   git clone https://github.com/yourusername/kentiku-exam.git
   cd kentiku-exam
   ```

4. **仮想環境を作成**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Webアプリを設定**
   - Web → Add a new web app
   - Manual configuration → Python 3.11
   - **Source code**: `/home/yourusername/kentiku-exam`
   - **Working directory**: `/home/yourusername/kentiku-exam`
   - **Virtualenv**: `/home/yourusername/kentiku-exam/venv`

6. **WSGIファイルを編集**
   ```python
   import sys
   path = '/home/yourusername/kentiku-exam'
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```

7. **リロード**
   - Web → Reload

### メリット
- ✅ 無料プラン（制限あり）
- ✅ 永続的なストレージ
- ✅ 定期タスク（cron）
- ✅ MySQL/PostgreSQL対応

---

## 6️⃣ Google Cloud Run

### 手順

1. **Dockerfileを作成**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD exec gunicorn --bind :$PORT app:app
   ```

2. **Google Cloud SDKをインストール**
   ```bash
   # https://cloud.google.com/sdk/docs/install
   ```

3. **プロジェクトを作成**
   ```bash
   gcloud projects create kentiku-exam
   gcloud config set project kentiku-exam
   ```

4. **Cloud Runにデプロイ**
   ```bash
   gcloud run deploy kentiku-exam --source . --platform managed --region us-central1 --allow-unauthenticated
   ```

### メリット
- ✅ 無料枠（月200万リクエスト）
- ✅ 自動スケーリング
- ✅ コンテナベース
- ✅ Google Cloud統合

---

## 🔧 環境変数

必要に応じて以下の環境変数を設定:

```bash
# 開発環境
FLASK_ENV=development
FLASK_DEBUG=True

# 本番環境
FLASK_ENV=production
FLASK_DEBUG=False
```

---

## 📊 パフォーマンス最適化

### Gunicornワーカー数

```bash
# ワーカー数 = (2 x CPU数) + 1
gunicorn app:app --workers 3 --timeout 120
```

### キャッシュ設定

静的ファイルのキャッシュを有効化（Nginxなど）

---

## 🐛 トラブルシューティング

### 問題: アプリが起動しない
**解決策**:
1. ログを確認
2. Pythonバージョンを確認（3.11以上）
3. 依存パッケージを再インストール

### 問題: 静的ファイルが読み込めない
**解決策**:
1. `static/` フォルダの存在を確認
2. パス設定を確認
3. ファイルパーミッションを確認

---

## 📝 デプロイ後のチェックリスト

- [ ] アプリが正常に起動する
- [ ] トップページが表示される
- [ ] 問題一覧が表示される
- [ ] 問題を解答できる
- [ ] 統計が正しく表示される
- [ ] モバイルで正常に表示される
- [ ] HTTPS接続が有効

---

お疲れ様でした！🎉
