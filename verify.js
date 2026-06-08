// Playwright verification of every route against the build plan.
// Uses system Chromium headlessly via playwright-core.
const { chromium } = require("/home/temp/Desktop/Personal/SYSTEM_DESIGN_PRO/system-design-dojo/node_modules/playwright-core");

const BASE = "http://localhost:3000";

// route -> { type, markers: [strings that must appear in visible text] }
const CONCEPTS = [
  "beginner/client-server","beginner/dns-how-internet-works","beginner/apis-rest",
  "beginner/databases-101","beginner/caching-basics","beginner/json-data-formats",
  "intermediate/load-balancing","intermediate/database-scaling","intermediate/caching-strategies",
  "intermediate/message-queues","intermediate/sql-vs-nosql","intermediate/api-gateway",
  "intermediate/cdn","intermediate/rate-limiting",
  "advanced/microservices","advanced/database-sharding","advanced/consistent-hashing",
  "advanced/cap-theorem","advanced/event-driven-architecture","advanced/distributed-systems",
  "advanced/replication","advanced/consensus-algorithms",
  "expert/design-youtube","expert/design-twitter","expert/design-whatsapp","expert/design-uber",
  "expert/design-url-shortener","expert/design-notification-system","expert/design-rate-limiter",
];
const COMPARES = ["sql-vs-nosql","monolith-vs-microservice","rest-vs-graphql-vs-grpc","redis-vs-memcached","kafka-vs-rabbitmq"];

const routes = [];
routes.push({ path: "/", type: "landing", markers: ["System Design", "Start Training"] });
routes.push({ path: "/learn", type: "roadmap", markers: ["Roadmap", "Beginner", "Expert"] });
for (const c of CONCEPTS) routes.push({ path: `/learn/${c}`, type: "concept", markers: ["Mark Complete"] });
for (const c of COMPARES) routes.push({ path: `/compare/${c}`, type: "compare", markers: ["verdict"] });
routes.push({ path: "/compare", type: "hub", markers: ["Versus", "VS"] });
routes.push({ path: "/playground", type: "hub", markers: ["Playground", "Load Balancer"] });
routes.push({ path: "/playground/load-balancer", type: "playground", markers: ["Load Balancer", "Things to try"] });
routes.push({ path: "/this-route-does-not-exist", type: "404", markers: ["404"] });

const IGNORE_CONSOLE = /font|gstatic|woff|favicon|Download the React DevTools|preload|net::ERR.*woff|Failed to load resource.*font/i;

(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const results = [];
  for (const r of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const consoleErrors = [];
    page.on("console", (m) => { if (m.type() === "error" && !IGNORE_CONSOLE.test(m.text())) consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => { if (!IGNORE_CONSOLE.test(String(e))) consoleErrors.push("pageerror: " + e.message); });

    let ok = true; const issues = [];
    let bodyLen = 0, h1 = "";
    try {
      const resp = await page.goto(BASE + r.path, { waitUntil: "networkidle", timeout: 25000 });
      const status = resp ? resp.status() : 0;
      if (r.type !== "404" && status >= 400) { ok = false; issues.push(`HTTP ${status}`); }
      // scroll through to trigger any whileInView reveals
      await page.evaluate(async () => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const h = document.body.scrollHeight;
        for (let y = 0; y <= h; y += 700) { window.scrollTo(0, y); await sleep(120); }
        window.scrollTo(0, 0); await sleep(400);
      });
      await page.waitForTimeout(900);

      // Next.js dev error overlay?
      const hasOverlay = await page.locator("nextjs-portal").count().catch(() => 0);
      if (hasOverlay) { ok = false; issues.push("Next error overlay present"); }

      h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
      if (!h1 && r.type !== "404") { ok = false; issues.push("no <h1>"); }

      // visible text length of main content (exclude sidebar nav)
      bodyLen = await page.evaluate(() => {
        const main = document.querySelector("main") || document.body;
        return (main.innerText || "").replace(/\s+/g, " ").trim().length;
      });
      const MIN = r.type === "404" ? 20 : r.type === "hub" ? 250 : 600;
      if (bodyLen < MIN) { ok = false; issues.push(`thin content (${bodyLen} chars < ${MIN})`); }

      // markers present in main innerText
      const mainText = await page.evaluate(() => (document.querySelector("main")?.innerText || document.body.innerText || ""));
      for (const m of r.markers) {
        if (!mainText.includes(m)) { ok = false; issues.push(`missing "${m}"`); }
      }
      // a 404 route legitimately returns a 404 status (browser logs it) — ignore that one
      const realErrors = r.type === "404" ? consoleErrors.filter((e) => !/status of 404|Failed to load resource/i.test(e)) : consoleErrors;
      if (realErrors.length) { ok = false; issues.push(`${realErrors.length} console error(s): ${realErrors[0].slice(0,80)}`); }
    } catch (e) {
      ok = false; issues.push("EXCEPTION: " + e.message.split("\n")[0]);
    }
    results.push({ path: r.path, ok, bodyLen, h1: h1.slice(0, 40), issues });
    await page.close();
  }
  await browser.close();

  const pass = results.filter((r) => r.ok).length;
  console.log(`\n===== RESULTS: ${pass}/${results.length} routes passed =====\n`);
  for (const r of results) {
    const tag = r.ok ? "PASS" : "FAIL";
    console.log(`[${tag}] ${r.path}  (h1="${r.h1}", ${r.bodyLen} chars)` + (r.ok ? "" : `\n        -> ${r.issues.join("; ")}`));
  }
  console.log(`\n===== ${pass}/${results.length} passed; ${results.length - pass} failed =====`);
  process.exit(pass === results.length ? 0 : 1);
})();
