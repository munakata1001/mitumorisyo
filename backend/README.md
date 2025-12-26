# 見積書デモアプリ バックエンドAPI

## 概要
見積書デモアプリのバックエンドAPIサーバー

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番サーバーの起動
npm start
```

## ディレクトリ構造

```
backend/
├── src/
│   ├── api/           # APIルート定義
│   ├── controllers/   # コントローラー（リクエスト処理）
│   ├── models/        # データモデル
│   ├── services/      # ビジネスロジック
│   ├── middleware/    # ミドルウェア
│   ├── utils/         # ユーティリティ関数
│   ├── config/        # 設定ファイル
│   └── index.js       # エントリーポイント
├── package.json
├── tsconfig.json
└── README.md
```

## API エンドポイント

- `POST /api/project-info` - 基本情報の保存
- `GET /api/project-info/:id` - 基本情報の取得
- `PUT /api/project-info/:id` - 基本情報の更新

## 環境変数

`.env`ファイルを作成して以下の環境変数を設定してください：

```
PORT=3001
NODE_ENV=development
```

