# 技術スタック

最終更新: 2026-08-23  
関連: [architecture.md](./architecture.md) / [decisions.md](./decisions.md)

## 1. 採用スタック（確定）

| 層 | 技術 | 役割 |
|----|------|------|
| 言語 | TypeScript | アプリ全体 |
| フレームワーク | Next.js 16（App Router） | 画面・Route Handler・Server Actions |
| UI ライブラリ | React 19 | アプリの画面コンポーネント |
| スタイル | Tailwind CSS 4 | Figma に近いユーティリティスタイリング |
| BaaS | Supabase | Auth / Postgres / Storage |
| ORM / スキーマ | Prisma 6 | `public` テーブルの定義・マイグレーション・型付きアクセス（7 は datasource の書き方が違うので、学習用に 6 で固定） |
| IFC / 3D | That Open Engine | IFC 読み込み、Fragments、ビューア、プロパティ |

実行環境の前提: Node.js 20.9 以上（Next.js 16 の要件）。

## 2. パッケージの目安

実装フェーズでバージョンは `package.json` を正とする。導入時の地図:

```
next / react / react-dom
@prisma/client / prisma
@supabase/supabase-js / @supabase/ssr

# That Open（3D・IFC。フロントの Client Component が中心）
@thatopen/components
@thatopen/fragments
web-ifc
three

# 必要になったら検討（Lit Web Components）
@thatopen/ui
@thatopen/ui-obc
```

That Open は Three.js / fragments / web-ifc を peer として要求する。**That Open が使う three の版に合わせる。**

## 3. なぜこの組み合わせか

- **Next.js + React + TS**: 学習対象が明確。認証付き CRUD と App Router の型付きルートが揃う。
- **Supabase**: 会員機能を自前テーブルで持たない、という DB 計画と一致する。
- **Prisma**: ER をコードレビューしやすい。seed で Ver.3.10 マスタを再現できる。
- **That Open**: ブラウザで IFC を扱い、Fragments に変換して表示できる。サーバー専用の IFC エンジンを最初から抱えない。

## 4. That Open: React か Lit か（相談用）

公式 UI（`@thatopen/ui`）は **Lit で作った Web Components** である。HTML が使える場所なら React からも使える。一方、Enerifc の画面の大半は Figma の独自 UI（ログイン、テーブル、フォーム、レポート）であり、BIM ツールバー専用デザインではない。

### 4.1 選択肢

| 案 | 内容 | 向く点 | 負担 |
|----|------|--------|------|
| A. React のみ | ビューアは `div` + `@thatopen/components`。ツールバーも React | Figma 再現が素直。Next の学習と一致。レビューしやすい | 公式の `bim-*` を捨てる。ビューア周辺を自前実装 |
| B. Lit 寄せ | 案件画面を `@thatopen/ui` の grid / panel / table で組む | 公式チュートリアルに近い | Figma と見た目が食い違う。React と Lit の状態同期が増える |
| C. ハイブリッド（推奨・未確定） | **アプリシェルは React。3D 島だけ That Open。** 公式 `bim-toolbar` はビューア内に限定して試す | 要件の 90% を React で満たしつつ、3D は公式に乗れる | 島の境界（どの DOM まで Lit か）を決める必要がある |

### 4.2 推奨（DEC-01 として確認したいこと）

**案 C を既定案**とし、次で固める。

1. 認証・一覧・入力フォーム・計算結果は **React コンポーネント**（Figma 準拠）。
2. 3D は Client Component から `@thatopen/components` を初期化する。SSR しない（`dynamic(..., { ssr: false })`）。
3. Show All / Ghost / Isolate 等は、まず React ボタン → Engine API。公式ツールバーが明らかに楽なら、その島だけ Lit を足す。
4. アプリ全体を Lit にはしない。

理由:

- 学習目的が Next/React/Prisma であること
- モックが SaaS フォームであり `bim-panel` 前提ではないこと
- Web Components は React 19 でもイベントと型のラップが要ること
- レビュー 1000 行制約の中で、2 UI 体系を同時に習うと差分が膨らむこと

**この方針でよいか、実装（ビューア）に入る前に一言ほしい。** 反対なら docs の DEC-01 を更新してから進める。

## 5. Prisma と Supabase の分担

| 責務 | 担当 |
|------|------|
| メール／パスワード／セッション／JWT | Supabase Auth |
| `public` テーブル定義・FK・enum | Prisma schema → マイグレーション |
| サインアップ時の `profiles` 作成 | DB トリガー（計画の `supabase_auth.sql` 相当。Prisma の SQL マイグレーションで入れる） |
| RLS | SQL マイグレーション。Prisma はバイパスしうるので **サーバで必ず所有者チェック** |
| IFC バイナリ | Supabase Storage。DB にはパスのみ |
| マスタ投入 | Prisma seed。原典は Ver.3.10 シート |

Prisma から `auth.users` を直接モデル化しない。`profiles.id` は UUID で、マイグレーション SQL により `auth.users(id)` を参照する。

## 6. Next.js の使い方（このリポジトリ）

自動生成の `AGENTS.md` / `CLAUDE.md` と `node_modules/next/dist/docs/` に従う。Enerifc 固有の置き場所:

| もの | 置き場所 |
|------|----------|
| ページ | `app/`（App Router） |
| API | `app/api/` の Route Handler、または Server Actions |
| Prisma | `prisma/schema.prisma` |
| ドメインロジック | `src/` または `lib/`（実装時に決めて [architecture.md](./architecture.md) を更新） |
| ビューア | Client Component のみ。WASM / Worker は public または bundler 設定 |

デフォルトは Server Component。3D・ファイル DnD・ブラウザ API が要る所だけ `'use client'`。

## 7. 品質ツール（段階導入）

最初から全部入れない。バックエンドの土台ができたタイミングで足す。

| ツール | 入れる時期 |
|--------|------------|
| ESLint（create-next-app 済み） | 今 |
| Prisma migrate / seed | バックエンド Phase 1 |
| 型チェック `tsc` | 常時 |
| テスト（API の Vitest 等） | プロジェクト CRUD が動いてから |

E2E はフロント着手後。
