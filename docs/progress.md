# 進捗とフェーズ

最終更新: 2026-08-25  
ステータス: **B6 完了。次は B7（RLS ポリシー）。**

レビューは 1 回あたり差分 1000 行以内。[development-guide.md](./development-guide.md) 参照。

## 凡例

| 印 | 意味 |
|----|------|
| 未着手 | まだやらない |
| 進行中 | 今の焦点 |
| 完了 | レビュー可能な成果物がある |
| ブロック | 未決（DEC）待ち |

## フェーズ A — ドキュメント

| スライス | 内容 | 状態 |
|----------|------|------|
| A0 | 要件・技術・進捗の docs | 完了 |

完了条件: `docs/` を読んでバックエンドの最初の PR の範囲が説明できる。

## フェーズ B — データ基盤（バックエンド開始点）

画面は作らない。Prisma と Supabase だけ。

| ID | スライス | 想定成果 | 行数目安 |
|----|----------|----------|----------|
| B1 | Prisma 導入、`.env.example`、`master_program_versions` と enum | migrate 1 本（SQL 作成済み。Supabase 接続後に `npm run db:migrate`） | 小・完了 |
| B2 | マスタ表の Prisma モデル（seed なしでも可） | `schema.prisma` に master_* | 中・完了 |
| B3 | seed スクリプト骨格 + 地域・用途・モデル建物 | 件数が docs と一致 | 中・完了 |
| B4 | 建具・方位・部位・断熱方法 seed | JSON + seed.ts | 中・完了 |
| B5 | ガラス 156 + 断熱材（親子） | JSON + seed.ts | 中・完了 |
| B6 | companies / profiles + Auth トリガー SQL | Prisma + migrate | 中・完了 |
| B7 | RLS ポリシー（プロフィールとマスタ） | SQL マイグレーション | 小〜中 |

**次にやる推奨: B7。** DEC-01（React/Lit）はビューアまで確定しなくてよい。

外部講師への依頼は B2 では出さない（DEC-16）。実装は B7 まで進め、**提出は B1〜B7 を 1 本にまとめる。** 1000 行超過時は依頼文で講師に伝える。

## フェーズ C — 案件 API

| ID | スライス | 内容 |
|----|----------|------|
| C1 | セッション取得ユーティリティ | Supabase SSR + サーバで user id |
| C2 | projects CRUD（論理削除） | RLS + Prisma where |
| C3 | companies の find-or-create（アカウント更新の準備） | |
| C4 | contact_inquiries POST | |

この時点で REST または Server Actions の形を [architecture.md](./architecture.md) に追記する。

## フェーズ D — IFC メタデータと様式

| ID | スライス | 内容 |
|----|----------|------|
| D1 | Storage バケットと `project_ifc_files` | アップロード API |
| D2 | `ifc_extraction_jobs` の状態機械 | まだ本物の抽出なし |
| D3 | 様式テーブル Prisma + 所有者 RLS | |
| D4 | 様式 A/B の読み書き API | バリデーションはマスタ FK |
| D5 | 抽出結果の一括 upsert API | ブラウザ抽出を後で接続 |

本物の数量抽出はフェーズ F。ここでは箱だけ。

## フェーズ E — 計算結果

| ID | スライス | 内容 |
|----|----------|------|
| E1 | `project_calculation_results` CRUD | ステータス遷移 |
| E2 | `model_building_api_runs` + 外部 API クライアントのスタブ | フィクスチャ JSON でパースを試せる |
| E3 | 本番 API 接続 | DEC-05 解除後 |

## フェーズ F — That Open（フロント開始の入口）

DEC-01 を確認してから。

| ID | スライス | 内容 |
|----|----------|------|
| F0 | スパイク: 1 ページにサンプル IFC を表示 | DB 非接続。1000 行厳守 |
| F1 | ビューア島のモジュール境界 | dynamic import, ssr:false |
| F2 | 新規プロジェクト UI と Storage 接続 | |
| F3 | 抽出ロジック（床・外皮・開口） | 成果を D5 へ POST |
| F4 | 以降、Figma 順にページ | 1 ページ 1 レビューを目安 |

## フェーズ G — アプリ完成度

印刷/PDF、問い合わせ見た目、ランディング、エラー境界、手元のサンプル IFC の手順書。

## 今のリポジトリ状態

- Prisma 導入済み。enum、`master_*` 定義、B3〜B5 seed、`companies` / `profiles` + Auth トリガー（B6）
- 投入: migrate 後に `npm run db:seed`
- 画面・That Open は未着手
- 計画 SQL はリポジトリ外 `enerifc_DB_plannning`

## 変更したら

スライスを完了にしたら、この表の「状態」を更新する。それが進捗の正。
