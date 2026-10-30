// Dev-only: renders the app through Edge headless over CDP and writes PNGs.
// Needs the dev server on :5173 (`npm run dev`). Not part of the build.
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP = 'http://localhost:5173/';
const OUT = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
const profile = join(tmpdir(), `micava-shots-${Date.now()}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(url) {
  const ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('console.error');
  };
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id;
    pending.set(n, (m) => res(m.result ?? m.error));
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  return { send, errors, close: () => ws.close() };
}

const browser = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--remote-debugging-port=9333', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });

let targets;
for (let i = 0; i < 40; i++) {
  try { targets = await (await fetch('http://127.0.0.1:9333/json/list')).json(); break; } catch { await sleep(250); }
}
const page = targets.find((t) => t.type === 'page');
const { send, errors, close } = await cdp(page.webSocketDebuggerUrl);

await send('Page.enable');
await send('Runtime.enable');
const evaluate = async (expression, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description ?? ''));
  return r.result?.value;
};
const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', {
  width, height, deviceScaleFactor: 2, mobile: width < 600,
});

const seed = `(async () => {
  const r = await import('/src/db/repo.ts');
  await r.clearAll();
  const base = { country: 'España', type: 'tinto', purchasedAt: '2026-10-30', priceCents: 0, location: '', drinkFrom: null, drinkUntil: null, notes: '', varietals: [], stock: 1 };
  await r.createWine({ ...base, name: 'Muga Reserva', winery: 'Bodegas Muga', vintage: 2019, region: 'Rioja', varietals: ['Tempranillo'], priceCents: 1890, location: 'Balda 2', drinkFrom: 2022, drinkUntil: 2031, notes: 'Cereza y vainilla.', stock: 3 });
  await r.createWine({ ...base, name: 'Vega Sicilia Único', winery: 'Vega Sicilia', vintage: 2016, region: 'Ribera del Duero', type: 'tinto', priceCents: 42000, location: 'Balda 1', drinkFrom: 2030, drinkUntil: 2040, stock: 1 });
  await r.createWine({ ...base, name: 'Marqués de Murrieta Reserva', winery: 'Marqués de Murrieta', vintage: 2010, region: 'Rioja', priceCents: 2400, drinkFrom: 2012, drinkUntil: 2022, stock: 1 });
  await r.createWine({ ...base, name: 'Pazo de Señoráns', winery: 'Pazo de Señoráns', vintage: null, region: 'Rías Baixas', type: 'blanco', varietals: ['Albariño'], priceCents: 1450, stock: 2 });
  const wines = await r.listWines();
  const muga = wines.find((w) => w.name === 'Muga Reserva');
  await r.consumeBottle(muga.id, 'Con arroz de verduras');
  return wines.length;
})()`;

const shot = async (name, hash, width, height) => {
  await viewport(width, height);
  await evaluate(`location.hash = '${hash}'`);
  await sleep(500);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(join(OUT, name), Buffer.from(data, 'base64'));
  console.log(name);
};

await mkdir(OUT, { recursive: true });
await viewport(390, 844);
await send('Page.navigate', { url: APP + '#/cava' });
await sleep(1500);
console.log('seeded', await evaluate(seed, true));
await sleep(600);

await shot('cava-390.png', '#/cava', 390, 844);
await shot('add-390.png', '#/add', 390, 844);
await shot('historial-390.png', '#/historial', 390, 844);
await shot('ajustes-390.png', '#/ajustes', 390, 844);
await shot('cava-1280.png', '#/cava', 1280, 800);

// Smoke: search ignores case and accents; the four traffic lights render.
await viewport(390, 844);
await evaluate(`location.hash = '#/cava'`);
await sleep(400);
const search = await evaluate(`(async () => {
  const input = document.querySelector('input[type=search]');
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const type = async (text) => {
    set.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    return [...document.querySelectorAll('main li')].map((li) => li.querySelector('p')?.innerText ?? '');
  };
  const rioja = await type('RIOJA');
  const noAccent = (await type('senorans')).length;
  await type('');
  const badges = [...document.querySelectorAll('li span')].map((s) => s.innerText).filter((t) => /Listo|Guardar|Pronto|Sin datos/.test(t));
  return { rioja, noAccent, badges };
})()`, true);
console.log(JSON.stringify(search));

// Layout audit at phone width: no sideways scroll, nav swapped, 44px targets.
const layout = await evaluate(`(() => {
  const small = [...document.querySelectorAll('main button, main a, nav a, nav button')]
    .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && Math.min(r.width, r.height) < 44; })
    .map((b) => (b.getAttribute('aria-label') || b.innerText || b.tagName).slice(0, 30));
  return JSON.stringify({
    w: innerWidth, h: innerHeight, dpr: devicePixelRatio,
    scrollWidth: document.documentElement.scrollWidth,
    navs: [...document.querySelectorAll('nav')].map((n) => getComputedStyle(n).display),
    smallTargets: small,
  });
})()`);
console.log(layout);

// Smoke: one tap each way, undo, and zero bottles lands in Historial.
const smoke = await evaluate(`(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const navsBefore = performance.getEntriesByType('navigation').length;
  const stock = (name) => {
    const row = [...document.querySelectorAll('main li')].find((li) => li.innerText.includes(name));
    return row ? row.querySelector('button[aria-label^="Ver ficha"]')?.innerText ?? null : null;
  };
  const press = (label) => document.querySelector('button[aria-label="' + label + '"]')?.click();
  press('Añadir botella de Pazo de Señoráns'); await wait(250);
  const afterAdd = stock('Pazo de Señoráns');
  for (let i = 0; i < 3; i++) { press('Descorchar Pazo de Señoráns'); await wait(250); }
  const stillThere = stock('Pazo de Señoráns');
  [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Deshacer')?.click();
  await wait(300);
  const afterUndo = stock('Pazo de Señoráns');
  press('Descorchar Pazo de Señoráns'); await wait(250);
  press('Descorchar Pazo de Señoráns'); await wait(250);
  location.hash = '#/historial'; await wait(400);
  const text = document.body.innerText;
  return JSON.stringify({
    afterAdd, stillThere, afterUndo,
    reloaded: performance.getEntriesByType('navigation').length !== navsBefore,
    outOfCellar: /fuera de la cava/i.test(text) && text.includes('Pazo de Señoráns'),
    diary: /octubre 2026/i.test(text),
  });
})()`, true);
console.log('smoke', smoke);
console.log('console errors:', errors.length, errors.slice(0, 3));

close();
browser.kill();
await sleep(300);
await rm(profile, { recursive: true, force: true });
