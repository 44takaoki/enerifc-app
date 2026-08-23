# サイトマップと画面

最終更新: 2026-08-23  
原典: `enerifc_DB_plannning/sitemap/` と `figma_UIdesign/`

計画 CSV はアクセス権の誤記がある（ログイン画面が「ログインユーザー」になっている等）。**下表をアプリの正とする。**

## 1. URL 一覧

| 画面 | URL | 権限 | Figma |
|------|-----|------|-------|
| トップ | `/` | 誰でも | `top.png` |
| ログイン | `/login` | 未ログイン向け。ログイン済みなら `/projects` へ | `login.png` |
| 新規登録 | `/signup` | 未ログイン向け | `signup.png` |
| パスワード再設定 | `/reset_password` | 未ログイン向け | `reset_password.png` |
| お問い合わせ | `/contact` | 誰でも（ログイン時は氏名等を初期値にできる） | `contact.png` |
| プロジェクト一覧 | `/projects` | ログイン | `projects.png` |
| 新規プロジェクト | `/projects/new` | ログイン | `projects/new.png` |
| 基本情報 | `/projects/[projectId]/basic_info` | 所有者 | `basic_info.png` |
| 開口部仕様 | `/projects/[projectId]/opening` | 所有者 | `opening.png` |
| 断熱仕様 | `/projects/[projectId]/insulation` | 所有者 | `insulation.png` |
| 外皮 | `/projects/[projectId]/envelope` | 所有者 | `envelope.png` |
| 計算結果一覧 | `/projects/[projectId]/results` | 所有者 | `results.png` |
| 計算結果レポート | `/projects/[projectId]/results/[resultId]` | 所有者 | `result.png` |
| アカウント | `/account` | ログイン | `account.png` |

計画 CSV の `/projects/{id}/result` は一覧と個別が分かれていない。モックに合わせて **一覧は複数形 `results`、個別は ID 付き** にする。

## 2. 画面フロー

```
/ → /signup または /login
      → /projects
           → /projects/new（名前 + IFC）
           → /projects/[id]/basic_info
                → opening → insulation → envelope
                     → 計算実行 → results
                          → results/[resultId]
      → /account
      → /contact
```

案件サイドバー: 一覧へ戻る / 基本情報 / 開口部 / 断熱 / 外皮 / 計算結果一覧。

グローバルサイドバー（一覧系）: プロジェクト一覧 / 新規。フッターにユーザー。クリックでアカウント編集・ログアウト（`modal_account.png`, `modal_logout.png`）。

削除確認: `modal_delete.png`（論理削除）。

## 3. 画面ごとの要点

### 公開・認証

- トップ: 価値説明、CTA「無料で試す」「登録して始める」
- ログイン: メール・パスワード。リンク「新規登録」
- 登録: 氏名・メール・パスワード（8 文字以上）
- 再設定: メール入力 → リンク送信
- 問い合わせ: 氏名・会社・メール・本文

### プロジェクト一覧

列: 名前、更新日時、ステータス、延床面積。検索とステータスフィルタ。削除アイコン。  
ZEB 列は出さない（DEC-03）。出す場合は docs と DB を先に更新。

### 新規

プロジェクト名必須。`.ifc` の選択またはドロップ。キャンセル / アップロードして解析開始。

### ワークスペース（3 ペイン）

中央: IFC 3D。「3D Preview Active」、Show All / Ghost / Focus / Hide / Isolate / Colorize。  
右: そのステップのフォームまたはテーブル。  
次へでステップ移動。外皮の一次アクションは **計算実行**（モックのボタン文言「次へ (外皮)」は誤記として扱わない。DEC-08）。

### 計算結果一覧

レポート名検索、ステータスフィルタ。列: レポート名、更新、ステータス、BPIm、適合、BEIm、適合、削除。行クリックで個別。

### 個別レポート

総合判定、BPIm / BEIm と基準 1.0、PAL*、年間熱負荷、ペリメーター。印刷プレビューと PDF は後続でも可（要件 5.5 のフェーズ）。

## 4. レイアウト種別

| 種別 | 画面 |
|------|------|
| マーケ / 中央カード | トップ、認証、問い合わせ |
| アプリシェル（左ナビ） | 一覧、新規、アカウント |
| 3 ペイン | 基本情報〜外皮 |
| アプリシェル（3D なし） | 結果一覧・レポート |

フロント着手時はレイアウトを先に 1 スライスで作り、ページを薄く載せる。
