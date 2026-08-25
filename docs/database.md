# データベース（Prisma + Supabase）

最終更新: 2026-08-25  
原典: `enerifc_DB_plannning/database/`（`DATABASE_DESIGN.md`, `schema.sql`, `supabase_auth.sql`）

Prisma の `schema.prisma` がこの文書と食い違ったら、**意図的な変更は本 docs を先に直す。** 計画 SQL は履歴として残し、アプリの正は Prisma マイグレーションにする。

## 1. 方針

- DBMS は Supabase Postgres。
- **テーブル定義は Prisma。** 計画の `schema.sql` を手で本番適用し続けない。
- Auth は `auth` スキーマ（Supabase 管理）。Prisma は `public` のみ。
- `profiles.id` は Auth の UUID と同じ。パスワード列は持たない。
- RLS は Prisma マイグレーション内の raw SQL で再現する。
- マスタは `program_version`（MVP は `3.10`）で版管理する。

## 2. テーブルグループ

| グループ | テーブル | 役割 |
|----------|----------|------|
| 認証 | `auth.users` | メール・パスワード・セッション |
| プロフィール | `companies`, `profiles` | 表示名・会社 |
| 案件 | `projects` | 建物案件。計算値は持たない |
| 計算結果 | `project_calculation_results` | 1 案件 N レポート |
| IFC | `project_ifc_files`, `ifc_extraction_jobs` | ファイルとジョブ |
| 様式 A/B | `project_basic_info`, `project_floor_areas`, `project_openings`, `project_insulation_specs`, `project_envelope_areas` | 入力。案件単位で共有 |
| マスタ | `master_*` | プルダウン。シート由来 |
| API ログ | `model_building_api_runs` | 生レスポンス |
| 任意 | `contact_inquiries` | お問い合わせ |

## 3. 中核の関係

```
auth.users 1──1 profiles 1──* projects
projects 1──1 project_basic_info
projects 1──* project_floor_areas
projects 1──* project_openings          … 様式 B1
projects 1──* project_insulation_specs  … 様式 B2
projects 1──* project_envelope_areas    … 様式 B3
projects 1──* project_ifc_files 1──* ifc_extraction_jobs
projects 1──* project_calculation_results 1──0..1 model_building_api_runs

master_building_uses.model_building_id → master_model_buildings
project_basic_info.building_use_id → master_building_uses
```

BEIm の注記は `master_model_buildings.description` を計算結果の `bei_note` へコピーする想定。

## 4. Prisma への落とし方

### 4.1 モデル名

SQL の snake_case テーブル名を `@@map` で維持し、Prisma モデルは PascalCase。

例: `model Project { @@map("projects") }`

### 4.2 PostgreSQL enum

計画どおり enum を使う。Prisma `enum` と対応させる。

| enum | 値 |
|------|-----|
| `project_status` | draft, ifc_extracting, review, calculating, completed, failed |
| `calculation_result_status` | draft, calculating, completed, failed |
| `overall_goal_status` | goal_achieved, not_achieved |
| `data_source` | ifc_auto, manual |
| `extraction_status` | pending, running, completed, failed |
| `ifc_element_kind` | storey, space, slab, wall, roof, floor_on_grade, window, door, curtain_wall, other |
| `opening_input_method` | frame_and_glass, frame_and_glass_performance, window_performance |
| `api_run_status` | pending, completed, error |

### 4.3 Auth 外部キーとトリガー（B6 完了）

`profiles.id` の `REFERENCES auth.users(id)` は Prisma だけでは書きにくい。手順:

1. `profiles.id` を `Uuid @id` として Prisma に書く（Prisma 側の FK は無し）。
2. マイグレーション `20260825080000_add_companies_profiles_auth_trigger` の SQL で `auth.users` への FK と `handle_new_user` トリガーを追加する。

`prisma migrate dev` は検証用の **shadow database**（空の Postgres）を作る。そこには Supabase の `auth` スキーマが無い。そのため `auth.users` への FK / トリガーは `auth` が存在するときだけ実行する（P3006 回避）。本物の Supabase へ適用するときは付く。

`handle_new_user` は `auth.users` INSERT 後に `profiles` を 1 行作る。`display_name` は `raw_user_meta_data.display_name`、無ければメールの `@` 前。

会社は `company_id` 任意。登録時は会社名文字列から `companies` を find-or-create（API 側・C3）。**RLS は B7。**

### 4.4 計画 SQL との差分（意図）

| 計画 | アプリでの扱い |
|------|----------------|
| `schema.sql` を SQL Editor で直接実行 | 開発は `prisma migrate` |
| 一部マスタに RLS 例が未記載 | 全 `master_*` に認証済み SELECT を付ける |
| 子テーブル RLS が IFC / 結果中心 | 様式テーブルにも「親プロジェクトの所有者」POLICY を付ける |
| `projects.total_floor_area` と `project_basic_info.total_floor_area_m2` | 一覧用の冗長列。更新ルールは実装時に「基本情報保存時に同期」と決めて docs を更新 |

### 4.5 UI モックにあって表に無いもの

| UI | 対応 |
|----|------|
| プロジェクト一覧の ZEB 判定 | 持たない（DEC-03）。計算結果から出すなら後で列または view |
| 基本情報の主たる空調方式 | 持たない（様式 C、DEC-04） |
| 計算結果の印刷 / PDF | ファイル表は作らない。クライアント印刷または後続 |

## 5. 主要列（実装時に落とさないもの）

詳細な全列は計画 ER を正とし、Prisma 化時にこの節を「Prisma 準拠」に書き換える。

**projects:** `user_id`, `name`, `status`, `program_version`, `total_floor_area`, `deleted_at`

**project_basic_info:** `building_name`, `region_category_id`, `building_use_id`, `total_floor_area_m2`, `data_source`, `is_confirmed`

**project_calculation_results:** `report_name`, `calculation_status`, `overall_goal_status`, `bpi_m`, `bei_m`, 適合フラグ、PAL*、年間熱負荷、ペリメーター面積、`bei_note`

**IFC 由来行:** `ifc_global_id`, `ifc_element_kind`, `data_source`, `is_confirmed`, `extraction_job_id`

## 6. マスタ一覧

seed の中身は [master-data.md](./master-data.md)。物理テーブル名は `prisma/schema.prisma` の `@@map`（計画 SQL と同じ）。

| テーブル | Prisma モデル | 一意 | 画面 |
|----------|---------------|------|------|
| `master_program_versions` | `MasterProgramVersion` | `version` | 内部 |
| `master_region_categories` | `MasterRegionCategory` | `(program_version, sheet_value)` | 基本情報 |
| `master_model_buildings` | `MasterModelBuilding` | `(program_version, sheet_value)` | 用途から間接参照 |
| `master_building_uses` | `MasterBuildingUse` | `(program_version, sheet_value)` | 基本情報 |
| `master_frame_types` | `MasterFrameType` | `(program_version, sheet_value)` | 開口部 |
| `master_glass_types` | `MasterGlassType` | `(program_version, sheet_value)` | 開口部 |
| `master_insulation_input_methods` | `MasterInsulationInputMethod` | `(program_version, method_code)` | 断熱 |
| `master_insulation_types` | `MasterInsulationType` | `(program_version, sheet_value_major, sheet_value_minor)` | 断熱 |
| `master_envelope_parts` | `MasterEnvelopePart` | `(program_version, sheet_value)` | 断熱・外皮 |
| `master_orientations` | `MasterOrientation` | `(program_version, sheet_value)` | 開口・外皮 |

`master_envelope_parts` / `master_orientations` は計画上 `display_name` が無い。UI 用に `display_name` を足すかは DEC-07（未決のまま列は足していない）。

`master_insulation_types` の一意は `(program_version, sheet_value_major, sheet_value_minor)`。小分類が無い行は **`sheet_value_minor` / `category_minor` を NULL**（DEC-18）。入力方法 A 用に大分類のみ 14 行 + 小分類 59 行 = seed 計 73 行。

## 7. RLS（最低限）

計画 `supabase_auth.sql` をベースに、MVP で次を満たす。

- `profiles`: 自分の行のみ SELECT/UPDATE
- `projects`: `user_id = auth.uid()`。削除は論理削除でも所有者のみ
- 案件の子すべて: `EXISTS (projects.user_id = auth.uid())`
- `model_building_api_runs`: 計算結果 → 案件の所有者
- `contact_inquiries`: 挿入は認証済み。自分の送信分だけ読める
- `companies`: 所属更新に必要な範囲。MVP は「認証済みが名前で作成可」でもよいが、他人の会社行の改ざんは不可
- `master_*`: `authenticated` の SELECT のみ

Prisma 用ロールが RLS を無視する場合でも POLICY は張る（Storage や将来のクライアント直アクセス）。

## 8. Storage

- バケット例: `ifc-uploads`（非公開）
- パス例: `{user_id}/{project_id}/{filename}.ifc`
- オブジェクトは所有者のみ read/write
- DB の `file_path` はバケット内キー

Fragments（`.frag`）をキャッシュする場合は別キー。DEC-06 で決める。

## 9. 実装スライス（DB）

[progress.md](./progress.md) Phase B と一致させる。1 スライス ≒ 1 レビュー。

1. Prisma 初期化 + `master_program_versions` + enum（B1 完了。定義は `prisma/schema.prisma`）
2. マスタテーブルの Prisma モデル（B2 完了。seed なし）
3. seed 骨格 + 地域・用途・モデル建物（B3 完了。`prisma/seed.ts`）
4. 建具・方位・部位・断熱方法 seed（B4 完了）
5. ガラス 156 + 断熱材（B5 完了）
6. `companies` / `profiles` + Auth トリガー SQL（B6 完了）
7. RLS ポリシー（B7）
8. 案件・IFC・様式・計算結果は Phase C 以降
