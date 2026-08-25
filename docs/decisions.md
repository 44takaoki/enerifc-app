# 決定ログと未決事項

最終更新: 2026-08-25

番号は参照用。決まったら「状態」を確定にし、本文に結論を書く。実装は確定後に進める（スパイク除く）。

## 未決

### DEC-01 — That Open 周辺の UI（React vs Lit）

状態: **提案済み・未確定**  
文書: [tech-stack.md](./tech-stack.md) 4 節

提案: アプリシェルは React。3D は `@thatopen/components` の島。公式 Lit ツールバーは必要になってから島の中だけ。

確認したいこと: このハイブリッドでよいか。全体 Lit、または完全 React（公式 UI なし）にするか。

### DEC-02 — IFC 抽出をどこで実行するか

状態: 未確定  
提案: MVP はブラウザ抽出 → API 保存（[architecture.md](./architecture.md) 3.2）

サーバ WASM は、ブラウザが重い実データで失敗してから検討。

### DEC-03 — プロジェクト一覧の ZEB 判定列

状態: 未確定  
モック: あり / DB: なし  
提案: MVP では出さない。出すなら計算結果からの導出ルールを要件に書く。

### DEC-04 — 基本情報の「主たる空調方式」

状態: 未確定  
モック: あり / 様式 C / MVP で C〜I 非送信  
提案: フィールド自体を置かない。モック実装時は Figma から外す。

### DEC-05 — モデル建物法 API

状態: 未確定  

決めること: URL、認証、送信メディア（CSV/JSON）、タイムアウト、エラー形式。  
それまで Phase E はスタブ + フィクスチャ。

### DEC-06 — Fragments の保存

状態: 未確定  
IFC 変換結果 `.frag` を Storage に残すか、毎回変換するか。表示高速化と容量のトレードオフ。

### DEC-07 — `master_envelope_parts` / `master_orientations` の表示名列

状態: 未確定  
計画 SQL は `sheet_value` のみ。UI で「外気に接する床」等を出すなら `display_name` を Prisma で足す。

### DEC-08 — 外皮画面の一次ボタン

状態: 運用上は提案採用可  
モックは「次へ (外皮)」、説明文は計算実行。  
提案: ラベルは「計算を実行」。確認ダイアログの有無は UI 実装時。

### DEC-09 — メールアドレス変更

状態: 未確定  
アカウント画面にメール欄がある。MVP は表示のみか、Supabase の変更フローまでやるか。提案: 表示のみ。

## 確定

### DEC-10 — 計算対象シート

様式 A/B のみ送信。C〜I なし。BEIm は国定モデル建物前提。  
根拠: 計画 `DATABASE_DESIGN.md`、要件 1.1。

### DEC-11 — 認証の置き場所

Supabase Auth。自前 users / sessions / password_hash は持たない。

### DEC-12 — 計算結果の多重度

1 プロジェクトに複数 `project_calculation_results`。入力（A/B）はプロジェクトで共有。

### DEC-13 — プログラム版

MVP のマスタは入力シート Ver.3.10。`program_version = 3.10`。

### DEC-14 — ORM

Prisma で `public` を管理。計画の `.sql` は移植元。

### DEC-15 — 実装順

バックエンド（Prisma・Auth・案件・様式・計算の器）が先。Figma ページはスキーマ／API の後。

### DEC-16 — レビュー粒度

外部講師の建前は 1 回あたり差分 1000 行以内。`package-lock.json` は除外可。

**Phase B（2026-08-25）:** B2 では依頼しない。実装は B7 まで進める。提出は **B1〜B7 を 1 依頼にまとめる。** 物語（スキーマ → seed → 認証 → RLS）が一度に見えた方がレビューしやすい、という判断。1000 行を超える見込みであり、依頼時にその旨を講師へ伝える。

実装側の工夫: seed の選択肢は冗長な TypeScript 配列にせず、コンパクトな JSON 等に寄せて「ロジック行」を抑える。

### DEC-17 — ドキュメント優先

実装・仕様変更は `docs/` を正とする。エージェントは常に参照する。

### DEC-18 — 断熱材マスタの一意と空の minor

一意は `(program_version, sheet_value_major, sheet_value_minor)` のまま。**小分類が無い行は NULL**（空文字は使わない）。

- 入力方法 A（大分類のみ）向け: 列 H の 14 大分類それぞれに `sheet_value_minor = NULL` の行を 1 件ずつ持つ（計 14 行）。
- 入力方法 B 向け: 列 I の名前付き範囲どおり小分類 59 行。`sheet_value_major` は親の大分類文字列。
- 熱伝導率 `thermal_conductivity` は Ver.3.10 の `data` 列に無いため seed では NULL。案件入力または後続版で埋める。

### DEC-19 — 用途とモデル建物の対応

MVP の Ver.3.10 seed は 1:1（入力シート列 C がモデル名のため）。スキーマは N:1 を許容する。用途を細分化するときは seed / JSON を足す。1 用途が複数モデルを持つ設計にするときだけマイグレーションが要る。

### DEC-20 — 断熱入力方法の method_code

シート列 Y にはコードが無い。並びどおり **A〜E を固定**する（`docs/master-data.md`）。API と様式の参照はこの 1 文字を使う。
