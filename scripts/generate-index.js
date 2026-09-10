const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "..", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const history = manifest.history || [];

const SITE_NAME = "スロット設定判別";
const SITE_URL = "https://haruikntv.github.io/weekly-apps/";

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
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

// Sort by date descending (newest first); within the same date, the entry
// added later to manifest.json (higher array index) is shown first.
const sorted = history
  .map((app, i) => ({ app, i }))
  .sort((a, b) => {
    const dateCompare = (b.app.date || "").localeCompare(a.app.date || "");
    return dateCompare !== 0 ? dateCompare : b.i - a.i;
  })
  .map((x) => x.app);
const description = history.length
  ? `パチスロの公開設定差データをもとにした設定判別ツール集。現在${history.length}機種のツールを公開中。`
  : "パチスロの公開設定差データをもとに、機種ごとの設定判別ツールを毎週追加していくサイトです。";

const pillsHtml = sorted
  .map((app, i) => {
    const folderName = path.basename(app.folder || "");
    const isNew = i === 0;
    const searchKey = escapeHtml((app.name || "").toLowerCase());
    return `<a class="pill" href="./${folderName}/" data-name="${searchKey}">${isNew ? '<span class="pill-new">NEW</span>' : ""}${escapeHtml(app.name)}</a>`;
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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7523687500134096" crossorigin="anonymous"></script>
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
    --bg: #ffffff;
    --bg2: #f4f4f5;
    --card-bg: #ffffff;
    --line: #e4e4e7;
    --ink: #18181b;
    --sub: #6b6b70;
    --accent: #d6202c;
    --accent2: #b3161f;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Zen Kaku Gothic New', system-ui, sans-serif;
    color: var(--ink);
    background: var(--bg);
    overflow-x: hidden;
    word-break: keep-all;
    overflow-wrap: break-word;
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
    background: repeating-linear-gradient(45deg, #f4f4f5, #f4f4f5 10px, #ececef 10px, #ececef 20px);
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

  /* ---------- list ---------- */
  main { max-width: 900px; margin: 0 auto; padding: 8px 16px 60px; }
  .section-title {
    text-align: center;
    font-size: clamp(18px, 4vw, 26px);
    font-weight: 700;
    color: var(--ink);
    margin: 22px 0 18px;
  }
  .section-title::before,
  .section-title::after {
    content: "―――";
    color: var(--line);
    margin: 0 12px;
    font-size: 14px;
    vertical-align: middle;
  }

  .search-box {
    display: block;
    width: 100%;
    max-width: 420px;
    margin: 0 auto 24px;
    background: var(--card-bg);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 11px 18px;
    color: var(--ink);
    font-size: 14px;
    font-family: inherit;
  }
  .search-box::placeholder { color: var(--sub); }
  .search-box:focus { outline: 2px solid var(--accent2); outline-offset: 1px; }

  .pill-list { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--card-bg);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }
  .pill:hover { border-color: var(--accent2); transform: translateY(-2px); }
  .pill-new {
    background: var(--accent);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .no-results { text-align: center; color: var(--sub); font-size: 13px; padding: 30px 0; display: none; }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--sub);
    font-size: 15px;
  }
  .empty-emoji { font-size: 44px; margin-bottom: 12px; }

  .fb-fab {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 999;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    border: none;
    font-size: 22px;
    line-height: 52px;
    text-align: center;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  }
  .fb-panel {
    position: fixed;
    right: 18px;
    bottom: 82px;
    z-index: 999;
    width: min(320px, calc(100vw - 36px));
    background: var(--card-bg, var(--bg, #fff));
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.22);
  }
  .fb-panel h3 { margin: 0 0 8px; font-size: 15px; color: var(--ink); }
  .fb-panel p { margin: 0 0 10px; font-size: 12px; color: var(--sub); line-height: 1.5; }
  .fb-panel textarea {
    width: 100%;
    min-height: 90px;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px;
    font-family: inherit;
    font-size: 13px;
    color: var(--ink);
    background: var(--bg, #fff);
    resize: vertical;
    box-sizing: border-box;
  }
  .fb-panel .fb-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
  .fb-panel button.fb-send {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  .fb-panel button.fb-close {
    background: none;
    border: none;
    color: var(--sub);
    font-size: 13px;
    cursor: pointer;
    padding: 8px 4px;
  }

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
    ${history.length
      ? `<input type="search" class="search-box" id="searchBox" placeholder="機種名で検索..." />
    <div class="pill-list" id="pillList">${pillsHtml}</div>
    <p class="no-results" id="noResults">該当する機種が見つかりませんでした。</p>`
      : emptyState}
  </main>

  ${adSlot("728 x 90", "ad-footer")}

  <footer>
    <p>${SITE_NAME} — パチスロの公開設定差データに基づく判別ツール集。<br>
    <a href="https://github.com/HARUIKNTV/weekly-apps">GitHubリポジトリ</a></p>
  </footer>

<script>
  const searchBox = document.getElementById('searchBox');
  const pills = document.querySelectorAll('#pillList .pill');
  const noResults = document.getElementById('noResults');
  searchBox && searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();
    let visibleCount = 0;
    pills.forEach((pill) => {
      const match = pill.dataset.name.includes(q);
      pill.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  });
</script>

<button class="fb-fab" id="fbFab" aria-label="ご意見・ご要望を送る" title="ご意見・ご要望">💬</button>
<div class="fb-panel" id="fbPanel" hidden>
  <h3>ご意見・ご要望</h3>
  <p>追加してほしい機種、不具合報告、その他ご意見をお気軽にどうぞ。送信を押すとお使いのメールソフトが起動します。</p>
  <textarea id="fbText" placeholder="例：〇〇の設定判別ツールも追加してほしいです"></textarea>
  <div class="fb-actions">
    <button type="button" class="fb-close" id="fbClose">閉じる</button>
    <button type="button" class="fb-send" id="fbSend">メールで送信</button>
  </div>
</div>
<script>
(function () {
  var fab = document.getElementById('fbFab');
  var panel = document.getElementById('fbPanel');
  var closeBtn = document.getElementById('fbClose');
  var sendBtn = document.getElementById('fbSend');
  var textEl = document.getElementById('fbText');
  if (!fab || !panel || !sendBtn || !textEl) return;
  fab.addEventListener('click', function () {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) textEl.focus();
  });
  closeBtn.addEventListener('click', function () { panel.hidden = true; });
  sendBtn.addEventListener('click', function () {
    var addr = ['haruyuki.koyama.0312', 'gmail.com'].join('@');
    var subject = encodeURIComponent('【スロット設定判別】ご意見・ご要望');
    var body = encodeURIComponent((textEl.value || '') + '\\n\\n---\\nページ: ' + location.href);
    window.location.href = 'mailto:' + addr + '?subject=' + subject + '&body=' + body;
  });
})();
</script>
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
