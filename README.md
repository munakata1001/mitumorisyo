# 見積書デモアプリ

見積書作成業務を効率化するためのWebアプリケーション。

## 技術スタック

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構成

```
見積書デモアプリ/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # トップページ
│   └── globals.css              # グローバルスタイル
├── frontend/                     # フロントエンド関連ファイル
│   ├── components/              # Reactコンポーネント
│   │   ├── common/              # 共通コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── estimate/            # 見積書関連コンポーネント
│   │   │   ├── ProjectInfoForm.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── CostCalculationForm.tsx
│   │   │   ├── SearchEstimateModal.tsx
│   │   │   └── SaveTemplateModal.tsx
│   │   └── layout/              # レイアウトコンポーネント
│   │       └── Header.tsx
│   ├── lib/                      # ライブラリ・ユーティリティ
│   │   ├── calculation/         # 計算ロジック
│   │   │   ├── materialCost.ts
│   │   │   ├── processingCost.ts
│   │   │   ├── paintingCost.ts
│   │   │   └── costSummary.ts
│   │   └── storage/             # ストレージ関連
│   │       └── localStorage.ts
│   └── types/                   # TypeScript型定義
│       └── estimate.ts
└── package.json
```

## 機能

- **基本情報入力機能**
  - 見積番号、客先、向先、機器名などの入力
  - リアルタイムバリデーション
  - レスポンシブデザイン

- **ファイルアップロード機能**
  - Excel/PDFファイルのアップロード
  - ドラッグ&ドロップ対応
  - 複数解析モード対応

- **原価計算機能**
  - 自動計算項目（材料費、加工費、塗装費）
  - 手動入力項目（外注検査費、輸送費等）
  - 原価サマリー自動計算

- **テンプレート機能**
  - テンプレート保存
  - 既設データ検索

## ディレクトリ構造の説明

- `app/`: Next.js App Routerのルートディレクトリ
- `frontend/`: フロントエンド関連のすべてのコード
  - `components/`: Reactコンポーネント
  - `lib/`: ユーティリティ関数とライブラリ
  - `types/`: TypeScript型定義

