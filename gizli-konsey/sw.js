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

const CFG = {"name":"gizli-konsey","version":"0tocdvz-8361272565","core":["art/achievements/ach-clean-record.webp","art/achievements/ach-exile.webp","art/achievements/ach-fifty.webp","art/achievements/ach-first-session.webp","art/achievements/ach-found-seer.webp","art/achievements/ach-three-missions.webp","art/bg/bg-council.webp","art/bg/bg-last-strike.webp","art/bg/bg-lobby.webp","art/bg/bg-mission.webp","art/bg/end-loyal.webp","art/bg/end-plotter.webp","art/bg/tv-board.webp","art/brand/emblem.webp","art/cardbacks/cardback-default.webp","art/cardbacks/cardback-harbour-night.webp","art/cards/decree-loyal.webp","art/cards/decree-plotter.webp","art/cards/mission-sabotage.webp","art/cards/mission-success.webp","art/cards/vote-no.webp","art/cards/vote-yes.webp","art/events/event-lantern-festival.webp","art/frames/frame-council.webp","art/frames/frame-laurel.webp","art/frames/frame-raven.webp","art/frames/frame-rope.webp","art/frames/frame-wax-seal.webp","art/meta/chest-closed.webp","art/meta/chest-open.webp","art/meta/coin-pile.webp","art/meta/coin.webp","art/meta/level-up.webp","art/meta/streak-flame.webp","art/meta/xp.webp","art/modes/mode-council.webp","art/modes/mode-mission.webp","art/powers/power-exile.webp","art/powers/power-investigate.webp","art/powers/power-peek.webp","art/powers/power-special-election.webp","art/powers/power-veto.webp","art/quests/quest-decree.webp","art/quests/quest-mission.webp","art/quests/quest-play.webp","art/quests/quest-unmask.webp","art/roles/role-informant.webp","art/roles/role-loyal.webp","art/roles/role-masked.webp","art/roles/role-plotter.webp","art/roles/role-ringleader.webp","art/roles/role-seer.webp","art/shop/no-ads-card.webp","art/shop/pack-ember.webp","art/shop/pack-harbor.webp","art/shop/pack-moss.webp","art/shop/pack-special-roles.webp","art/shop/pro-card.webp","art/teams/crest-loyal.webp","art/teams/crest-plotter.webp","art/themes/theme-ember.webp","art/thumbs/cardbacks/cardback-default.webp","art/thumbs/cardbacks/cardback-gold-leaf.webp","art/thumbs/cardbacks/cardback-harbour-night.webp","art/thumbs/cardbacks/cardback-ink-map.webp","art/thumbs/cardbacks/cardback-red-damask.webp","art/thumbs/themes/theme-ember.webp","art/thumbs/themes/theme-harbor.webp","art/thumbs/themes/theme-moss.webp","art/titles/title-clerk.webp","art/titles/title-guardian.webp","art/titles/title-master.webp","art/titles/title-schemer.webp","art/tokens/token-captain.webp","art/tokens/token-deputy.webp","art/tokens/token-president.webp","assets/SingleFlow-CHeptfpz.js","assets/alegreya-sans-cyrillic-400-italic-BfxaBkav.woff2","assets/alegreya-sans-cyrillic-400-normal-CFUoBDld.woff2","assets/alegreya-sans-cyrillic-500-normal-kQHBM3cE.woff2","assets/alegreya-sans-cyrillic-700-italic-gW2Ijdbu.woff2","assets/alegreya-sans-cyrillic-700-normal-BMO00Gdb.woff2","assets/alegreya-sans-cyrillic-800-normal-D2Jsre_s.woff2","assets/alegreya-sans-latin-400-italic-rmlAbObI.woff2","assets/alegreya-sans-latin-400-normal-DtLlO8BS.woff2","assets/alegreya-sans-latin-500-normal-DS713u5J.woff2","assets/alegreya-sans-latin-700-italic-CQiE3p2B.woff2","assets/alegreya-sans-latin-700-normal-DEbcy2sF.woff2","assets/alegreya-sans-latin-800-normal-CpHsWMQ0.woff2","assets/alegreya-sans-latin-ext-400-italic-DX574ivH.woff2","assets/alegreya-sans-latin-ext-400-normal-D7N6b6bd.woff2","assets/alegreya-sans-latin-ext-500-normal-TH5u60nj.woff2","assets/alegreya-sans-latin-ext-700-italic-zm1Jx2ZQ.woff2","assets/alegreya-sans-latin-ext-700-normal-HuHd3-Mg.woff2","assets/alegreya-sans-latin-ext-800-normal-BBRJ-mcX.woff2","assets/alegreya-sans-vietnamese-400-italic-DWlx-poF.woff2","assets/alegreya-sans-vietnamese-400-normal-D7fwYHgb.woff2","assets/alegreya-sans-vietnamese-500-normal-CFLbXWhL.woff2","assets/alegreya-sans-vietnamese-700-italic-Dmd7my35.woff2","assets/alegreya-sans-vietnamese-700-normal-CHYTK2w7.woff2","assets/alegreya-sans-vietnamese-800-normal-BW-pKOU0.woff2","assets/cinzel-latin-600-normal-Dd5YO2UX.woff2","assets/cinzel-latin-700-normal-Dkw14w9r.woff2","assets/cinzel-latin-ext-600-normal-BEFdM_VE.woff2","assets/cinzel-latin-ext-700-normal-C24KFjuG.woff2","assets/esm-CpUbLRxg.js","assets/esm-CsCqIfsP.js","assets/index-DDoA4ord.css","assets/index-DURNj1Gr.js","assets/inter-cyrillic-400-normal-obahsSVq.woff2","assets/inter-cyrillic-600-normal-CWCymEST.woff2","assets/inter-cyrillic-700-normal-CjBOestx.woff2","assets/inter-cyrillic-800-normal-C7MGvYyJ.woff2","assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2","assets/inter-cyrillic-ext-600-normal-Dfes3d0z.woff2","assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2","assets/inter-cyrillic-ext-800-normal-BZOjs1Xv.woff2","assets/inter-greek-400-normal-B4URO6DV.woff2","assets/inter-greek-600-normal-plRanbMR.woff2","assets/inter-greek-700-normal-C3JjAnD8.woff2","assets/inter-greek-800-normal-CLIouy3y.woff2","assets/inter-greek-ext-400-normal-DGGRlc-M.woff2","assets/inter-greek-ext-600-normal-DRtmH8MT.woff2","assets/inter-greek-ext-700-normal-qfdV9bQt.woff2","assets/inter-greek-ext-800-normal-B--PVpEC.woff2","assets/inter-latin-400-normal-C38fXH4l.woff2","assets/inter-latin-600-normal-LgqL8muc.woff2","assets/inter-latin-700-normal-Yt3aPRUw.woff2","assets/inter-latin-800-normal-BYj_oED-.woff2","assets/inter-latin-ext-400-normal-C1nco2VV.woff2","assets/inter-latin-ext-600-normal-D2bJ5OIk.woff2","assets/inter-latin-ext-700-normal-Ca8adRJv.woff2","assets/inter-latin-ext-800-normal-DZJjya6U.woff2","assets/inter-vietnamese-400-normal-DMkecbls.woff2","assets/inter-vietnamese-600-normal-Cc8MFFhd.woff2","assets/inter-vietnamese-700-normal-DlLaEgI2.woff2","assets/inter-vietnamese-800-normal-Cm7tD1pz.woff2","assets/light_01-CQEEvUkU.webp","assets/module-FyiQwcn6.js","assets/pseudo-Bhiejwus.js","assets/smoke_04-1W_mIH8j.webp","assets/web-BeJuuJYs.js","assets/web-Bl5HMnlH.js","assets/web-DPPIV1im.js","assets/web-DdeLzVR9.js","assets/web-IirRW_r3.js","assets/web-tGz2ACAx.js","assets/web-u9NQSVoo.js","icon-192.png","icon.svg","index.html","manifest.webmanifest","sfx/alarm.mp3","sfx/coin.mp3","sfx/confirm.mp3","sfx/flip.mp3","sfx/levelup.mp3","sfx/lose.mp3","sfx/pop.mp3","sfx/reveal.mp3","sfx/select.mp3","sfx/tap.mp3","sfx/tick.mp3","sfx/vote.mp3","sfx/win.mp3"],"langs":{"ar":["assets/ar-BS8wz6wi.js","assets/ar-CylTFSRL.js","assets/ar-DLnm8bL3.js"],"de":["assets/de-C-vtMhFi.js","assets/de-CqKkRsBp.js","assets/de-D5k-W1z8.js"],"es":["assets/es-COWf47D1.js","assets/es-DlmFPM1n.js","assets/es-W9YVpPmo.js"],"fr":["assets/fr--Yite34r.js","assets/fr-CRl2q80m.js","assets/fr-HjB6QXy8.js"],"id":["assets/id-C1dDaNmK.js","assets/id-CMTh4leP.js","assets/id-DUqTNKcp.js"],"it":["assets/it-BaAjEvtk.js","assets/it-CC51gIom.js","assets/it-Dlik--lr.js"],"ja":["assets/ja-CEsNklk3.js","assets/ja-DF7tNMZ4.js","assets/ja-xmywIQkW.js"],"ko":["assets/ko-7IU882_L.js","assets/ko-CXZHuXFq.js","assets/ko-D-GZPMuk.js"],"pl":["assets/pl-BLDSKB_4.js","assets/pl-BktLLObn.js","assets/pl-DqsD9y34.js"],"pt-BR":["assets/pt-BR-1puE08Xv.js","assets/pt-BR-CoE_yVl2.js","assets/pt-BR-DQs6DWUu.js"],"ru":["assets/ru-BwA2Mmp3.js","assets/ru-CDEEbjN0.js","assets/ru-CZFX4Nhz.js"],"tr":["assets/tr-C8BmKXTm.js","assets/tr-DIt0LzjG.js","assets/tr-a4hfOoKm.js"],"vi":["assets/vi-BELyeVqW.js","assets/vi-Bpuoyx8V.js","assets/vi-x25wVWLm.js"],"zh-CN":["assets/zh-CN-AIlyvtQN.js","assets/zh-CN-BQMAgTHp.js","assets/zh-CN-oHLjIst-.js"]}};
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
