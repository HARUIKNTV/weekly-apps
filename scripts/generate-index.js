const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "..", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const history = manifest.history || [];

const SITE_NAME = "スロ設定判別ラボ";
const SITE_URL = "https://haruikntv.github.io/weekly-apps/";

// ---- deterministic "random" look per tool, based on its name ----
function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

// A handful of slot-flavored icons, picked deterministically per tool for a bit of variety.
const ICONS = ["🎰", "🔔", "7️⃣", "🍒", "💰"];

function thumbnailDataUri(name) {
  const hash = hashString(name);
  const hue = 350 + (hash % 20) - 10; // stays in the red/crimson band
  const hue2 = 40 + (hash % 15); // gold band
  const icon = ICONS[hash % ICONS.length];
  const rotateIcon = (hash % 16) - 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue},55%,14%)"/>
        <stop offset="100%" stop-color="hsl(${hue2},70%,20%)"/>
      </linearGradient>
    </defs>
    <rect width="300" height="220" fill="url(#g)"/>
    <circle cx="${40 + (hash % 40)}" cy="${30 + (hash % 20)}" r="${18 + (hash % 14)}" fill="#ffd77a" opacity="0.10"/>
    <circle cx="${250 - (hash % 50)}" cy="${180 - (hash % 30)}" r="${26 + (hash % 20)}" fill="#ff4d5e" opacity="0.10"/>
    <text x="150" y="128" font-size="86" text-anchor="middle" transform="rotate(${rotateIcon} 150 110)">${icon}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

// ---- ad slot markup (empty placeholders — wire up a real network later, see README) ----
function adSlot(sizeLabel, extraClass) {
  return `
      <div class="ad-slot ${extraClass || ""}">
        <div class="ad-slot-inner">
          <span class="ad-slot-label">広告スペース</span>
          <span class="ad-slot-size">${sizeLabel}</span>
        </div>
        <!-- AdSense/other ad network snippet goes here. See README.md "広告の設置について". -->
      </div>`;
}

const sorted = history.slice().reverse();
const description = history.length
  ? `パチスロの公開設定差データをもとにした設定判別ツール集。現在${history.length}機種のツールを公開中。`
  : "パチスロの公開設定差データをもとに、機種ごとの設定判別ツールを毎週追加していくサイトです。";

const cardsHtml = sorted
  .map((app, i) => {
    const folderName = path.basename(app.folder || "");
    const rotation = ((hashString(app.name || "") % 5) - 2) + "deg";
    const isNew = i === 0;
    const card = `
      <a class="card" style="--tilt: ${rotation}" href="./${folderName}/">
        ${isNew ? '<span class="ribbon">NEW</span>' : ""}
        <img class="thumb" src="${thumbnailDataUri(app.name || "")}" alt="${escapeHtml(app.name)}のサムネイル" />
        <div class="card-body">
          <span class="genre-pill">${escapeHtml(app.genre)}</span>
          <h3>${escapeHtml(app.name)}</h3>
          <p class="desc">${escapeHtml(app.description || "")}</p>
          <p class="date">公開日: ${escapeHtml(app.date)}</p>
          <span class="play-btn">ツールを使う ▶</span>
        </div>
      </a>`;
    // Drop in an in-grid ad card every 6 tools, styled to match the card grid.
    if (i > 0 && i % 6 === 0) {
      return adSlot("300 x 250", "ad-card") + card;
    }
    return card;
  })
  .join("\n");

const emptyState = `
  <div class="empty-state">
    <div class="empty-emoji">🎰</div>
    <p>ただいま準備中。毎週金曜21:00に新しい機種の判別ツールが追加されます。</p>
  </div>`;

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${SITE_NAME}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${SITE_URL}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${SITE_NAME}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${SITE_URL}" />
<meta property="og:image" content="${SITE_URL}og-image.svg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${SITE_NAME}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${SITE_URL}og-image.svg" />
<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: SITE_NAME,
    description,
    url: SITE_URL,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: sorted.map((app, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: app.name,
          description: app.description || "",
          url: SITE_URL + path.basename(app.folder || "") + "/",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
        },
      })),
    },
  },
  null,
  2
)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@500;700;900&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #14100f;
    --bg2: #1d1614;
    --card-bg: #241b18;
    --line: #3a2b26;
    --ink: #f2e9e4;
    --sub: #b8a89f;
    --accent: #c8102e;
    --accent2: #d4a017;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Zen Kaku Gothic New', system-ui, sans-serif;
    color: var(--ink);
    background:
      radial-gradient(circle at 20% 0%, #2a1a1a 0%, transparent 45%),
      radial-gradient(circle at 100% 100%, #201a10 0%, transparent 50%),
      var(--bg);
    background-attachment: fixed;
    overflow-x: hidden;
  }
  a { color: inherit; }

  /* ---------- header ---------- */
  header {
    position: relative;
    text-align: center;
    padding: 40px 16px 28px;
    overflow: hidden;
  }
  .eyebrow {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.15em;
    color: var(--accent2);
    border: 1px solid var(--accent2);
    border-radius: 999px;
    padding: 3px 14px;
    margin-bottom: 12px;
  }
  h1 {
    font-size: clamp(28px, 6vw, 46px);
    font-weight: 900;
    margin: 0;
    letter-spacing: 0.02em;
  }
  header .subtitle { color: var(--sub); font-size: 14px; margin: 10px 0 0; }
  .marquee {
    margin: 18px auto 0;
    max-width: 680px;
    background: var(--bg2);
    color: var(--accent2);
    border-radius: 999px;
    padding: 8px 0;
    overflow: hidden;
    white-space: nowrap;
    font-size: 13px;
    border: 1px solid var(--line);
  }
  .marquee span {
    display: inline-block;
    padding-left: 100%;
    animation: scroll-left 22s linear infinite;
  }
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }

  /* ---------- ad slots ---------- */
  .ad-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(45deg, #1a1412, #1a1412 10px, #201917 10px, #201917 20px);
    border: 2px dashed var(--line);
    border-radius: 14px;
    color: var(--sub);
    margin: 20px auto;
  }
  .ad-slot-inner { text-align: center; }
  .ad-slot-label { display: block; font-size: 13px; letter-spacing: 0.1em; }
  .ad-slot-size { display: block; font-size: 11px; opacity: 0.7; }
  .ad-leaderboard { max-width: 728px; height: 90px; }
  .ad-footer { max-width: 728px; height: 90px; }
  .ad-card {
    grid-column: span 1;
    height: 260px;
    transform: none !important;
  }

  /* ---------- grid ---------- */
  main { max-width: 1100px; margin: 0 auto; padding: 8px 16px 60px; }
  .section-title {
    text-align: center;
    font-size: clamp(18px, 4vw, 26px);
    font-weight: 700;
    color: var(--ink);
    margin: 22px 0 22px;
  }
  .section-title::before,
  .section-title::after {
    content: "―――";
    color: var(--line);
    margin: 0 12px;
    font-size: 14px;
    vertical-align: middle;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 22px;
  }
  .card {
    position: relative;
    display: block;
    background: var(--card-bg);
    border: 1px solid var(--line);
    border-radius: 14px;
    text-decoration: none;
    transform: rotate(var(--tilt, 0deg));
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    overflow: hidden;
  }
  .card:hover {
    transform: rotate(0deg) translateY(-3px);
    border-color: var(--accent2);
    box-shadow: 0 10px 24px rgba(0,0,0,0.45);
  }
  .thumb { display: block; width: 100%; height: 150px; object-fit: cover; border-bottom: 1px solid var(--line); }
  .card-body { padding: 14px 16px 18px; }
  .ribbon {
    position: absolute;
    top: 10px;
    right: -30px;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.05em;
    padding: 4px 36px;
    transform: rotate(30deg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.35);
    z-index: 3;
  }
  .genre-pill {
    display: inline-block;
    background: var(--bg2);
    color: var(--accent2);
    border: 1px solid var(--line);
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 8px;
  }
  .card h3 {
    font-size: 16.5px;
    font-weight: 700;
    margin: 2px 0 6px;
    line-height: 1.35;
  }
  .desc { font-size: 13px; line-height: 1.55; margin: 0 0 10px; color: var(--sub); }
  .date { font-size: 11px; color: var(--sub); margin: 0 0 12px; }
  .play-btn {
    display: inline-block;
    background: linear-gradient(90deg, var(--accent), #a80d26);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    padding: 7px 16px;
    border-radius: 999px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--sub);
    font-size: 15px;
  }
  .empty-emoji { font-size: 44px; margin-bottom: 12px; }

  footer {
    text-align: center;
    padding: 24px 16px 50px;
    font-size: 12px;
    color: var(--sub);
  }
  footer a { color: var(--accent2); text-decoration: underline; }
</style>
</head>
<body>

  <header>
    <span class="eyebrow">設定判別ツール集</span>
    <h1>🎰 ${SITE_NAME}</h1>
    <p class="subtitle">公開されている設定差データをもとに、機種ごとの判別ツールを毎週追加しています。</p>
    <div class="marquee"><span>毎週金曜21:00 新しい機種のツールを追加中 ｜ すべて公開データに基づく無料の計算ツールです ｜ 毎週金曜21:00 新しい機種のツールを追加中</span></div>
  </header>

  ${adSlot("728 x 90", "ad-leaderboard")}

  <main>
    <h2 class="section-title">判別ツール一覧</h2>
    ${history.length ? `<div class="grid">${cardsHtml}</div>` : emptyState}
  </main>

  ${adSlot("728 x 90", "ad-footer")}

  <footer>
    <p>${SITE_NAME} — パチスロの公開設定差データに基づく判別ツール集。<br>
    <a href="https://github.com/HARUIKNTV/weekly-apps">GitHubリポジトリ</a></p>
  </footer>

</body>
</html>
`;

const siteDir = path.join(__dirname, "..", "site");
fs.mkdirSync(siteDir, { recursive: true });
fs.writeFileSync(path.join(siteDir, "index.html"), html);

// ---- sitemap.xml: index page + one <url> per tool ----
const urls = [SITE_URL, ...sorted.map((app) => SITE_URL + path.basename(app.folder || "") + "/")];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(siteDir, "sitemap.xml"), sitemap);

// ---- llms.txt: plain-language index of every tool, for LLM/AI-answer-engine crawlers ----
const llmsTxt = `# ${SITE_NAME}

> ${description}

## Tools
${sorted.length
  ? sorted
      .map((app) => `- [${app.name}](${SITE_URL}${path.basename(app.folder || "")}/): ${app.description || ""} (機種: ${app.genre}, 公開日: ${app.date})`)
      .join("\n")
  : "- (まだ公開されているツールはありません。毎週金曜21:00に追加されます。)"}
`;
fs.writeFileSync(path.join(siteDir, "llms.txt"), llmsTxt);

// ---- static OG image asset ----
fs.copyFileSync(path.join(__dirname, "..", "assets", "og-image.svg"), path.join(siteDir, "og-image.svg"));

console.log(`Generated index.html, sitemap.xml, llms.txt with ${history.length} tool(s).`);
