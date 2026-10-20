/**
 * E2E del cotizador en un navegador real (Chrome/Edge vía puppeteer-core):
 * industria → necesidad → paquete → personalizar → resumen → datos → cotización → enlace público.
 *
 * Requiere la API y el frontend en ejecución con el catálogo cargado (npm run db:seed).
 * Uso:  npm run test:e2e -w @reapersys/frontend [-- mobile]
 * Variables: E2E_BASE_URL (por defecto http://localhost:3000), CHROME_PATH, E2E_OUT_DIR.
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const device = process.argv[2] === "mobile" ? "mobile" : "desktop";
const outDir = process.env.E2E_OUT_DIR ?? "e2e/screenshots";
mkdirSync(outDir, { recursive: true });

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const log = (msg) => console.log(`✓ ${msg}`);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? defaultChromePath(),
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.setViewport(device === "mobile" ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });

const text = (t) => `::-p-text(${t})`;
const waitText = (t, timeout = 15_000) =>
  page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, t);
// Pulsa el botón VISIBLE con ese texto (algunos existen en versión móvil y escritorio).
const clickVisible = (label) =>
  page.waitForFunction((label) => {
    const button = [...document.querySelectorAll("button, a")].find((el) => el.innerText.includes(label) && el.offsetParent !== null && !el.disabled);
    if (button) button.click();
    return Boolean(button);
  }, { timeout: 15_000 }, label);
const shot = (name) => page.screenshot({ path: `${outDir}/flow-${device}-${name}.png`, fullPage: false });

try {
  // 1. Entrada desde una tarjeta de industria
  await page.goto(`${BASE}/cotizador?industria=tiendas-abarrotes`, { waitUntil: "networkidle0" });
  await waitText("¿Qué necesitas implementar?");
  log("industria preseleccionada desde ?industria= → paso 2");
  await waitText("Sugerido para tu negocio");
  log("la industria sugiere soluciones");

  // 2. Necesidad
  await page.locator(`button[role=radio] ${text("Punto de venta")}`).click();
  await waitText("Elige un punto de partida");
  await waitText("POS Integral");
  log("paso 3: paquetes de punto de venta cargados desde la API");

  // 3. Paquete (la primera tarjeta es POS Integral por sortOrder)
  const cards = await page.$$("article");
  for (const card of cards) {
    if ((await card.evaluate((el) => el.innerText)).includes("POS Integral")) {
      await (await card.$("button")).click();
      break;
    }
  }
  await waitText("Personaliza POS Integral");
  await waitText("Incluido en tu paquete");
  log("paso 4: personalización con componentes incluidos");

  // 4. Agregar báscula y esperar el recálculo del servidor
  await page.locator('button[aria-label="Aumentar Báscula"]').click();
  await page.waitForFunction(() => document.body.innerText.includes("$15,080"), { timeout: 15_000 });
  log("báscula agregada: presupuesto en vivo del servidor = $15,080 (13,000 + IVA)");
  await shot("4-customize");

  // 5. Resumen
  await clickVisible("Ver resumen");
  await waitText("Resumen económico");
  await waitText("Báscula");
  await waitText("Anticipo (50 %)");
  log("paso 5: resumen con desglose, IVA, anticipo y liquidación");
  await shot("5-summary");

  // 6. Datos del cliente
  await clickVisible("Continuar");
  await page.waitForSelector("#name", { visible: true, timeout: 15_000 });
  await page.type("#name", "Prueba E2E");
  await page.type("#company", "Abarrotes de Prueba");
  await page.type("#email", "e2e@example.com");
  // Validación del cliente: sin consentimiento no se envía
  await page.locator(`button ${text("Solicitar cotización")}`).click();
  await waitText("Necesitamos tu consentimiento");
  log("paso 6: el consentimiento es obligatorio");
  await page.click("#consentContact");
  await page.locator(`button ${text("Solicitar cotización")}`).click();

  // 7. Resultado
  await waitText("Folio", 20_000);
  const folio = await page.evaluate(() => document.body.innerText.match(/RS-\d{4}-\d{5}/)?.[0]);
  if (!folio) throw new Error("No se mostró un folio");
  log(`paso 7: cotización registrada con folio ${folio}`);
  await waitText("Documento PDF");
  const deliveryText = await page.evaluate(() => document.querySelector('[aria-label="Estado de las entregas"]')?.textContent ?? "");
  if (/Enviado/.test(deliveryText)) throw new Error("Una entrega se reporta como enviada sin confirmación del proveedor");
  log("entregas reportadas con su estado real (sin simular éxito)");
  await shot("7-result");

  // PDF desde el resultado (mismo enlace que usa el botón «Descargar PDF»).
  const pdfHref = await page.evaluate(() => [...document.querySelectorAll("a")].find((a) => a.innerText.includes("Descargar PDF"))?.href);
  if (!pdfHref) throw new Error("No se encontró el botón Descargar PDF");
  const pdf = await page.evaluate(async (url) => {
    const res = await fetch(url);
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { status: res.status, type: res.headers.get("content-type"), magic: String.fromCharCode(...bytes.slice(0, 5)) };
  }, pdfHref);
  if (pdf.status !== 200 || pdf.type !== "application/pdf" || pdf.magic !== "%PDF-") throw new Error(`PDF inválido: ${JSON.stringify(pdf)}`);
  log("el PDF de la cotización se descarga correctamente");

  // Enlace público
  await page.locator(`a ${text("Ver mi cotización")}`).click();
  await page.waitForFunction((f) => location.pathname.startsWith("/cotizacion/") && document.body.innerText.includes(f), { timeout: 20_000 }, folio);
  await waitText("$15,080");
  await waitText("Abarrotes de Prueba");
  log("la página /cotizacion/[token] muestra el folio, el cliente y los mismos importes");
  await page.screenshot({ path: `${outDir}/flow-${device}-quote-page.png`, fullPage: true });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) throw new Error(`Desbordamiento horizontal de ${overflow}px`);

  console.log(JSON.stringify({ ok: true, folio, consoleErrors: errors }));
} catch (error) {
  await shot("failure");
  console.log(JSON.stringify({ ok: false, error: String(error), consoleErrors: errors }));
  process.exitCode = 1;
} finally {
  await browser.close();
}

function defaultChromePath() {
  if (process.platform === "win32") return "C:/Program Files/Google/Chrome/Application/chrome.exe";
  if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/google-chrome";
}
