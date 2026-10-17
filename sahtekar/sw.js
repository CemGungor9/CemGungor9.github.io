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

const CFG = {"name":"sahtekar","version":"0tn142h-d7e1751f5d","core":["assets/SingleFlow-Dp603RaJ.js","assets/esm-BDzmbUYH.js","assets/esm-CmdL_G-v.js","assets/index-DLBrvCh4.css","assets/index-mIRZAzeF.js","assets/inter-cyrillic-400-normal-obahsSVq.woff2","assets/inter-cyrillic-600-normal-CWCymEST.woff2","assets/inter-cyrillic-700-normal-CjBOestx.woff2","assets/inter-cyrillic-800-normal-C7MGvYyJ.woff2","assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2","assets/inter-cyrillic-ext-600-normal-Dfes3d0z.woff2","assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2","assets/inter-cyrillic-ext-800-normal-BZOjs1Xv.woff2","assets/inter-greek-400-normal-B4URO6DV.woff2","assets/inter-greek-600-normal-plRanbMR.woff2","assets/inter-greek-700-normal-C3JjAnD8.woff2","assets/inter-greek-800-normal-CLIouy3y.woff2","assets/inter-greek-ext-400-normal-DGGRlc-M.woff2","assets/inter-greek-ext-600-normal-DRtmH8MT.woff2","assets/inter-greek-ext-700-normal-qfdV9bQt.woff2","assets/inter-greek-ext-800-normal-B--PVpEC.woff2","assets/inter-latin-400-normal-C38fXH4l.woff2","assets/inter-latin-600-normal-LgqL8muc.woff2","assets/inter-latin-700-normal-Yt3aPRUw.woff2","assets/inter-latin-800-normal-BYj_oED-.woff2","assets/inter-latin-ext-400-normal-C1nco2VV.woff2","assets/inter-latin-ext-600-normal-D2bJ5OIk.woff2","assets/inter-latin-ext-700-normal-Ca8adRJv.woff2","assets/inter-latin-ext-800-normal-DZJjya6U.woff2","assets/inter-vietnamese-400-normal-DMkecbls.woff2","assets/inter-vietnamese-600-normal-Cc8MFFhd.woff2","assets/inter-vietnamese-700-normal-DlLaEgI2.woff2","assets/inter-vietnamese-800-normal-Cm7tD1pz.woff2","assets/kategoriler-C0rQ7zof.js","assets/kavramlar-2as1_Y2u.js","assets/konumlar-B4_OK7jU.js","assets/module-FyiQwcn6.js","assets/web-8LOxdDNW.js","assets/web-B1dWSTtY.js","assets/web-B6xbN3Sn.js","assets/web-CVtnmMNN.js","assets/web-DGGIl63c.js","assets/web-DbXJWzFe.js","assets/web-RjR59Azi.js","icon-192.png","icon-512.png","icon.svg","index.html","manifest.webmanifest"],"langs":{"vi":["assets/amthuc-Bj_U0u5-.js","assets/kavramlar-DBBTFSRA.js","assets/konumlar-BKgq8zAg.js","assets/tuhaf-sorular-BGrPwcPV.js","assets/vi-Br-WCFYH.js","assets/vi-HzU7YT_r.js","assets/yakin-ciftler-CSRBMDnq.js"],"ar":["assets/ar-DjRnMDYa.js","assets/ar-_mNLEzlf.js","assets/kavramlar-C38S9uM3.js","assets/konumlar-C18dpuTL.js","assets/matbakh-BL0MAJ5O.js","assets/tuhaf-sorular-DXvkaItx.js","assets/yakin-ciftler-DCQhrx91.js"],"ru":["assets/byt-Ahl8G0A1.js","assets/kavramlar-B28v3fBZ.js","assets/konumlar-tfSL-Yxf.js","assets/ru-BCuas9xX.js","assets/ru-BqQfsjOQ.js","assets/tuhaf-sorular-DE0xGYtR.js","assets/yakin-ciftler-DzyICgX0.js"],"es":["assets/cocina-BobqdYim.js","assets/es-BEYK3z5D.js","assets/es-CRXy1CeA.js","assets/kavramlar-BwVAEltV.js","assets/konumlar-ALg4Ltc8.js","assets/tuhaf-sorular-Bxrnzd0H.js","assets/yakin-ciftler-ZQNHMWMR.js"],"pt-BR":["assets/cotidiano-2KPoNLl6.js","assets/kavramlar-DUeHt4LI.js","assets/konumlar-C7QZj3a2.js","assets/pt-BR-6ktZ5c6U.js","assets/pt-BR-CV01Ml2K.js","assets/tuhaf-sorular-BDhwjG-S.js","assets/yakin-ciftler-Bw2QQWjg.js"],"it":["assets/cucina-BXZwiwrT.js","assets/it-B88Bs3kH.js","assets/it-CaNDOgkD.js","assets/kavramlar-DlqYm_-9.js","assets/konumlar-COYkePBP.js","assets/tuhaf-sorular-B51aABvJ.js","assets/yakin-ciftler-DSO3TLfX.js"],"fr":["assets/cuisine-DTilfktU.js","assets/fr-BKzgExMj.js","assets/fr-CMeN3sS4.js","assets/kavramlar-ddnSUjqz.js","assets/konumlar-DQan1Dbu.js","assets/tuhaf-sorular-DpAUwNzh.js","assets/yakin-ciftler-DeS1n-TA.js"],"en":["assets/daily-BR2KXcFs.js","assets/kavramlar-B6LoJ87X.js","assets/konumlar-DASLREmO.js","assets/party-8ucS5Uuv.js","assets/tuhaf-sorular-BJ2Pup3J.js","assets/yakin-ciftler-DBqPyAGL.js"],"de":["assets/de-BrQcDN60.js","assets/de-DJeS9S7m.js","assets/kavramlar-Bq_IOGdq.js","assets/konumlar-BY52xuuC.js","assets/kueche-BiAen_Ys.js","assets/tuhaf-sorular-npuJEn1c.js","assets/yakin-ciftler-DQqCnvCy.js"],"tr":["assets/futbol-wK-dJOV3.js","assets/gelenek-DmHachwW.js","assets/kavramlar-BdODSelB.js","assets/konumlar-Bvpcp7Su.js","assets/mutfak-Jzq3s2DM.js","assets/sehirler-Dpe9hM9E.js","assets/tr-CLW0mpGs.js","assets/tr-U5w-CgKO.js","assets/tuhaf-sorular-Daq8Zrvo.js","assets/yakin-ciftler-CwWs2tFW.js"],"id":["assets/id-DYG_EXnY.js","assets/id-l9BWstnh.js","assets/kavramlar-BwuR9q2g.js","assets/konumlar-0tJ9f61u.js","assets/sehari-BRj5uev6.js","assets/tuhaf-sorular-BWpMZflI.js","assets/yakin-ciftler-KBiHe3m7.js"],"ko":["assets/ilsang-BGtC53mO.js","assets/kavramlar-DN5sO5Oi.js","assets/ko-DIXwFp2e.js","assets/ko-q6AWk8-D.js","assets/konumlar-BWKw0vMK.js","assets/tuhaf-sorular-DWNEZ72A.js","assets/yakin-ciftler-C2nLZ5pV.js"],"ja":["assets/ja-BAow0uq_.js","assets/ja-BtRFBrlz.js","assets/kavramlar-Ch3uMdxH.js","assets/konumlar-lz_DwDNq.js","assets/nichijou-e4UMKdjI.js","assets/tuhaf-sorular-CFrSG5PH.js","assets/yakin-ciftler-BLpN-FrQ.js"],"pl":["assets/kavramlar-CrUIPxod.js","assets/konumlar-Cyvg4_pY.js","assets/kuchnia-BwAjEt1a.js","assets/pl-CHmWQ4Hv.js","assets/pl-UoyFTE1n.js","assets/tuhaf-sorular-7QVxTkqt.js","assets/yakin-ciftler-hdPI5yTh.js"],"zh-CN":["assets/kavramlar-NCSGnZvz.js","assets/konumlar-CZ7Ftlma.js","assets/richang-BPJws7As.js","assets/tuhaf-sorular-CCJ1yWXW.js","assets/yakin-ciftler-CW5gm7Gg.js","assets/zh-CN-BjtZqAqB.js","assets/zh-CN-BlLLRuWS.js"]}};
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
