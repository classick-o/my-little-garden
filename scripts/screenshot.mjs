/**
 * Capturi de ecran pentru verificarea vizuala.
 *
 *   npm run shot                     -> pagina principala
 *   npm run shot -- discover journal  -> rute anume
 *
 * Rutele se dau FARA "/" la inceput: in Git Bash pe Windows un argument
 * care incepe cu "/" e convertit automat intr-o cale Windows.
 *
 * Serverul de dev trebuie sa ruleze. Imaginile ies in .screenshots/,
 * la dimensiunea unui iPhone 13 Pro Max (390x844).
 */
import { mkdir } from "node:fs/promises";
import { chromium, devices } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = ".screenshots";
/** "discover" sau "/discover" -> "/discover"; nimic -> "/". */
function toRoute(arg) {
  const trimmed = arg.replace(/^\/+/, "").replace(/\/+$/, "");
  return "/" + trimmed;
}

const args = process.argv.slice(2);
const routes = args.length ? args.map(toRoute) : ["/"];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["iPhone 13 Pro Max"],
  isMobile: true,
  hasTouch: true,
});

for (const route of routes) {
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(400); // asteapta fonturile

  const name = route === "/" ? "home" : route.replace(/\//g, "-").slice(1);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`${route} -> ${OUT}/${name}.png`);
  if (errors.length) console.log("  erori:", errors.join(" | "));

  await page.close();
}

await browser.close();
