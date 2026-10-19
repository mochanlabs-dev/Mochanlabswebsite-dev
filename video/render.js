// Renders a reel page (<name>.html) frame by frame — no screen recording, so
// timing is exact — and encodes <name>.mp4 + <name>-poster.jpg into
// ../web/public/video/.
//
//   npm install
//   npm run render -- brand              (Mochan Labs brand film, 16:9)
//   npm run render -- brand portrait     (the same film at 9:10, for phones)
//   npm run render -- weighbridge-demo   (Weighbridge product demo)
//
// Needs Google Chrome and ffmpeg. Override paths with CHROME_PATH / FFMPEG.

const { chromium } = require("playwright-core");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { serve } = require("./serve");

const FPS = 30;
const portrait = process.argv[3] === "portrait";
const [W, H] = portrait ? [1080, 1200] : [1920, 1080];
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const page_ = process.argv[2] || "brand";
const name = portrait ? `${page_}-portrait` : page_;
// Frame used as the poster image (shown before the video loads).
const POSTER_FRAME = { brand: 290, "weighbridge-demo": 105 }[page_] ?? 0;
const frames = path.join(__dirname, "frames", name);
const out = process.env.OUT_DIR || path.join(__dirname, "..", "web", "public", "video");

(async () => {
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  fs.mkdirSync(out, { recursive: true });

  const server = await serve();
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(`${server.url}/video/${page_}.html?render${portrait ? "&format=portrait" : ""}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  const duration = await page.evaluate(() => window.__duration);
  const total = Math.round(duration * FPS);

  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.__seek(t), f / FPS);
    await page.screenshot({ path: path.join(frames, `${String(f).padStart(4, "0")}.png`) });
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${total}\n`);
  }
  await browser.close();
  server.close();

  const input = ["-y", "-framerate", String(FPS), "-i", path.join(frames, "%04d.png")];
  // H.264 MP4 plays everywhere, and flat UI compresses so well that VP9/WebM
  // came out larger, so MP4 is the only format.
  execFileSync(FFMPEG, [...input, "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", path.join(out, `${name}.mp4`)], { stdio: "inherit" });
  const poster = path.join(frames, `${String(POSTER_FRAME).padStart(4, "0")}.png`);
  execFileSync(FFMPEG, ["-y", "-i", poster, "-q:v", "3", path.join(out, `${name}-poster.jpg`)], { stdio: "inherit" });

  for (const f of [`${name}.mp4`, `${name}-poster.jpg`]) {
    console.log(f, Math.round(fs.statSync(path.join(out, f)).size / 1024), "KB");
  }
})();
