// Minimal static server rooted at the repo, so reel.html can load the site's
// images and GSAP (../web/...) over http. `node serve.js` to preview.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2" };

function serve(port = 0) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (!file.startsWith(root)) return res.writeHead(403).end();
      fs.readFile(file, (err, data) => {
        if (err) return res.writeHead(404).end();
        res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" }).end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => {
      const url = `http://127.0.0.1:${server.address().port}`;
      resolve({ url, close: () => server.close() });
    });
  });
}

module.exports = { serve };

if (require.main === module) {
  serve(4321).then(({ url }) => console.log(`Preview: ${url}/video/reel.html`));
}
