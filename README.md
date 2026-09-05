# Weekly Apps

A new small app, random genre, every Friday — built automatically by a scheduled Claude Code Remote routine and published free on GitHub Pages.

**Live site:** https://haruikntv.github.io/weekly-apps/

## Why not the App Store?

Publishing to the Apple App Store requires an Apple Developer Program membership (**$99/year**), which isn't free. Per the project owner's decision (2026-09-05), this project skips App Store submission entirely: each app is built with Expo (React Native + TypeScript), exported for web, and deployed as a free static site / PWA instead.

## How it works

1. Every Friday at 21:00 JST, a scheduled cloud routine (Claude Code Remote) runs against this repo.
2. It reads `manifest.json` for genres already used and the genre pool, picks an unused genre, and scaffolds a new working Expo app under `apps/<date>-<slug>/`.
3. It commits and pushes to `main`.
4. A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) automatically builds every app's web export and publishes them all to GitHub Pages — no external tokens or secrets required, everything uses the built-in `GITHUB_TOKEN`.
5. `manifest.json` is updated with a new history entry, and the site index (`scripts/generate-index.js`) regenerates a card for the new app.

## Repo layout

- `manifest.json` — genre pool + history of every app built so far (name, genre, date, folder, description).
- `apps/<date>-<slug>/` — one Expo project per week.
- `assets/og-image.svg` — static Open Graph/Twitter Card image for the site, copied into `site/` on every build.
- `scripts/generate-index.js` — builds `site/index.html` (fairground-style listing: thumbnails, "NEW!!" ribbon, genre pills, ad-slot placeholders, meta description/OGP/Twitter Card tags, JSON-LD `CollectionPage`+`ItemList` structured data), `site/sitemap.xml`, and `site/llms.txt` — all regenerated from `manifest.json` on every CI run, so they can never drift out of date.
- `.github/workflows/deploy-pages.yml` — builds every app for web and deploys to GitHub Pages on every push to `main`.

## SEO / AIO（AI検索・AI回答エンジン向け最適化）

このサイトは**技術的な土台を作り込んで、あとは自動で最新に保たれる**方針にしています。`manifest.json`にアプリが追加されるたびにCIが以下をすべて再生成するので、手動でのSEOメンテナンスは基本的に不要です。

- **メタタグ**: description / canonical / OGP / Twitter Card（`generate-index.js`が生成）
- **構造化データ**: `CollectionPage` + `ItemList`（各アプリを`SoftwareApplication`として記述）のJSON-LD
- **サイトマップ**: `site/sitemap.xml`（トップページ＋全アプリページ）。ルートの [haruikntv.github.io/robots.txt](https://haruikntv.github.io/robots.txt) から参照されている
- **llms.txt**: `site/llms.txt`。AI検索・回答エンジン（ChatGPT, Claude, Perplexity等）がこのサイトの内容を平文で把握できるよう、全アプリの一覧をMarkdownで書き出す（[llms.txt仕様](https://llmstxt.org/)に準拠）
- **AIクローラーの許可**: ルートリポジトリの`robots.txt`でGPTBot・ClaudeBot・Google-Extended・PerplexityBot等を明示的に許可（AIO＝AI回答エンジンからの発見されやすさを優先し、ブロックしていない）
- **見出し階層**: `<h1>`サイトタイトル → `<h2>`セクション見出し → `<h3>`各アプリ名、の順で意味的に正しく構成

新しいアプリを追加する週次ルーティンでは、Expoの`app.json`に各アプリの`name`/`description`を具体的に設定することで、個別アプリページ側の`<title>`やメタディスクリプションも意味のある内容にするようにしている（Expoのデフォルトのままにしない）。

## 広告の設置について

`generate-index.js` はページ内に空の広告枠（`.ad-slot`）を3か所用意しています：ヘッダー直下（728×90）、アプリグリッド内（新着アプリ6件ごとに300×250のカードとして挿入）、フッター上（728×90）。今はプレースホルダー表示のみで、実際の広告は出ていません。

収益化するには：

1. 自分で広告ネットワーク（例: [Google AdSense](https://adsense.google.com/)）に登録し、サイト審査を通す。**これは本人確認・銀行口座・税務情報の入力が必要なため、Claudeが代行することはできません。**
2. 発行された広告コード（例: `<ins class="adsbygoogle">...` と `<script>` の読み込みタグ）を教えてもらえれば、`scripts/generate-index.js` の `adSlot()` 関数内、コメント `<!-- AdSense/other ad network snippet goes here -->` の位置に埋め込む。
3. AdSenseは「十分なオリジナルコンテンツ」がないと審査に通らないことが多いので、アプリが数本公開されてから申請するのがおすすめ。

## Notes for whoever (or whatever) picks this up later

- There's no way to check "Claude usage headroom" from inside a session — no tool exposes rate-limit/usage status. The owner chose to run this unconditionally every Friday instead of trying to gate it on usage.
- Keep each app small and genuinely functional — a working single-purpose app beats a half-finished ambitious one.
- One-time manual setup still required (see below) before the first automated run will actually go live.

## One-time manual setup (do this once, then it's fully automatic)

1. In this repo's **Settings → Pages**, set **Source** to **GitHub Actions**. (Can't be done via API/CLI without a token — needs a manual click once.)
2. Nothing else — no secrets, no Vercel/Apple accounts needed.
