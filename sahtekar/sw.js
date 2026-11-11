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

const CFG = {"name":"sahtekar","version":"0tocdvw-76493888f3","core":["art/achievements/ach-fifty.webp","art/achievements/ach-first-catch.webp","art/achievements/ach-first-game.webp","art/achievements/ach-invisible.webp","art/achievements/ach-last-chance.webp","art/achievements/ach-location.webp","art/bg/bg-lobby.webp","art/bg/bg-talk.webp","art/bg/bg-vote.webp","art/bg/end-civilians.webp","art/bg/end-impostor.webp","art/bg/tv-table.webp","art/brand/emblem.webp","art/cardbacks/cardback-city-lights.webp","art/cardbacks/cardback-default.webp","art/cardbacks/cardback-fingerprint.webp","art/cardbacks/cardback-grid.webp","art/cardbacks/cardback-lightning.webp","art/categories/cat-animals.webp","art/categories/cat-ar-matbakh.webp","art/categories/cat-clothes.webp","art/categories/cat-custom.webp","art/categories/cat-de-kueche.webp","art/categories/cat-en-daily.webp","art/categories/cat-en-party.webp","art/categories/cat-es-cocina.webp","art/categories/cat-food.webp","art/categories/cat-fr-cuisine.webp","art/categories/cat-fun.webp","art/categories/cat-home.webp","art/categories/cat-id-sehari.webp","art/categories/cat-it-cucina.webp","art/categories/cat-ja-nichijou.webp","art/categories/cat-jobs.webp","art/categories/cat-ko-ilsang.webp","art/categories/cat-nature.webp","art/categories/cat-objects.webp","art/categories/cat-pl-kuchnia.webp","art/categories/cat-places.webp","art/categories/cat-pt-br-cotidiano.webp","art/categories/cat-ru-byt.webp","art/categories/cat-school.webp","art/categories/cat-sports.webp","art/categories/cat-tr-futbol.webp","art/categories/cat-tr-gelenek.webp","art/categories/cat-tr-mutfak.webp","art/categories/cat-tr-sehirler.webp","art/categories/cat-transport.webp","art/categories/cat-vi-amthuc.webp","art/categories/cat-zh-cn-richang.webp","art/events/event-night-ops.webp","art/frames/frame-fingerprint.webp","art/frames/frame-laser.webp","art/frames/frame-lightning.webp","art/frames/frame-pink-neon.webp","art/frames/frame-top-agent.webp","art/meta/chest-closed.webp","art/meta/chest-open.webp","art/meta/coin-pile.webp","art/meta/coin.webp","art/meta/level-up.webp","art/meta/streak-flame.webp","art/meta/xp.webp","art/modes/mode-klasik.webp","art/modes/mode-konum.webp","art/modes/mode-tuhaf.webp","art/modes/mode-yakin.webp","art/quests/quest-catch.webp","art/quests/quest-clue.webp","art/quests/quest-escape.webp","art/quests/quest-play.webp","art/roles/role-blank.webp","art/roles/role-civilian.webp","art/roles/role-impostor.webp","art/roles/role-shadow.webp","art/shop/no-ads-card.webp","art/shop/pack-agent.webp","art/shop/pack-arcade.webp","art/shop/pack-carnival.webp","art/shop/pro-card.webp","art/shop/shop-hero.webp","art/themes/theme-carnival.webp","art/themes/theme-hideout.webp","art/thumbs/cardbacks/cardback-city-lights.webp","art/thumbs/cardbacks/cardback-default.webp","art/thumbs/cardbacks/cardback-fingerprint.webp","art/thumbs/cardbacks/cardback-grid.webp","art/thumbs/cardbacks/cardback-lightning.webp","art/thumbs/themes/theme-arcade.webp","art/thumbs/themes/theme-carnival.webp","art/thumbs/themes/theme-hideout.webp","art/titles/title-detective.webp","art/titles/title-master-liar.webp","art/titles/title-rookie.webp","art/titles/title-sharp-ear.webp","assets/SingleFlow-DZOcPByp.js","assets/bungee-latin-400-normal-Dfnurram.woff2","assets/bungee-latin-ext-400-normal-DWzJMwsA.woff2","assets/bungee-vietnamese-400-normal-B6gKbkHm.woff2","assets/esm-1ijFeEjq.js","assets/esm-BLsc1aaw.js","assets/index-DqzWDhax.js","assets/index-ePkv0uK_.css","assets/inter-cyrillic-400-normal-obahsSVq.woff2","assets/inter-cyrillic-600-normal-CWCymEST.woff2","assets/inter-cyrillic-700-normal-CjBOestx.woff2","assets/inter-cyrillic-800-normal-C7MGvYyJ.woff2","assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2","assets/inter-cyrillic-ext-600-normal-Dfes3d0z.woff2","assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2","assets/inter-cyrillic-ext-800-normal-BZOjs1Xv.woff2","assets/inter-greek-400-normal-B4URO6DV.woff2","assets/inter-greek-600-normal-plRanbMR.woff2","assets/inter-greek-700-normal-C3JjAnD8.woff2","assets/inter-greek-800-normal-CLIouy3y.woff2","assets/inter-greek-ext-400-normal-DGGRlc-M.woff2","assets/inter-greek-ext-600-normal-DRtmH8MT.woff2","assets/inter-greek-ext-700-normal-qfdV9bQt.woff2","assets/inter-greek-ext-800-normal-B--PVpEC.woff2","assets/inter-latin-400-normal-C38fXH4l.woff2","assets/inter-latin-600-normal-LgqL8muc.woff2","assets/inter-latin-700-normal-Yt3aPRUw.woff2","assets/inter-latin-800-normal-BYj_oED-.woff2","assets/inter-latin-ext-400-normal-C1nco2VV.woff2","assets/inter-latin-ext-600-normal-D2bJ5OIk.woff2","assets/inter-latin-ext-700-normal-Ca8adRJv.woff2","assets/inter-latin-ext-800-normal-DZJjya6U.woff2","assets/inter-vietnamese-400-normal-DMkecbls.woff2","assets/inter-vietnamese-600-normal-Cc8MFFhd.woff2","assets/inter-vietnamese-700-normal-DlLaEgI2.woff2","assets/inter-vietnamese-800-normal-Cm7tD1pz.woff2","assets/kategoriler-C0rQ7zof.js","assets/kavramlar-2as1_Y2u.js","assets/konumlar-B4_OK7jU.js","assets/light_01-CQEEvUkU.webp","assets/module-FyiQwcn6.js","assets/rubik-cyrillic-400-normal-C5G8_8ug.woff2","assets/rubik-cyrillic-500-normal-Didq2w9O.woff2","assets/rubik-cyrillic-600-normal-AdySaCq0.woff2","assets/rubik-cyrillic-700-normal-DFnztZBh.woff2","assets/rubik-cyrillic-800-normal-wonQiwhm.woff2","assets/rubik-latin-400-normal-j0pmKyiQ.woff2","assets/rubik-latin-500-normal-1os41rQk.woff2","assets/rubik-latin-600-normal-7iWW07_k.woff2","assets/rubik-latin-700-normal-D-tMm-eS.woff2","assets/rubik-latin-800-normal-BtaGuVpR.woff2","assets/rubik-latin-ext-400-normal-BtzQ7olK.woff2","assets/rubik-latin-ext-500-normal-CKoAoPpD.woff2","assets/rubik-latin-ext-600-normal-DPvxRCiz.woff2","assets/rubik-latin-ext-700-normal-D5I4eEgK.woff2","assets/rubik-latin-ext-800-normal-C-Q65BvC.woff2","assets/smoke_04-1W_mIH8j.webp","assets/web-4pVJFJuk.js","assets/web-BN3C_uRx.js","assets/web-BpPSB4tZ.js","assets/web-C5ufm_l3.js","assets/web-CaxsWf8m.js","assets/web-DOtqTzv6.js","assets/web-If_3ZiGu.js","icon-192.png","icon-512.png","icon.svg","index.html","manifest.webmanifest","sfx/alarm.mp3","sfx/coin.mp3","sfx/confirm.mp3","sfx/flip.mp3","sfx/levelup.mp3","sfx/lose.mp3","sfx/pop.mp3","sfx/reveal.mp3","sfx/select.mp3","sfx/tap.mp3","sfx/tick.mp3","sfx/vote.mp3","sfx/win.mp3"],"langs":{"vi":["assets/amthuc-Bj_U0u5-.js","assets/kavramlar-DBBTFSRA.js","assets/konumlar-BKgq8zAg.js","assets/tuhaf-sorular-BGrPwcPV.js","assets/vi-B6lHhoIj.js","assets/vi-CfTKZKTa.js","assets/vi-x25wVWLm.js","assets/yakin-ciftler-CSRBMDnq.js"],"ar":["assets/ar-BS8wz6wi.js","assets/ar-BmJIz15i.js","assets/ar-XuB0DWZ1.js","assets/kavramlar-C38S9uM3.js","assets/konumlar-C18dpuTL.js","assets/matbakh-BL0MAJ5O.js","assets/tuhaf-sorular-DXvkaItx.js","assets/yakin-ciftler-DCQhrx91.js"],"ru":["assets/byt-Ahl8G0A1.js","assets/kavramlar-B28v3fBZ.js","assets/konumlar-tfSL-Yxf.js","assets/ru-BWnV1tug.js","assets/ru-CDEEbjN0.js","assets/ru-Cs_WsyV4.js","assets/tuhaf-sorular-DE0xGYtR.js","assets/yakin-ciftler-DzyICgX0.js"],"es":["assets/cocina-BobqdYim.js","assets/es-BbBgT2Fb.js","assets/es-Bl-GhR2n.js","assets/es-COWf47D1.js","assets/kavramlar-BwVAEltV.js","assets/konumlar-ALg4Ltc8.js","assets/tuhaf-sorular-Bxrnzd0H.js","assets/yakin-ciftler-ZQNHMWMR.js"],"pt-BR":["assets/cotidiano-2KPoNLl6.js","assets/kavramlar-DUeHt4LI.js","assets/konumlar-C7QZj3a2.js","assets/pt-BR-1puE08Xv.js","assets/pt-BR-B1_vOcqS.js","assets/pt-BR-CuH4sumE.js","assets/tuhaf-sorular-BDhwjG-S.js","assets/yakin-ciftler-Bw2QQWjg.js"],"it":["assets/cucina-BXZwiwrT.js","assets/it-Dlik--lr.js","assets/it-DvwBY7oi.js","assets/it-mPRQR4F3.js","assets/kavramlar-DlqYm_-9.js","assets/konumlar-COYkePBP.js","assets/tuhaf-sorular-B51aABvJ.js","assets/yakin-ciftler-DSO3TLfX.js"],"fr":["assets/cuisine-DTilfktU.js","assets/fr-AzxZR2f4.js","assets/fr-BtZDBk6J.js","assets/fr-CRl2q80m.js","assets/kavramlar-ddnSUjqz.js","assets/konumlar-DQan1Dbu.js","assets/tuhaf-sorular-DpAUwNzh.js","assets/yakin-ciftler-DeS1n-TA.js"],"en":["assets/daily-BR2KXcFs.js","assets/kavramlar-B6LoJ87X.js","assets/konumlar-DASLREmO.js","assets/party-8ucS5Uuv.js","assets/tuhaf-sorular-BJ2Pup3J.js","assets/yakin-ciftler-DBqPyAGL.js"],"de":["assets/de-C9WymsTK.js","assets/de-CqKkRsBp.js","assets/de-HofCAt_4.js","assets/kavramlar-Bq_IOGdq.js","assets/konumlar-BY52xuuC.js","assets/kueche-BiAen_Ys.js","assets/tuhaf-sorular-npuJEn1c.js","assets/yakin-ciftler-DQqCnvCy.js"],"tr":["assets/futbol-wK-dJOV3.js","assets/gelenek-DmHachwW.js","assets/kavramlar-BdODSelB.js","assets/konumlar-Bvpcp7Su.js","assets/mutfak-Jzq3s2DM.js","assets/sehirler-Dpe9hM9E.js","assets/tr-2Bmd5Rnl.js","assets/tr-BIeFxyxn.js","assets/tr-DIt0LzjG.js","assets/tuhaf-sorular-Daq8Zrvo.js","assets/yakin-ciftler-CwWs2tFW.js"],"id":["assets/id-BOZvBaIA.js","assets/id-BodJw0Lb.js","assets/id-CMTh4leP.js","assets/kavramlar-BwuR9q2g.js","assets/konumlar-0tJ9f61u.js","assets/sehari-BRj5uev6.js","assets/tuhaf-sorular-BWpMZflI.js","assets/yakin-ciftler-KBiHe3m7.js"],"ko":["assets/ilsang-BGtC53mO.js","assets/kavramlar-DN5sO5Oi.js","assets/ko-BkH8_Kdu.js","assets/ko-D-GZPMuk.js","assets/ko-DktqARa-.js","assets/konumlar-BWKw0vMK.js","assets/tuhaf-sorular-DWNEZ72A.js","assets/yakin-ciftler-C2nLZ5pV.js"],"ja":["assets/ja-DLANtOYX.js","assets/ja-didH-DJP.js","assets/ja-xmywIQkW.js","assets/kavramlar-Ch3uMdxH.js","assets/konumlar-lz_DwDNq.js","assets/nichijou-e4UMKdjI.js","assets/tuhaf-sorular-CFrSG5PH.js","assets/yakin-ciftler-BLpN-FrQ.js"],"pl":["assets/kavramlar-CrUIPxod.js","assets/konumlar-Cyvg4_pY.js","assets/kuchnia-BwAjEt1a.js","assets/pl-4vp2djnQ.js","assets/pl-BktLLObn.js","assets/pl-C3I2VXzR.js","assets/tuhaf-sorular-7QVxTkqt.js","assets/yakin-ciftler-hdPI5yTh.js"],"zh-CN":["assets/kavramlar-NCSGnZvz.js","assets/konumlar-CZ7Ftlma.js","assets/richang-BPJws7As.js","assets/tuhaf-sorular-CCJ1yWXW.js","assets/yakin-ciftler-CW5gm7Gg.js","assets/zh-CN-7Zn_Jnhn.js","assets/zh-CN-BQMAgTHp.js","assets/zh-CN-B_uQx3mZ.js"]}};
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
