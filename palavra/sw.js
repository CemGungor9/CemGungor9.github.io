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

const CFG = {"name":"palavra","version":"0tocdvy-14ea032a8d","core":["art/achievements/ach-final.webp","art/achievements/ach-first-fool.webp","art/achievements/ach-first-show.webp","art/achievements/ach-fool-all.webp","art/achievements/ach-herd.webp","art/achievements/ach-truth-hunter.webp","art/bg/bg-final.webp","art/bg/bg-lobby.webp","art/bg/bg-pick.webp","art/bg/bg-results.webp","art/bg/bg-reveal.webp","art/bg/bg-write.webp","art/bg/tv-stage.webp","art/brand/emblem.webp","art/cardbacks/cardback-confetti.webp","art/cardbacks/cardback-default.webp","art/cardbacks/cardback-retro-tv.webp","art/cardbacks/cardback-ticket.webp","art/cards/card-black-sheep.webp","art/cards/stamp-funniest.webp","art/cards/stamp-lie.webp","art/cards/stamp-truth.webp","art/decks/deck-bilim.webp","art/decks/deck-custom.webp","art/decks/deck-dil.webp","art/decks/deck-dunya.webp","art/decks/deck-garip.webp","art/decks/deck-hayvanlar.webp","art/decks/deck-icatlar.webp","art/decks/deck-spor.webp","art/decks/deck-tarih.webp","art/decks/deck-turkiye.webp","art/decks/deck-uzay.webp","art/decks/deck-yemek.webp","art/events/event-golden-mic-week.webp","art/frames/frame-marquee.webp","art/frames/frame-sequin.webp","art/frames/frame-stars.webp","art/frames/frame-trophy.webp","art/frames/frame-velvet-rope.webp","art/home/home-hero.webp","art/mascot/host-amazed.webp","art/mascot/host-suspicious.webp","art/mascot/host-welcome.webp","art/meta/chest-closed.webp","art/meta/chest-open.webp","art/meta/coin-pile.webp","art/meta/coin.webp","art/meta/level-up.webp","art/meta/streak-flame.webp","art/meta/xp.webp","art/modes/mode-classic.webp","art/modes/mode-herd.webp","art/modes/mode-knowme.webp","art/modes/mode-mix.webp","art/quests/quest-fool.webp","art/quests/quest-likes.webp","art/quests/quest-play.webp","art/quests/quest-truth.webp","art/shop/no-ads-card.webp","art/shop/pack-beach.webp","art/shop/pack-disco.webp","art/shop/pack-gala.webp","art/shop/pro-card.webp","art/shop/shop-hero.webp","art/themes/theme-beach.webp","art/themes/theme-disco.webp","art/themes/theme-gala.webp","art/thumbs/cardbacks/cardback-confetti.webp","art/thumbs/cardbacks/cardback-default.webp","art/thumbs/cardbacks/cardback-retro-tv.webp","art/thumbs/cardbacks/cardback-sequin.webp","art/thumbs/cardbacks/cardback-ticket.webp","art/thumbs/themes/theme-beach.webp","art/thumbs/themes/theme-disco.webp","art/thumbs/themes/theme-gala.webp","art/titles/title-bluff-master.webp","art/titles/title-champion.webp","art/titles/title-know-it-all.webp","art/titles/title-rookie.webp","assets/SingleFlow-DzD-jV7B.js","assets/esm-ELxHL1Qu.js","assets/esm-rAu77j27.js","assets/index-C77fUjHP.js","assets/index-zZ53qVok.css","assets/inter-cyrillic-400-normal-obahsSVq.woff2","assets/inter-cyrillic-600-normal-CWCymEST.woff2","assets/inter-cyrillic-700-normal-CjBOestx.woff2","assets/inter-cyrillic-800-normal-C7MGvYyJ.woff2","assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2","assets/inter-cyrillic-ext-600-normal-Dfes3d0z.woff2","assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2","assets/inter-cyrillic-ext-800-normal-BZOjs1Xv.woff2","assets/inter-greek-400-normal-B4URO6DV.woff2","assets/inter-greek-600-normal-plRanbMR.woff2","assets/inter-greek-700-normal-C3JjAnD8.woff2","assets/inter-greek-800-normal-CLIouy3y.woff2","assets/inter-greek-ext-400-normal-DGGRlc-M.woff2","assets/inter-greek-ext-600-normal-DRtmH8MT.woff2","assets/inter-greek-ext-700-normal-qfdV9bQt.woff2","assets/inter-greek-ext-800-normal-B--PVpEC.woff2","assets/inter-latin-400-normal-C38fXH4l.woff2","assets/inter-latin-600-normal-LgqL8muc.woff2","assets/inter-latin-700-normal-Yt3aPRUw.woff2","assets/inter-latin-800-normal-BYj_oED-.woff2","assets/inter-latin-ext-400-normal-C1nco2VV.woff2","assets/inter-latin-ext-600-normal-D2bJ5OIk.woff2","assets/inter-latin-ext-700-normal-Ca8adRJv.woff2","assets/inter-latin-ext-800-normal-DZJjya6U.woff2","assets/inter-vietnamese-400-normal-DMkecbls.woff2","assets/inter-vietnamese-600-normal-Cc8MFFhd.woff2","assets/inter-vietnamese-700-normal-DlLaEgI2.woff2","assets/inter-vietnamese-800-normal-Cm7tD1pz.woff2","assets/light_01-CQEEvUkU.webp","assets/module-FyiQwcn6.js","assets/nunito-cyrillic-400-normal-xAOo5cBP.woff2","assets/nunito-cyrillic-600-normal-DJGQ2h05.woff2","assets/nunito-cyrillic-700-normal-DP36NgGt.woff2","assets/nunito-cyrillic-800-normal-D3igD7Kl.woff2","assets/nunito-latin-400-normal-r8SDr6Up.woff2","assets/nunito-latin-600-normal-Br8yIETf.woff2","assets/nunito-latin-700-normal-Dort48En.woff2","assets/nunito-latin-800-normal-Dz8SOQK_.woff2","assets/nunito-latin-ext-400-normal-i-8OOpdj.woff2","assets/nunito-latin-ext-600-normal-Dd9Zuxh1.woff2","assets/nunito-latin-ext-700-normal-BWeMsAzO.woff2","assets/nunito-latin-ext-800-normal-CtU8tJOV.woff2","assets/nunito-vietnamese-400-normal-BHkVbP3T.woff2","assets/nunito-vietnamese-600-normal-BY8O6Cug.woff2","assets/nunito-vietnamese-700-normal-Ch8EUCfz.woff2","assets/nunito-vietnamese-800-normal-D_CZYdm9.woff2","assets/paytone-one-latin-400-normal-CUTjhAbn.woff2","assets/paytone-one-latin-ext-400-normal-3vhx3Voy.woff2","assets/paytone-one-vietnamese-400-normal-3uz3l8e0.woff2","assets/smoke_04-1W_mIH8j.webp","assets/web-BUQDJyEH.js","assets/web-BU_1z3qH.js","assets/web-Bd1Tqs9d.js","assets/web-Bn5dyDDN.js","assets/web-C04G8T2H.js","assets/web-C5uV9utG.js","assets/web-cm52NiOp.js","icon-192.png","icon.svg","index.html","manifest.webmanifest","sfx/alarm.mp3","sfx/coin.mp3","sfx/confirm.mp3","sfx/flip.mp3","sfx/levelup.mp3","sfx/lose.mp3","sfx/pop.mp3","sfx/reveal.mp3","sfx/select.mp3","sfx/tap.mp3","sfx/tick.mp3","sfx/vote.mp3","sfx/win.mp3"],"langs":{"ar":["assets/ar-BQh4iGpH.js","assets/ar-BS8wz6wi.js","assets/ar-BU3szcth.js","assets/ar-CB3f1sD-.js","assets/ar-DMFvgYhk.js","assets/ar-MffVXbBT.js","assets/facts-ar-DaICQ4lq.js"],"de":["assets/de-6qhVhL3J.js","assets/de-BY4QUFRo.js","assets/de-Cpks3R9h.js","assets/de-CqKkRsBp.js","assets/de-DjpUCxAf.js","assets/de-HKHhbpVv.js","assets/facts-de-D8E215RN.js"],"en":["assets/en-C0CpDGl3.js","assets/en-CkcfOlxZ.js","assets/en-Dy0VZZkI.js","assets/facts-en-Bl-2JWtj.js"],"es":["assets/es-0wAgqMbI.js","assets/es-CExktLC_.js","assets/es-CLFO9amz.js","assets/es-COWf47D1.js","assets/es-LwMyShco.js","assets/es-f2GeY7PR.js","assets/facts-es-ciYSW1I9.js"],"fr":["assets/facts-fr-D8UJKv7h.js","assets/fr-BvXzNrW3.js","assets/fr-CABvMMCa.js","assets/fr-CDHBjVuJ.js","assets/fr-CRl2q80m.js","assets/fr-D09-t19G.js","assets/fr-DkunrqjW.js"],"id":["assets/facts-id-DFH6RQLL.js","assets/id-CBjgFvsl.js","assets/id-CMTh4leP.js","assets/id-CnjJJN5o.js","assets/id-DZXd3nuH.js","assets/id-Ds0bwMN0.js","assets/id-FJuMv1ur.js"],"it":["assets/facts-it-mBFzfjSn.js","assets/it-BGf4_cU5.js","assets/it-BQjBU5-5.js","assets/it-CRzHzjja.js","assets/it-CWSukK1A.js","assets/it-Dlik--lr.js","assets/it-DnHr7xZE.js"],"ja":["assets/facts-ja-Sp79hCwU.js","assets/ja-BGJmNBcl.js","assets/ja-C0I_IoTv.js","assets/ja-DR8rpTil.js","assets/ja-DwOPSDQZ.js","assets/ja-QlY1QPUF.js","assets/ja-xmywIQkW.js"],"ko":["assets/facts-ko-DFKmda8H.js","assets/ko-BGEDed9i.js","assets/ko-BYwEh07u.js","assets/ko-C73SvQJw.js","assets/ko-CEEO9xr1.js","assets/ko-CVJpCKGi.js","assets/ko-D-GZPMuk.js"],"pl":["assets/facts-pl-DPuFWExV.js","assets/pl-8gLAQVyH.js","assets/pl-B2o37us-.js","assets/pl-BktLLObn.js","assets/pl-BquT5yMf.js","assets/pl-ETF9EgBO.js","assets/pl-v6Pcg_Xk.js"],"pt-BR":["assets/facts-pt-BR--zanSukG.js","assets/pt-BR-1puE08Xv.js","assets/pt-BR-B7_aY_3w.js","assets/pt-BR-Bfw91f9M.js","assets/pt-BR-ByO0ox5H.js","assets/pt-BR-CDpABttM.js","assets/pt-BR-CRJBkMh9.js"],"ru":["assets/facts-ru-BEvR5tgh.js","assets/ru-BEyVVYfE.js","assets/ru-C5wel5S-.js","assets/ru-CDEEbjN0.js","assets/ru-CNBoCs_z.js","assets/ru-DJkgNo2w.js","assets/ru-DWWnlx71.js"],"tr":["assets/facts-tr-EeV8nzYH.js","assets/tr-BtWHa-XH.js","assets/tr-DIt0LzjG.js","assets/tr-DihWwV2Y.js","assets/tr-DoQNEReT.js","assets/tr-FHnVLIvw.js","assets/tr-zpWJkJ9t.js"],"vi":["assets/facts-vi-Dcrao6yl.js","assets/vi-BFmRiyMS.js","assets/vi-Cg-9Kk7p.js","assets/vi-Cs3Jue3F.js","assets/vi-D9RaLCRm.js","assets/vi-Dv-ocDVX.js","assets/vi-x25wVWLm.js"],"zh-CN":["assets/facts-zh-CN-DrdbQnp_.js","assets/zh-CN-BPqMV9-G.js","assets/zh-CN-BQMAgTHp.js","assets/zh-CN-BbyJs0Gh.js","assets/zh-CN-CBb2ZYMK.js","assets/zh-CN-COBrR83n.js","assets/zh-CN-kCa1Ds_z.js"]}};
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
