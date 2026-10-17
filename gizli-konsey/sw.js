/* Offline worker of the party-game family (WEB builds only: the pages inside Capacitor and on the LAN relay never
 * register it). cekirdek/vite/offline.ts writes this file into the build output as `sw.js`, with the one line below
 * replaced by the build's file list. Everything here is same-origin GET only: the table's traffic (Supabase websockets,
 * the LAN relay, ads, analytics) is never touched.
 *
 *   precache   the app shell: index.html, every non-language chunk, styles, fonts, icons, manifest
 *   warm       the current language and English (a page message): their dictionaries and content chunks
 *   everything else is cached the first time it is fetched (other languages, packs picked later)
 *   pages      network first (a deploy shows at once), the cached shell when the network is gone or slow
 *   hashed     cache first (the name changes with the content)
 *   the rest   cached copy now, refreshed in the background
 *   cleanup    caches of this game only; the newest two versions stay, so a tab opened before an update still finds the
 *              chunks of ITS build
 */
'use strict';

const CFG = {"name":"gizli-konsey","version":"0tn142i-d243f03394","core":["assets/SingleFlow-tua1Iw3t.js","assets/esm-BAil3w6L.js","assets/esm-BYHTIic2.js","assets/index-D351AbUy.js","assets/index-v6NZZxoB.css","assets/inter-cyrillic-400-normal-obahsSVq.woff2","assets/inter-cyrillic-600-normal-CWCymEST.woff2","assets/inter-cyrillic-700-normal-CjBOestx.woff2","assets/inter-cyrillic-800-normal-C7MGvYyJ.woff2","assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2","assets/inter-cyrillic-ext-600-normal-Dfes3d0z.woff2","assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2","assets/inter-cyrillic-ext-800-normal-BZOjs1Xv.woff2","assets/inter-greek-400-normal-B4URO6DV.woff2","assets/inter-greek-600-normal-plRanbMR.woff2","assets/inter-greek-700-normal-C3JjAnD8.woff2","assets/inter-greek-800-normal-CLIouy3y.woff2","assets/inter-greek-ext-400-normal-DGGRlc-M.woff2","assets/inter-greek-ext-600-normal-DRtmH8MT.woff2","assets/inter-greek-ext-700-normal-qfdV9bQt.woff2","assets/inter-greek-ext-800-normal-B--PVpEC.woff2","assets/inter-latin-400-normal-C38fXH4l.woff2","assets/inter-latin-600-normal-LgqL8muc.woff2","assets/inter-latin-700-normal-Yt3aPRUw.woff2","assets/inter-latin-800-normal-BYj_oED-.woff2","assets/inter-latin-ext-400-normal-C1nco2VV.woff2","assets/inter-latin-ext-600-normal-D2bJ5OIk.woff2","assets/inter-latin-ext-700-normal-Ca8adRJv.woff2","assets/inter-latin-ext-800-normal-DZJjya6U.woff2","assets/inter-vietnamese-400-normal-DMkecbls.woff2","assets/inter-vietnamese-600-normal-Cc8MFFhd.woff2","assets/inter-vietnamese-700-normal-DlLaEgI2.woff2","assets/inter-vietnamese-800-normal-Cm7tD1pz.woff2","assets/module-FyiQwcn6.js","assets/pseudo-Bhiejwus.js","assets/web-BOuIfH8c.js","assets/web-BXoY-QEn.js","assets/web-CBKU_H3p.js","assets/web-CbUSD5xn.js","assets/web-CjO06zKg.js","assets/web-DYYyVMN3.js","assets/web-Dco5cvKV.js","icon-192.png","icon.svg","index.html","manifest.webmanifest"],"langs":{"ar":["assets/ar-CDYBajCI.js","assets/ar-DjRnMDYa.js"],"de":["assets/de-BrQcDN60.js","assets/de-Dd6IZJpn.js"],"es":["assets/es-BEYK3z5D.js","assets/es-CwG9vazj.js"],"fr":["assets/fr-CMeN3sS4.js","assets/fr-WysOD4Ls.js"],"id":["assets/id-CPbDaJuQ.js","assets/id-l9BWstnh.js"],"it":["assets/it-BrVxPBqm.js","assets/it-CaNDOgkD.js"],"ja":["assets/ja-BAow0uq_.js","assets/ja-rEeWV_4N.js"],"ko":["assets/ko-Gl-YtUeH.js","assets/ko-q6AWk8-D.js"],"pl":["assets/pl-1J_DHO46.js","assets/pl-UoyFTE1n.js"],"pt-BR":["assets/pt-BR-6ktZ5c6U.js","assets/pt-BR-Cug20QUq.js"],"ru":["assets/ru-BqQfsjOQ.js","assets/ru-ZgtR1TbL.js"],"tr":["assets/tr-CLW0mpGs.js","assets/tr-MCE0FWLo.js"],"vi":["assets/vi-Dnh6hQ_r.js","assets/vi-HzU7YT_r.js"],"zh-CN":["assets/zh-CN-BlLLRuWS.js","assets/zh-CN-TqehEUlg.js"]}};
const PREFIX = 'parti-sw:' + CFG.name + ':';
const CACHE = PREFIX + CFG.version;
const SCOPE = new URL('./', self.location.href).href;
const NAV_TIMEOUT_MS = 4000;
// Vite puts an 8-character content hash before the extension of every chunk and asset it names
const HASHED = /-[A-Za-z0-9_-]{8}\.[a-z0-9]+$/;

const url = (p) => new URL(p, SCOPE).href;
const own = (u) => u.origin === self.location.origin && u.href.startsWith(SCOPE);
const storable = (res) => res && res.status === 200 && res.type === 'basic' && !res.redirected;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        // immutable files may come from the HTTP cache (the page just loaded them); the rest is fetched fresh
        await cache.addAll(CFG.core.map((p) => new Request(url(p), { cache: HASHED.test(p) ? 'default' : 'reload' })));
      } catch (e) {
        // never leave a half-filled cache behind: the old worker keeps serving and the next visit tries again
        await caches.delete(CACHE);
        throw e;
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const mine = (await caches.keys()).filter((k) => k.startsWith(PREFIX)).sort();
      const keep = new Set([CACHE, ...mine.filter((k) => k !== CACHE).slice(-1)]);
      await Promise.all(mine.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const u = new URL(req.url);
  if (!own(u) || u.href === url('sw.js')) return;
  event.respondWith(req.mode === 'navigate' ? page(event, u) : asset(event, u));
});

self.addEventListener('message', (event) => {
  const d = event.data;
  if (!d || d.type !== 'warm' || typeof d.lang !== 'string' || !/^[A-Za-z]{2,3}(-[A-Za-z]{2,4})?$/.test(d.lang)) return;
  event.waitUntil(warm([d.lang, 'en']));
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('slow network')), ms));
}

async function page(event, u) {
  const cache = await caches.open(CACHE);
  const shellUrl = url('index.html');
  const isShell = u.pathname === new URL(SCOPE).pathname || u.href.split(/[?#]/)[0] === shellUrl;
  try {
    const res = await Promise.race([fetch(event.request), timeout(NAV_TIMEOUT_MS)]);
    // the newest shell is what an offline start will show (every ?r=CODE variant is the same page)
    if (isShell && storable(res)) event.waitUntil(cache.put(shellUrl, res.clone()));
    return res;
  } catch (e) {
    const hit = (await cache.match(event.request, { ignoreSearch: true })) || (isShell ? (await cache.match(shellUrl)) || (await caches.match(shellUrl)) : undefined);
    if (hit) return hit;
    // slow, not offline: waiting for the real answer is still better than an error page
    try {
      return await fetch(event.request);
    } catch (e2) {
      return Response.error();
    }
  }
}

async function asset(event, u) {
  const req = event.request;
  const cache = await caches.open(CACHE);
  // an older version's cache still holds the files an older tab asks for
  const hit = (await cache.match(req)) || (await caches.match(req));
  if (hit && HASHED.test(u.pathname)) return hit;
  const fresh = fetch(req).then((res) => {
    if (storable(res)) event.waitUntil(cache.put(req, res.clone()));
    return res;
  });
  if (hit) {
    event.waitUntil(fresh.catch(() => undefined));
    return hit;
  }
  try {
    return await fresh;
  } catch (e) {
    return Response.error();
  }
}

async function warm(langs) {
  const cache = await caches.open(CACHE);
  const files = new Set();
  for (const l of langs) if (Object.prototype.hasOwnProperty.call(CFG.langs, l) && Array.isArray(CFG.langs[l])) for (const f of CFG.langs[l]) files.add(f);
  await Promise.all(
    [...files].map(async (f) => {
      const req = new Request(url(f));
      if (await cache.match(req)) return;
      try {
        const res = await fetch(req);
        if (storable(res)) await cache.put(req, res);
      } catch (e) {
        /* offline: the next visit warms it */
      }
    }),
  );
}
