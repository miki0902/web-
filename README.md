# mini-web-app（Posts CRUD）

FastAPI + SQLAlchemy + Alembic（バックエンド）と、React + TypeScript + Vite + MUI（フロントエンド）で作った、**投稿（Post）のCRUD（作成/一覧/更新/削除）**ができるミニWebアプリです。

---

## できること

- **投稿の作成**: タイトル/本文を入力して保存
- **投稿の一覧表示**: 保存されている投稿を表示
- **投稿の編集**: 既存投稿を更新
- **投稿の削除**: 既存投稿を削除

データはバックエンドのDB（`posts`テーブル）に永続化され、フロントエンドはHTTP（JSON）でAPIを呼び出します。

---

## リポジトリ構成（責務の分離）

```
.
├─ backend/   # FastAPI + DB（APIサーバ）
└─ frontend/  # React（ブラウザUI）
```

- **バックエンド**: `backend/README.md` を参照
- **フロントエンド**: `frontend/README.md` を参照

---

## クイックスタート（ローカル）

### バックエンド

`backend/README.md` の「ローカル起動」を参照してください（`DATABASE_URL` の設定が必須です）。

### フロントエンド

`frontend/README.md` の「ローカル起動」を参照してください（`VITE_API_URL` の設定が必須です）。

---

## デプロイ概要（Railway + Vercel）

- **バックエンド（FastAPI）**: Railway
  - DBは Railway の Postgres を使い、`DATABASE_URL` を Railway 側の環境変数として設定（Postgres追加で自動付与されることが多い）
- **フロントエンド（React）**: Vercel
  - `VITE_API_URL` を Vercel の環境変数として設定（RailwayのAPI URLを指定）

具体手順はそれぞれのREADMEに詳細があります。

- `backend/README.md` → 「Railway デプロイ」「公開停止/削除」
- `frontend/README.md` → 「Vercel デプロイ」「公開停止/削除」

