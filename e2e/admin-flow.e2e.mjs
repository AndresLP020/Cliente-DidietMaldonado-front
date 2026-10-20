/**
 * E2E del panel administrativo en un navegador real. Solo LECTURA: no modifica precios ni
 * configuración, para poder ejecutarse contra una base con datos reales.
 *
 * Requiere API y frontend en ejecución y un usuario con rol owner o admin:
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e:admin -w @reapersys/frontend [-- mobile]
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const device = process.argv[2] === "mobile" ? "mobile" : "desktop";
const outDir = process.env.E2E_OUT_DIR ?? "e2e/screenshots";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error("Define E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD.");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const log = (msg) => console.log(`✓ ${msg}`);
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? defaultChromePath(),
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
// Los 401 esperados (sesión inexistente / credenciales inválidas) no cuentan como errores.
page.on("console", (m) => m.type() === "error" && !/401|Unauthorized/.test(m.text()) && errors.push(m.text()));
await page.setViewport(device === "mobile" ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });

const waitText = (t, timeout = 15_000) => page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, t);
const shot = (name, fullPage = false) => page.screenshot({ path: `${outDir}/admin-${device}-${name}.png`, fullPage });
const clickText = (label, selector = "a, button") =>
  page.waitForFunction(
    (label, selector) => {
      const el = [...document.querySelectorAll(selector)].find((e) => e.innerText.trim().includes(label) && e.offsetParent !== null);
      el?.click();
      return Boolean(el);
    },
    { timeout: 15_000 },
    label,
    selector,
  );

try {
  // 1. Ruta protegida sin sesión → inicio de sesión conservando el destino
  await page.goto(`${BASE}/admin/precios`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => location.pathname === "/admin/login", { timeout: 15_000 });
  if (!page.url().includes("next=%2Fadmin%2Fprecios")) throw new Error(`Falta el destino en la URL: ${page.url()}`);
  log("sin sesión, /admin/precios redirige a /admin/login?next=…");

  // 2. Credenciales incorrectas
  await page.type("#email", EMAIL);
  await page.type("#password", "incorrecta-123");
  await page.click("button[type=submit]");
  await waitText("Correo o contraseña incorrectos");
  log("credenciales incorrectas: mensaje genérico");
  await shot("login-error");

  // 3. Inicio de sesión correcto → vuelve al destino solicitado
  await page.type("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(() => location.pathname === "/admin/precios", { timeout: 20_000 });
  await waitText("Catálogo y precios");
  await waitText("Sección adicional");
  log("inicio de sesión correcto: regresa a /admin/precios con el catálogo real");
  await shot("prices");

  // 4. Editor de precios de un paquete (solo lectura: no se guarda nada)
  // Las pestañas de Radix se activan con mousedown: se usa un clic real, no el.click().
  await page.locator("button[role=tab]::-p-text(Paquetes)").click();
  await clickText("POS Integral", "button");
  await waitText("Historial de precios");
  await waitText("Diferencia por variante");
  log("editor de paquete: historial, variantes y créditos de retiro");
  await shot("package-editor");
  await page.keyboard.press("Escape");

  // 5. Tablero con datos reales
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await waitText("Cotizaciones por día");
  await waitText("Por revisar");
  log("tablero con indicadores y gráfica");
  await shot("dashboard", true);

  // 6. Resto de secciones
  for (const [path, text] of [
    ["/admin/cotizaciones", "Cotizaciones"],
    ["/admin/prospectos", "Prospectos"],
    ["/admin/clientes", "Clientes"],
    ["/admin/configuracion", "Configuración comercial"],
    ["/admin/usuarios", "Usuarios"],
    ["/admin/auditoria", "Auditoría"],
    ["/admin/cuenta", "Cambiar contraseña"],
  ]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
    await waitText(text);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) throw new Error(`${path}: desbordamiento horizontal de ${overflow}px`);
  }
  log("cotizaciones, prospectos, clientes, configuración, usuarios, auditoría y cuenta cargan sin desbordes");
  await page.goto(`${BASE}/admin/configuracion`, { waitUntil: "networkidle0" });
  await waitText("Impuestos");
  await shot("settings", true);

  // 7. Cerrar sesión
  if (device === "mobile") await page.click('button[aria-label="Abrir menú"]');
  await clickText("Cerrar sesión", "button");
  await page.waitForFunction(() => location.pathname === "/admin/login", { timeout: 15_000 });
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => location.pathname === "/admin/login", { timeout: 15_000 });
  log("cerrar sesión invalida el acceso al panel");

  console.log(JSON.stringify({ ok: true, device, consoleErrors: errors }));
  if (errors.length) process.exitCode = 1;
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
