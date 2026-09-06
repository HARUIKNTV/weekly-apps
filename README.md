# スロ設定判別ラボ

パチスロの公開設定差データをもとにした設定判別ツール集。毎週金曜21:00に、スケジュール済みのClaude Code Remoteルーティンが新しい機種のツールを1本ずつ自動でリサーチ・作成・公開しています。

**公開サイト:** https://haruikntv.github.io/weekly-apps/

## 方向転換の経緯（2026-09-06）

もともとはランダムジャンルの小さなアプリを毎週作る「Weekly Apps 博覧会」として始まったが、2026-09-06にユーザーの意向で**パチスロ設定判別ツール専門サイト**へ方向転換した。最初のトライアルとして「L 東京喰種」の判別ツールを作成し、以後は毎週別機種のツールを自動追加していく方針。

## Why not the App Store?

App Store公開には年間$99のApple Developer Program登録が必要で無料ではないため、Web/PWAとして無料公開する方針（2026-09-05決定、方向転換後も変わらず）。

## How it works

1. 毎週金曜21:00、Claude Code Remoteのスケジュールルーティンがこのリポジトリに対して実行される。
2. `manifest.json`の`machine_candidates`（候補機種リスト）と`history`（作成済み機種）を確認し、まだ扱っていない機種を選ぶ。候補が尽きたら、ルーティン自身がWeb検索で新しい人気機種を探す。
3. その機種の公開されている設定差データ（CZ確率・キャラ示唆・カード示唆など）をWeb検索・記事から調査する。
4. データが十分に揃っている場合のみ、静的HTML/JS（依存ライブラリなし、ビルド不要）の判別ツールを`apps/<date>-<slug>/`に作成する。データ元は必ず記事内に出典として明記する。
5. `manifest.json`の`history`に新しいエントリを追加してコミット・push。
6. GitHub Actionsが自動でサイトを再ビルド・GitHub Pagesに公開する（Expo製アプリがあれば`expo export`、プレーンな静的ツールはそのままコピー）。

## Repo layout

- `manifest.json` — 候補機種リスト（`machine_candidates`）と、公開済みツールの履歴（`history`: name, genre=機種名, date, folder, description）。
- `apps/<date>-<slug>/` — 機種ごとの判別ツール（プレーンなHTML/CSS/JS、ビルド不要）。
- `assets/og-image.svg` — サイト共通のOGP/Twitter Card画像。
- `scripts/generate-index.js` — `site/index.html`（ツール一覧。機種名だけのシンプルなピル型リスト＋検索ボックス。今後ツール数が増える前提でサムネイル・説明文は表示しない）、`site/sitemap.xml`、`site/llms.txt`を`manifest.json`から自動生成。CIで毎回実行される。
- `.github/workflows/deploy-pages.yml` — `package.json`があるフォルダはExpoとしてビルド、`index.html`のみのフォルダはそのままコピーしてGitHub Pagesにデプロイ。

## SEO / AIO

サイト全体のメタタグ・OGP・JSON-LD構造化データ・`sitemap.xml`・`llms.txt`は`generate-index.js`が`manifest.json`から毎回自動生成するため、新しいツールを追加するたびに自動で最新化される。`robots.txt`（ルートの[haruikntv.github.io](https://github.com/HARUIKNTV/haruikntv.github.io)リポジトリで管理）はGPTBot・ClaudeBot・Google-Extended・PerplexityBot等のAIクローラーを明示的に許可している。

## 広告の設置について

一覧ページ（`generate-index.js`が生成、ヘッダー直下とフッター上の728×90）と、各判別ツールページ（ヘッダー直下728×90、判別要素と結果の間300×250、フッター上728×90）の両方に空の広告枠（`.ad-slot`）を用意している。今はプレースホルダー表示のみ。

収益化するには：

1. 自分で広告ネットワーク（例: [Google AdSense](https://adsense.google.com/)）に登録し、サイト審査を通す。**本人確認・銀行口座・税務情報の入力が必要なため、Claudeが代行することはできない。**
2. 発行された広告コードを教えてもらえれば、`scripts/generate-index.js`の`adSlot()`関数、および各ツールの`index.html`内のコメント`<!-- AdSense/other ad network snippet goes here -->`の位置に埋め込む。

## 免責事項

各ツールは公開されている設定差データをもとにした期待値の目安を計算するファンメイド計算機であり、実際の設定を保証するものではない。パチスロは適切な予算内で、遊技は自己責任・節度をもって楽しむよう各ツールページに明記している。

## Notes for whoever (or whatever) picks this up later

- 「Claude利用上限の余裕」を自動判定する手段はないため、毎週金曜に無条件で実行する運用（2026-09-05決定、変更なし）。
- 実在しない・データが不十分な機種でツールを作らないこと。公開されている実際の設定差データが確認できた機種のみ扱う。
- 一つの機種につき一つの判別ツール。小さく、実際に使えるものを優先する。

## One-time manual setup (do this once, then it's fully automatic)

1. このリポジトリの**Settings → Pages**で、**Source**を**GitHub Actions**に設定する（APIやCLIではできず、手動クリックが一度だけ必要）。
2. それ以外は不要 — シークレットや外部アカウントは不要。
