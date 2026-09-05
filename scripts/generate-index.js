const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "..", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const history = manifest.history || [];

const cards = history
  .slice()
  .reverse()
  .map((app) => {
    const folderName = path.basename(app.folder || "");
    return `
      <a class="card" href="./${folderName}/">
        <h2>${escapeHtml(app.name)}</h2>
        <p class="genre">${escapeHtml(app.genre)}</p>
        <p>${escapeHtml(app.description || "")}</p>
        <p class="date">${escapeHtml(app.date)}</p>
      </a>`;
  })
  .join("\n");

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Weekly Apps</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; }
  h1 { margin-bottom: 4px; }
  .subtitle { color: #888; margin-top: 0; }
  .card { display: block; border: 1px solid #8888; border-radius: 12px; padding: 16px; margin: 16px 0; text-decoration: none; color: inherit; }
  .card:hover { border-color: #888; }
  .card h2 { margin: 0 0 4px 0; }
  .genre { color: #888; font-size: 0.9em; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.03em; }
  .date { color: #888; font-size: 0.85em; }
  .empty { color: #888; }
</style>
</head>
<body>
  <h1>Weekly Apps</h1>
  <p class="subtitle">A new small app, random genre, every Friday.</p>
  ${history.length ? cards : '<p class="empty">No apps yet — check back Friday.</p>'}
</body>
</html>
`;

fs.mkdirSync(path.join(__dirname, "..", "site"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "..", "site", "index.html"), html);
console.log(`Generated index.html with ${history.length} app(s).`);
