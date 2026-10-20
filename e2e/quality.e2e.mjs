/**
 * Calidad de las páginas públicas en un navegador real:
 *  - Accesibilidad: axe-core con las reglas WCAG 2.1 A/AA.
 *  - Seguridad: ninguna violación de la Content Security Policy (aparecen como errores de consola).
 *  - Rendimiento: LCP, CLS y JavaScript transferido en una carga en frío.
 *
 * Uso: npm run test:quality -w @reapersys/frontend [-- mobile]
 * Contra un build de producción (`npm run build && npm run start`) las métricas son representativas;
 * en `next dev` solo son orientativas.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import puppeteer from "puppeteer-core";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const device = process.argv[2] === "mobile" ? "mobile" : "desktop";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const DEFAULT_PAGES = ["/", "/nosotros", "/servicios", "/desarrollo-web", "/ecommerce", "/punto-de-venta", "/paquetes", "/industrias", "/contacto", "/cotizador", "/admin/login"];
// QUALITY_PAGES=/a,/b permite analizar otras páginas (p. ej. /aviso-de-privacidad una vez publicado).
const PAGES = process.env.QUALITY_PAGES ? process.env.QUALITY_PAGES.split(",") : DEFAULT_PAGES;
// Presupuestos (carga en frío): LCP según Core Web Vitals «bueno»; CLS ≤ 0.1.
const BUDGET = { lcpMs: 2500, cls: 0.1 };

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? defaultChromePath(),
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const results = [];
let failed = false;
for (const path of PAGES) {
  const page = await browser.newPage();
  await page.setViewport(device === "mobile" ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 200)));
  let jsBytes = 0;
  page.on("response", async (res) => {
    if (res.request().resourceType() !== "script") return;
    const length = Number(res.headers()["content-length"] ?? 0);
    jsBytes += length || (await res.buffer().catch(() => Buffer.alloc(0))).length;
  });

  // Observadores de métricas antes de que cargue la página.
  await page.evaluateOnNewDocument(() => {
    window.__lcp = 0;
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  // Recorre la página para revelar las secciones animadas antes de analizarlas.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 800));
  const { lcp, cls } = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls }));

  await page.evaluate(axeSource);
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
  });

  const csp = consoleErrors.filter((e) => /Content Security Policy|Refused to/i.test(e));
  const pageFailed = axe.length > 0 || csp.length > 0 || consoleErrors.length > 0 || cls > BUDGET.cls || (process.env.QUALITY_ENFORCE_LCP === "1" && lcp > BUDGET.lcpMs);
  failed ||= pageFailed;
  results.push({ path, ok: !pageFailed, lcpMs: Math.round(lcp), cls: Number(cls.toFixed(3)), jsKB: Math.round(jsBytes / 1024), a11y: axe, consoleErrors });
  await page.close();
}
await browser.close();

for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.path.padEnd(16)} LCP ${String(r.lcpMs).padStart(5)} ms · CLS ${r.cls} · JS ${r.jsKB} KB`);
  for (const v of r.a11y) console.log(`    a11y [${v.impact}] ${v.id}: ${v.help} → ${v.nodes.join(" | ")}`);
  for (const e of r.consoleErrors) console.log(`    consola: ${e}`);
}
console.log(JSON.stringify({ ok: !failed, device }));
if (failed) process.exitCode = 1;

function defaultChromePath() {
  if (process.platform === "win32") return "C:/Program Files/Google/Chrome/Application/chrome.exe";
  if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/google-chrome";
}
