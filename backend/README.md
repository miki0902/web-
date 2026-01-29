# backend（FastAPI / SQLAlchemy / Alembic）

このディレクトリは **投稿（Post）を管理するREST API** を提供します。DBに保存された投稿を、HTTP（JSON）で **作成/一覧/更新/削除** できます。

---

## 技術スタック

- **FastAPI**: APIフレームワーク（ルーティング、バリデーション、OpenAPI）
- **SQLAlchemy**: ORM（DBテーブルをPythonクラスで扱う）
- **Alembic**: マイグレーション（スキーマ変更の履歴管理）
- **python-dotenv**: `.env` から環境変数を読み込む
- **psycopg2-binary**: PostgreSQLドライバ（Railway等のPostgres向け）

---

## ディレクトリ構成と責務（どこに何を書くか）

```
backend/
├─ main.py                 # FastAPIアプリ、CORS、ルーティング（HTTPの入口）
├─ database.py             # DB接続（DATABASE_URL -> engine / SessionLocal / Base）
├─ deps.py                 # FastAPIの依存性注入（DBセッションをリクエスト単位で提供）
├─ models/
│  └─ post.py              # SQLAlchemyモデル（DBテーブル定義）
├─ schemas/
│  └─ post.py              # Pydanticスキーマ（入出力JSONの型/バリデーション）
├─ repository/
│  └─ post_repository.py   # DBアクセス層（CRUDの実装）
├─ service/
│  └─ post_service.py      # ビジネスロジック層（例外化・ルール・集約）
└─ alembic/                # マイグレーション（versions配下に履歴）
```

### 役割分担（重要）

- **`schemas/`（Pydantic）**: 「APIで受け取る/返すJSON」を定義します。  
  例：`NewPost`（リクエスト用）, `Post`（レスポンス用）
- **`models/`（SQLAlchemy）**: 「DBテーブルの形」を定義します。  
  例：`posts` テーブル、カラム `title/body/userId/created_at/updated_at`
- **`repository/`**: DBに対して `SELECT/INSERT/UPDATE/DELETE` を行う純粋な層です。  
  *原則*: ここは「DBの都合」に寄せてOK（クエリ、commit/refreshなど）
- **`service/`**: 仕様（業務ルール）を表現する層です。  
  *原則*: ここで「存在しないIDは404にしたい」「入力をチェックしたい」などを扱う
- **`main.py`**: HTTPの入口。依存性注入（DBセッション）を受け取り、serviceを呼びます。

この分離により、将来的に「DB変更」「API追加」「バリデーション強化」などの改良がしやすくなります。

---

## 主要ファイルのコード解説（何をしているか）

### `main.py`（HTTPの入口）

- `app = FastAPI()` でアプリ本体を作成
- CORSミドルウェアでブラウザからの呼び出しを許可（現在は全許可）
- `@app.on_event("startup")` で **起動時に `Base.metadata.create_all()`** を実行し、テーブルが無ければ作成
- ルート（`/posts`）で service 層を呼び出し、HTTPレスポンスとして返す

> なぜserviceを挟む？  
> `main.py` は「HTTPの都合（status code, path param, body）」に集中し、  
> ビジネスロジックやDBアクセス詳細は別層に逃がすためです。

### `database.py`（DB接続の中心）

- `.env` を読み込み、`DATABASE_URL` を取得
- `create_engine(DATABASE_URL)` でSQLAlchemy Engine作成
- `SessionLocal`（DBセッション工場）と `Base`（モデルの基底）を定義

> ここを触るのはどんな時？  
> DBの種類を変える（SQLite→Postgres）、ログ（`echo`）のON/OFF、接続オプション追加など。

### `deps.py`（DBセッションのライフサイクル）

- `get_db()` が `yield db` することで、FastAPIがリクエストの間だけDBセッションを生存させます
- `finally: db.close()` で必ずクローズされ、コネクションリークを防ぎます

### `repository/post_repository.py`（CRUD）

- `fetch_all`: `SELECT * FROM posts`
- `create`: `INSERT` → `commit` → `refresh`（DBで採番された `id` を取り込む）
- `update`: 対象がなければ `None` を返す（service層が例外化して404へ）
- `delete`: 対象がなければ `False`

### `service/post_service.py`（仕様を表現する場所）

現状は「repositoryを呼ぶ薄い層」ですが、ここに以下を集約すると拡張に強くなります。

- 入力のルール（例：タイトル長、禁止語、ユーザー権限など）
- 例外の統一（例：`NotFoundError` など独自例外）
- トランザクション制御（複数更新をまとめる等）

### `schemas/post.py` と `models/post.py` の関係

- `schemas` はAPIの入出力（JSON）の形
- `models` はDB（テーブル）の形

現在、DBモデルには `created_at` / `updated_at` が存在しますが、スキーマに含めていないため **APIレスポンスには出ません**。  
「作成日時を画面に出したい」などの要件が出たら、`schemas/post.py` 側にもフィールドを追加します。

---

## 使用しているDBと、DBで可能にしたこと

### DB接続（必須）

`database.py` は環境変数 **`DATABASE_URL` が未設定だと起動時に例外**になります（意図的に「設定漏れ」を早期に検知する設計です）。

### ローカル（例: SQLite）

`.env`（`backend/.env`）に以下のように設定します：

- `DATABASE_URL=sqlite:///./dev.db`

この設定により、`dev.db` に `posts` テーブルを作り、投稿データを永続化できます。

### 本番（例: Railway Postgres）

RailwayのPostgresを使う場合は、Railway側で `DATABASE_URL` が払い出される/設定できます（多くの場合、Postgres追加で自動付与）。  
例（形のイメージ）：

- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME`

---

## API仕様（できること）

`main.py` で以下のエンドポイントを提供しています。

### 一覧取得

- **GET** `/posts`
- **レスポンス**: `Post[]`

### 作成

- **POST** `/posts`
- **リクエスト**: `NewPost`（`title`, `body`, `userId`）
- **レスポンス**: `Post`（`id`が付与される）

### 更新

- **PUT** `/posts/{post_id}`
- **リクエスト**: `NewPost`
- **レスポンス**: `Post`
- **エラー**: 対象がない場合 `404 Post not found`

### 削除

- **DELETE** `/posts/{post_id}`
- **レスポンス**: `{ "message": "Post deleted successfully" }`
- **エラー**: 対象がない場合 `404 Post not found`

FastAPIの自動ドキュメント（Swagger UI）：

- `GET /docs`
- `GET /openapi.json`

---

## ローカル起動

### 1) 依存関係インストール

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) `.env` を作成

`backend/.env` を作り、例としてSQLiteを使う場合：

```bash
DATABASE_URL=sqlite:///./dev.db
```

### 3) 起動

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

`http://localhost:8000/docs` を開いて動作確認できます。

---

## マイグレーション（Alembic）

このリポジトリでは、`models/post.py` に `created_at` / `updated_at` の追加履歴があり、`alembic/versions/` にマイグレーションが存在します。

### 代表コマンド

```bash
cd backend

# 差分からマイグレーションファイル生成（モデル変更後）
alembic revision --autogenerate -m "your message"

# 最新までDBへ適用
alembic upgrade head
```

### 注意（運用上のポイント）

`main.py` の起動時イベントで `Base.metadata.create_all()` を呼んでいます。  
これは「手軽に動かす」には便利ですが、本番運用でスキーマ変更を安全に扱いたい場合は **Alembicに寄せる（create_allをやめる/限定する）** のが一般的です。

---

## Railway デプロイ（バックエンド）

### 前提

- Railwayのサービスは **`PORT` 環境変数**で待ち受けポートが指定されることがあります  
  （コンテナ/起動コマンドが `--port $PORT` を参照するのが安全です）
- DBは Railway の **PostgreSQL** を推奨（永続化）

### 推奨手順（GitHub連携）

1. Railwayで新規Projectを作成
2. Serviceを作成し **GitHubリポジトリを接続**
3. **Monorepoの場合**: Service設定で `backend/` をルートに指定（Service Source / Root Directory）
4. Railwayで **Postgres** を追加
5. バックエンドServiceのVariablesに `DATABASE_URL` が入っていることを確認  
   - 自動で入らない場合は、Postgres側が提供する接続文字列を `DATABASE_URL` に設定
6. デプロイ後に Railway が提供するURL（例: `https://xxxx.up.railway.app`）へアクセスし、`/docs` が開ければOK

### CORSについて（本番向け改良ポイント）

現状はCORSを `allow_origins=["*"]` にしています（学習/検証向け）。  
本番では、Vercelのフロントエンドドメインに **限定**するのが推奨です（意図しないサイトからAPIを叩かれにくくなります）。

---

## 公開停止 / 削除（Railway）

### 「一旦止める」（公開を止めるが、後で戻せる余地を残す）

- **Service Source（GitHub連携）を外す / 自動デプロイを止める**
- **Domain（公開URL）を外す**（外部からアクセスできない状態にする）
- 既存デプロイを消したい場合は、Service → Deployments で該当デプロイを **Remove**（履歴整理）

### 「完全に消す」（公開も課金も止めたい）

- Railway Docsの「Managing Services」にある通り、**Project Settings の danger セクションから Service を削除**できます。  
  Serviceを削除すると、そのサービスの公開も停止します。
- さらに不要なら **Projectごと削除**（サービス/DB含めて完全に停止）

参考（公式）：

- `https://docs.railway.app/guides/services`（Deleting a Service）

---

## 改良アイデア（バックエンド）

- **CORSを限定**: `allow_origins=["https://<your-vercel-domain>"]` にする（公開後は特に推奨）
- **並び順/ページング**: `/posts?limit=20&offset=0` や `ORDER BY created_at DESC`
- **created_at/updated_at をAPIに公開**: Pydanticスキーマに追加してUIで表示
- **入力チェック強化**: Pydanticで `min_length`、禁止文字、最大長など
- **エラーハンドリング統一**: `ValueError` ではなく独自例外＋例外ハンドラで一元化
- **テスト追加**: repository層（SQLite in-memory）/ service層の単体テスト

---

## 機能追加ガイド（例：`Comment` を追加したい）

バックエンドに新しいリソースを足すときは、基本的に以下の順で増やすと破綻しにくいです。

1. **`models/`**: テーブル定義（SQLAlchemyモデル）を追加/変更
2. **`schemas/`**: 入力用（NewXxx）と出力用（Xxx）のスキーマを追加
3. **`repository/`**: CRUD関数を追加（`fetch_all/create/update/delete` など）
4. **`service/`**: 仕様を追加（存在チェック、権限、例外化、整形など）
5. **`main.py`**: ルート追加（GET/POST/PUT/DELETE）
6. **Alembic**: モデル変更がある場合は `revision --autogenerate` → `upgrade head`

> ポイント  
> - まず「DBの形（models）」と「APIの形（schemas）」を揃える  
> - 次に「DBアクセス（repository）」と「仕様（service）」を分ける  
> - 最後に「HTTP（main.py）」へ配線する  
>
> これで変更の影響範囲が読めるようになり、後からの改良（テスト、認可、ページング追加）が楽になります。

