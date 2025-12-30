# 2級建築施工管理技士 第一次検定 過去問題集

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

2級建築施工管理技士 第一次検定の過去問題（250問）を学習できるWebアプリケーションです。

## ✨ 特徴

- 📚 **250問収録** - 令和3〜7年度の過去問題を完全収録
- 🎯 **詳細解説** - すべての選択肢に正誤理由を表示
- 📊 **学習統計** - 進捗管理・分野別統計・連続正解記録
- 🔍 **高度なフィルタリング** - 年度・分野・学習状況で絞り込み
- 💾 **自動保存** - LocalStorageで学習履歴を保存
- 📱 **レスポンシブ** - スマホ・タブレット・PCに対応
- 🐛 **バグ修正版** - 連続正解カウントの不具合を修正

## 🎬 デモ

[デモサイトを見る](#) ※デプロイ後にURLを追加

## 🚀 クイックスタート

### 前提条件

- Python 3.11以上
- pip
- Git

### ローカルで実行

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/kentiku-exam.git
cd kentiku-exam

# 仮想環境を作成
python -m venv venv

# 仮想環境を有効化
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 依存パッケージをインストール
pip install -r requirements.txt

# アプリケーションを起動
python app.py
```

ブラウザで http://localhost:5000 にアクセス

## 📦 デプロイ

### Heroku

```bash
# Heroku CLIでログイン
heroku login

# アプリを作成
heroku create kentiku-exam

# デプロイ
git push heroku main

# アプリを開く
heroku open
```

### Render

1. [Render](https://render.com) にログイン
2. 「New +」→「Web Service」を選択
3. このリポジトリを接続
4. 以下の設定を入力:
   - **Name**: kentiku-exam
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. 「Create Web Service」をクリック

### Railway

1. [Railway](https://railway.app) にログイン
2. 「New Project」→「Deploy from GitHub repo」
3. このリポジトリを選択
4. 自動的にデプロイされます

### Vercel (Serverless)

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

### PythonAnywhere

1. [PythonAnywhere](https://www.pythonanywhere.com) にログイン
2. 「Web」タブ→「Add a new web app」
3. 「Flask」を選択
4. リポジトリをクローンして設定

## 📁 プロジェクト構成

```
kentiku-exam/
├── app.py                  # Flaskアプリケーション本体
├── requirements.txt        # Python依存パッケージ
├── runtime.txt            # Pythonバージョン指定
├── Procfile               # Heroku用設定
├── .gitignore             # Git除外ファイル
├── README.md              # このファイル
├── static/                # 静的ファイル
│   ├── css/              # スタイルシート
│   │   ├── style.css
│   │   ├── animations.css
│   │   └── notification.css
│   ├── js/               # JavaScript
│   │   ├── common.js     # 共通関数（バグ修正版）
│   │   ├── index.js
│   │   ├── questions.js
│   │   ├── quiz.js
│   │   ├── explanation.js
│   │   └── stats.js
│   └── data/             # データファイル
│       └── questions.json # 問題データ（250問）
└── templates/             # HTMLテンプレート
    ├── index.html        # トップページ
    ├── questions.html    # 問題一覧
    ├── quiz.html         # 問題解答
    ├── explanation.html  # 解説
    └── stats.html        # 統計
```

## 🔧 API エンドポイント

### GET /api/questions
すべての問題を取得

**レスポンス例:**
```json
[
  {
    "id": "r07_001",
    "number": 1,
    "year": "r07",
    "category": "architecture",
    "title": "照明に関する記述",
    "text": "照明に関する次の記述のうち...",
    "choices": ["...", "...", "...", "..."],
    "correctAnswer": 4,
    "explanation": {...}
  }
]
```

### GET /api/questions/:id
特定の問題を取得

**レスポンス例:**
```json
{
  "id": "r07_001",
  "number": 1,
  "year": "r07",
  ...
}
```

### GET /api/health
ヘルスチェック

**レスポンス例:**
```json
{
  "status": "ok",
  "message": "2級建築施工管理技士 過去問題集 API",
  "version": "1.0.1"
}
```

## 🐛 バグ修正内容

このバージョンでは以下のバグを修正しました:

### 修正1: 連続正解カウントのロジック不具合
- **問題**: 同じ問題を再解答すると統計が二重カウントされる
- **修正**: 前回の解答状態を確認してから処理するように改善

### 修正2: 統計情報の再計算不足
- **問題**: タイムスタンプ順での連続正解計算が行われない
- **修正**: userAnswersから毎回再計算し、正確な統計を返すように改善

詳細は [BUGFIX_SUMMARY.md](BUGFIX_SUMMARY.md) を参照してください。

## 🧪 テスト

```bash
# テストを実行（今後実装予定）
pytest

# カバレッジレポート
pytest --cov=app
```

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👥 作成者

- **Produced by** - NL-DG Co., Ltd. & Narukawa Co., Ltd.

## 🙏 謝辞

- 過去問題データの提供元
- Flaskフレームワーク
- すべてのコントリビューター

## 📮 お問い合わせ

質問や提案がある場合は、[issue](https://github.com/yourusername/kentiku-exam/issues)を開いてください。

---

© 2025 2級建築施工管理技士 過去問題集 | Produced by NL-DG Co., Ltd. & Narukawa Co., Ltd.
