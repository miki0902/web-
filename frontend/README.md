# frontend（React / TypeScript / Vite / MUI）

このディレクトリは **投稿（Post）を操作するブラウザUI** です。バックエンド（FastAPI）の `/posts` API を呼び出して、投稿の作成/一覧/編集/削除を行います。

---

## 技術スタック

- **React 19 + TypeScript**: UIと状態管理
- **Vite**: 開発サーバ/ビルド
- **MUI（@mui/material）**: UIコンポーネント、テーマ
- **Fetch API**: バックエンド呼び出し（`src/api/posts.ts`）

---

## ディレクトリ構成と責務（どこに何を書くか）

```
frontend/
└─ src/
   ├─ api/
   │  └─ posts.ts          # APIクライアント（fetchの薄いラッパ）
   ├─ components/
   │  ├─ PostForm.tsx      # 新規投稿フォーム
   │  └─ PostList.tsx      # 投稿一覧（削除/編集ボタン含む）
   ├─ types/
   │  └─ post.ts           # フロント側の型（Post/NewPost）
   ├─ theme.ts             # MUIテーマ定義
   ├─ App.tsx              # 画面の中心（状態・API呼び出し・子コンポーネント連携）
   └─ main.tsx             # ルート描画、ThemeProvider/CssBaseline
```

### 実装の流れ（データフロー）

1. `App.tsx` が初回表示で `fetchPosts()` を呼び、`posts` stateに格納
2. `PostForm.tsx` が入力を受け取り、`onSubmit` で `App.tsx` に新規投稿内容を渡す
3. `App.tsx` が `createPost()` を呼び、返ってきた投稿（`id`付き）を `posts` に反映
4. `PostList.tsx` が Delete/Edit 操作を受け取り、`App.tsx` の handler を呼ぶ
5. `App.tsx` が `deletePost()` / `updatePost()` を呼び、stateを更新

---

## 環境変数（必須）

APIのベースURLは `VITE_API_URL` で指定します。`src/api/posts.ts` が `import.meta.env.VITE_API_URL` を参照します。

### ローカル（例）

`frontend/.env` を作り、バックエンドがローカルで `8000` の場合：

```bash
VITE_API_URL=http://localhost:8000
```

---

## ローカル起動

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

---

## APIクライアント（`src/api/posts.ts`）の書き方

このプロジェクトでは、API呼び出しを **UIから分離**して `src/api/` に置いています。

- **責務**: 「URL組み立て」「HTTPメソッド」「ヘッダ」「JSON化」「失敗時の例外」を担当
- **UI側（App/Component）**: 「いつ呼ぶか」「成功後にstateをどう更新するか」を担当

この分離により、API変更（URL/エンドポイント追加）やテストがしやすくなります。

---

## Vercel デプロイ（フロントエンド）

### 推奨手順（GitHub連携）

1. Vercelで `New Project` → GitHubリポジトリをImport
2. Monorepoの場合、`Root Directory` を **`frontend/`** に指定
3. `Environment Variables` に以下を設定
   - **`VITE_API_URL`**: RailwayでデプロイしたバックエンドURL（例: `https://xxxx.up.railway.app`）
4. デプロイ後、VercelのURLでアクセスして動作確認

### 重要（CORS）

バックエンド側は現状CORSが `allow_origins=["*"]` なので、まずはそのままでも動きます。  
本番ではバックエンド側のCORSを **Vercelのドメインに限定**するのが推奨です（`backend/README.md`参照）。

---

## 公開停止 / 削除（Vercel）

### 「一旦止める」（後で戻したい）

Vercelにはプロジェクトを一時停止（Pause）する仕組みがあります（REST API/Spend Managementを利用）。  
参考（公式）：

- `https://vercel.com/docs/projects/managing-projects`（Pausing a project）

### 「完全に消す」（公開を止める）

Vercel公式の「Deleting a project」に従うのが確実です。

1. Vercelダッシュボードで対象プロジェクトを開く
2. `Settings` タブ
3. `General` ページ最下部の `Delete Project` から削除

削除すると **deployments / domains / env vars / settings** がまとめて削除され、公開も停止します。

参考（公式）：

- `https://vercel.com/docs/projects/managing-projects`（Deleting a project）

---

## 改良アイデア（次にやると良いこと）

- **編集UIの改善**: いまは `prompt()` で編集しているので、MUIのDialogを使ってフォーム化するとUXが上がります
- **入力バリデーション**: タイトル長、本文長、空白のみ禁止など
- **通信の状態管理**: TanStack Query導入で、再取得・キャッシュ・ローディング/エラー表示が整理できます
- **環境差分の明確化**: `.env.example` を追加して、必要な環境変数を明示すると迷子になりません

---

## 機能追加ガイド（例：一覧の並び順を変える）

フロントエンド側の変更は「型 → API → UI」の順で進めると安全です。

1. **型（`src/types/`）**: 返ってくるJSONにフィールドが増えるなら、まず型を更新
2. **API（`src/api/`）**: クエリパラメータや新エンドポイントに合わせて関数を追加/更新
3. **UI（`src/components/` / `App.tsx`）**: state更新ロジックと表示を更新

例：バックエンドが `created_at` を返すようになったら  
`Post` 型に `created_at` を足し、`PostList.tsx` で表示する、という流れになります。
