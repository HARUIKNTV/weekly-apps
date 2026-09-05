const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "..", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const history = manifest.history || [];

// ---- genre -> emoji (exhaustive for the fixed genre_pool, with a fallback) ----
const GENRE_EMOJI = {
  "habit tracker": "📈",
  "recipe / meal planner": "🍳",
  "expense / budget tracker": "💰",
  "meditation / breathing timer": "🧘",
  "workout logger": "💪",
  "flashcard / language study": "🗂️",
  "pomodoro / focus timer": "⏰",
  "trip packing checklist": "🧳",
  "plant watering reminder": "🌱",
  "mood / journal diary": "📔",
  "unit / currency converter": "🔄",
  "tip & bill splitter": "🧾",
  "reading list tracker": "📚",
  "water intake tracker": "💧",
  "simple drawing / sketch pad": "🎨",
  "dice / random decision maker": "🎲",
  "grocery list with categories": "🛒",
  "birthday / anniversary reminder": "🎂",
  "sleep cycle logger": "😴",
  "local weather + outfit suggester": "⛅",
  "countdown to events": "⏳",
  "quick note / sticky notes": "📝",
  "chore / roommate task splitter": "🧹",
  "simple quiz / trivia game": "❓",
  "color palette generator": "🌈",
};
const FALLBACK_EMOJI = "🎮";

// ---- deterministic "random" look per app, based on its name ----
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

function thumbnailDataUri(name, genre) {
  const hash = hashString(name + genre);
  const hue = hash % 360;
  const hue2 = (hue + 45 + (hash % 30)) % 360;
  const rotateEmoji = (hash % 20) - 10;
  const emoji = GENRE_EMOJI[genre] || FALLBACK_EMOJI;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue},85%,68%)"/>
        <stop offset="100%" stop-color="hsl(${hue2},85%,55%)"/>
      </linearGradient>
    </defs>
    <rect width="300" height="220" fill="url(#g)"/>
    <circle cx="${40 + (hash % 40)}" cy="${30 + (hash % 20)}" r="${18 + (hash % 14)}" fill="#fff" opacity="0.18"/>
    <circle cx="${250 - (hash % 50)}" cy="${180 - (hash % 30)}" r="${26 + (hash % 20)}" fill="#fff" opacity="0.14"/>
    <text x="150" y="128" font-size="86" text-anchor="middle" transform="rotate(${rotateEmoji} 150 110)">${emoji}</text>
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

const cardsHtml = sorted
  .map((app, i) => {
    const folderName = path.basename(app.folder || "");
    const emoji = GENRE_EMOJI[app.genre] || FALLBACK_EMOJI;
    const rotation = ((hashString(app.name || "") % 7) - 3) + "deg";
    const isNew = i === 0;
    const card = `
      <a class="card" style="--tilt: ${rotation}" href="./${folderName}/">
        ${isNew ? '<span class="ribbon">NEW!!</span>' : ""}
        <img class="thumb" src="${thumbnailDataUri(app.name || "", app.genre || "")}" alt="${escapeHtml(app.name)}のサムネイル" />
        <div class="card-body">
          <span class="genre-pill">${emoji} ${escapeHtml(app.genre)}</span>
          <h2>${escapeHtml(app.name)}</h2>
          <p class="desc">${escapeHtml(app.description || "")}</p>
          <p class="date">🗓️ ${escapeHtml(app.date)}</p>
          <span class="play-btn">あそんでみる ▶</span>
        </div>
      </a>`;
    // Drop in an in-grid ad card every 6 apps, styled to match the card grid.
    if (i > 0 && i % 6 === 0) {
      return adSlot("300 x 250", "ad-card") + card;
    }
    return card;
  })
  .join("\n");

const emptyState = `
  <div class="empty-state">
    <div class="empty-emoji">🛠️✨🚧</div>
    <p>ただいま準備中！ 毎週金曜21:00に新作アプリが公開されます。おたのしみに〜！</p>
  </div>`;

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Weekly Apps 博覧会</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Yusei+Magic&display=swap" rel="stylesheet">
<style>
  :root {
    --bg1: #fff2a8;
    --bg2: #ffd6ec;
    --ink: #3a2b00;
    --card-bg: #fffdf6;
    --accent: #ff4d8d;
    --accent2: #2fb8ff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Yusei Magic', sans-serif;
    color: var(--ink);
    background:
      radial-gradient(circle at 10% 10%, #ffffff55 0, transparent 40%),
      radial-gradient(circle at 90% 20%, #ffffff55 0, transparent 35%),
      linear-gradient(135deg, var(--bg1), var(--bg2) 60%, #b8f2ff);
    background-attachment: fixed;
    overflow-x: hidden;
  }
  a { color: inherit; }

  /* ---------- header ---------- */
  header {
    position: relative;
    text-align: center;
    padding: 36px 16px 28px;
    overflow: hidden;
  }
  .deco {
    position: absolute;
    font-size: 42px;
    opacity: 0.55;
    user-select: none;
    pointer-events: none;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.08));
  }
  h1 {
    font-family: 'Mochiy Pop One', sans-serif;
    font-size: clamp(28px, 6vw, 54px);
    margin: 0;
    display: inline-block;
    color: var(--accent);
    -webkit-text-stroke: 2px #ffffff;
    text-shadow:
      3px 3px 0 #ffffff,
      6px 6px 0 rgba(58,43,0,0.15);
    transform: rotate(-2deg);
  }
  .marquee {
    margin: 14px auto 0;
    max-width: 640px;
    background: #3a2b00;
    color: #fff2a8;
    border-radius: 999px;
    padding: 8px 0;
    overflow: hidden;
    white-space: nowrap;
    font-size: 14px;
    border: 3px dashed #fff2a8;
  }
  .marquee span {
    display: inline-block;
    padding-left: 100%;
    animation: scroll-left 18s linear infinite;
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
    background: repeating-linear-gradient(45deg, #ffffffaa, #ffffffaa 10px, #f2f2f2aa 10px, #f2f2f2aa 20px);
    border: 3px dashed #999;
    border-radius: 16px;
    color: #777;
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
    font-family: 'Mochiy Pop One', sans-serif;
    text-align: center;
    font-size: clamp(20px, 4vw, 30px);
    color: var(--accent2);
    -webkit-text-stroke: 1.5px #ffffff;
    text-shadow: 2px 2px 0 #ffffff;
    margin: 18px 0 22px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 26px;
  }
  .card {
    position: relative;
    display: block;
    background: var(--card-bg);
    border: 4px solid var(--ink);
    border-radius: 18px;
    text-decoration: none;
    transform: rotate(var(--tilt, 0deg));
    box-shadow: 6px 6px 0 rgba(58,43,0,0.25);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    overflow: hidden;
  }
  .card:hover {
    transform: rotate(0deg) scale(1.04);
    box-shadow: 9px 9px 0 rgba(58,43,0,0.3);
    z-index: 2;
  }
  .thumb { display: block; width: 100%; height: 150px; object-fit: cover; border-bottom: 4px solid var(--ink); }
  .card-body { padding: 12px 14px 16px; }
  .ribbon {
    position: absolute;
    top: 10px;
    right: -34px;
    background: var(--accent);
    color: #fff;
    font-family: 'Mochiy Pop One', sans-serif;
    font-size: 12px;
    padding: 4px 40px;
    transform: rotate(30deg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.25);
    z-index: 3;
  }
  .genre-pill {
    display: inline-block;
    background: var(--accent2);
    color: #fff;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 6px;
  }
  .card h2 {
    font-family: 'Mochiy Pop One', sans-serif;
    font-size: 17px;
    margin: 2px 0 6px;
    line-height: 1.3;
  }
  .desc { font-size: 13px; line-height: 1.5; margin: 0 0 8px; color: #5a4a1e; }
  .date { font-size: 11px; color: #8a7a4e; margin: 0 0 10px; }
  .play-btn {
    display: inline-block;
    background: var(--ink);
    color: #fff2a8;
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 999px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    font-size: 16px;
  }
  .empty-emoji { font-size: 48px; margin-bottom: 12px; }

  footer {
    text-align: center;
    padding: 20px 16px 50px;
    font-size: 12px;
    color: #6a5a2e;
  }
  footer a { text-decoration: underline; }
</style>
</head>
<body>

  <header>
    <span class="deco" style="top:8px; left:6%;">⭐</span>
    <span class="deco" style="top:60px; left:2%; font-size:28px;">🎈</span>
    <span class="deco" style="top:10px; right:8%;">🎉</span>
    <span class="deco" style="top:70px; right:3%; font-size:30px;">✨</span>
    <span class="deco" style="bottom:-6px; left:20%; font-size:26px;">🕹️</span>
    <span class="deco" style="bottom:-10px; right:22%; font-size:30px;">🎪</span>
    <h1>🎡 Weekly Apps 博覧会 🎡</h1>
    <div class="marquee"><span>毎週金曜21:00 新作アプリ公開中〜！ランダムジャンルでお届けするミニアプリ博覧会★ ぜひ遊びに来てね！　毎週金曜21:00 新作アプリ公開中〜！</span></div>
  </header>

  ${adSlot("728 x 90", "ad-leaderboard")}

  <main>
    <p class="section-title">🆕 新着アプリ一覧 🆕</p>
    ${history.length ? `<div class="grid">${cardsHtml}</div>` : emptyState}
  </main>

  ${adSlot("728 x 90", "ad-footer")}

  <footer>
    <p>Weekly Apps 博覧会 — 毎週ランダムジャンルの小さなアプリをお届け中。<br>
    <a href="https://github.com/HARUIKNTV/weekly-apps">GitHubリポジトリ</a></p>
  </footer>

</body>
</html>
`;

fs.mkdirSync(path.join(__dirname, "..", "site"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "..", "site", "index.html"), html);
console.log(`Generated index.html with ${history.length} app(s).`);
