# Enerifc ドキュメント

このフォルダが、Enerifc 開発の**正（source of truth）**です。実装・レビュー・設計変更の前に、必ずここを読んでから作業します。

検討資料の原本はリポジトリ外の `enerifc_DB_plannning/` にあります。アプリ実装に必要な結論は、本フォルダへ転記・整理しています。

## 読む順番

| 順番 | ファイル | 内容 |
|------|----------|------|
| 1 | [requirements.md](./requirements.md) | 何を作るか（要件定義） |
| 2 | [tech-stack.md](./tech-stack.md) | 何で作るか（技術スタック、React / Lit の方針） |
| 3 | [architecture.md](./architecture.md) | どう組むか（構成、データの流れ） |
| 4 | [database.md](./database.md) | DB / Prisma / Supabase の方針 |
| 5 | [sitemap.md](./sitemap.md) | 画面と URL |
| 6 | [master-data.md](./master-data.md) | マスタの出典（入力シート Ver.3.10） |
| 7 | [development-guide.md](./development-guide.md) | 伴走開発の進め方 |
| 8 | [progress.md](./progress.md) | 進捗・フェーズ・レビュー単位 |
| 9 | [decisions.md](./decisions.md) | 未決事項と決定ログ |

## 開発時の約束

1. **コードを書く前に docs を読む。** 矛盾があればコードより先に docs を直す。
2. **実装はバックエンドから。** フロントはスキーマと API が固まってから。
3. **1 回のレビュー差分は 1000 行以内。** スライスの切り方は [progress.md](./progress.md) を参照。
4. **学習優先。** 生成コードは説明できる単位に留め、理由を残す。詳細は [development-guide.md](./development-guide.md)。

## 検討資料（リポジトリ外）

| 種別 | 場所 |
|------|------|
| ER / スキーマ | `enerifc_DB_plannning/database/` |
| UI モック | `enerifc_DB_plannning/figma_UIdesign/` |
| サイトマップ | `enerifc_DB_plannning/sitemap/` |
| 入力シート（マスタ原典） | `enerifc_DB_plannning/sample_MODEL_inputSheet_for_Ver3.10.xlsx` |
