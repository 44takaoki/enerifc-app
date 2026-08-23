# アーキテクチャ

最終更新: 2026-08-23

## 1. 全体像

```
[ブラウザ]
  React 画面（Figma）
  That Open ビューア（Client only）
        | HTTPS（Cookie セッション）
        v
[Next.js]
  Server Components / Server Actions / Route Handlers
  Prisma Client  →  Postgres（Supabase）
  Supabase Auth  →  セッション検証
  Storage SDK    →  IFC オブジェクト
        |
        +--> モデル建物法 API（サーバからのみ。キーをクライアントに出さない）
```

クライアントが Prisma や DB URL を持たない。IFC の生ファイルも、一覧用には Storage の署名付き URL または専用 API 経由にする。

## 2. バックエンド先行の意味

フロントの見た目より先に、次を「動く API + DB」として固める。

1. Prisma スキーマ（計画 `schema.sql` 相当）
2. マイグレーションと RLS / Auth トリガー
3. Ver.3.10 マスタ seed
4. 認証（登録・ログイン・プロフィール）
5. プロジェクト CRUD
6. IFC アップロードメタデータ（実ファイルは Storage）
7. 様式 A/B の読み書き API
8. 計算結果の作成と、API 実行のスタブ（外部 API はモックでも可）

画面は、この API を叩く形で後から載せる。モック HTML を先に量産しない。

## 3. データの流れ

### 3.1 登録〜案件作成

```
signUp → auth.users
       → trigger → profiles
       → （任意）companies を名前で find-or-create → profiles.company_id

createProject(name, ifc)
       → projects (status=ifc_extracting)
       → Storage へ upload
       → project_ifc_files
       → ifc_extraction_jobs (pending)
```

### 3.2 抽出（詳細は DEC-06）

案は 2 つ。MVP では **ブラウザ抽出 → 結果を API で保存** を第一候補にする（サーバに WASM を最初から置かない）。

| 案 | 流れ | 利点 | 欠点 |
|----|------|------|------|
| ブラウザ | That Open で IFC→Fragments。数量を JS で集計し POST | インフラが軽い。3D と抽出が同じエンジン | 大きな IFC でタブが重い。改ざんはサーバ側バリデーションで抑える |
| サーバ | Next.js または Edge で web-ifc / fragments | 再現性が高い | Worker / WASM の運用、実行時間制限 |

抽出結果は `project_floor_areas` / `project_openings` / `project_envelope_areas` 等へ。`data_source=ifc_auto`。

### 3.3 計算

```
入力確定（is_confirmed）
  → project_calculation_results (calculating, report_name)
  → 様式 A/B のスナップショットをファイルまたは JSON で残す（input_snapshot_path）
  → モデル建物法 API
  → model_building_api_runs.raw_response
  → パースして BPIm/BEIm/PAL* を同じ results 行へ
  → completed / failed
```

スナップショット形式（CSV 相当か JSON か）は API 仕様確定後に決める（DEC-05）。

## 4. 認可

- セッション: `@supabase/ssr` で Cookie。
- サーバ: `auth.uid()` 相当の UUID を取り、`projects.user_id` と照合してから Prisma する。
- RLS: 同趣旨の POLICY を DB にも置く（クライアントや将来の直アクセス用）。
- マスタ: 認証済み読み取り。更新は seed / 管理者作業のみ（MVP に管理画面は無い）。

Prisma の DB ユーザーが RLS をバイパスする場合でも、**アプリケーションの where を省略しない。**

## 5. モジュール境界（実装時の目標）

名前は実装で多少変えてよい。責務は固定する。

```
app/                 ルーティングと画面
app/api/             HTTP の入口（薄い）
lib/auth/            セッション取得
lib/db/              Prisma client 単例
lib/projects/        案件ユースケース
lib/extraction/      IFC 抽出の DTO とバリデーション
lib/calculation/     API クライアントとレスポンスパース
lib/masters/         マスタ参照
components/          React UI
components/viewer/   That Open 島（Client only）
prisma/              schema, migrations, seed
```

1 レビューでこのツリー全体を作らない。[progress.md](./progress.md) のスライスに従う。

## 6. 環境変数（予定）

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ブラウザの Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ブラウザ（RLS 前提） |
| `DATABASE_URL` | Prisma（サーバのみ） |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理作業のみ。安易に Route Handler へ出さない |
| モデル建物法 API の URL / キー | サーバのみ |

`.env` はコミットしない。
