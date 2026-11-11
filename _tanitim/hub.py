#!/usr/bin/env python3
"""Builds /oyunlar/ (Turkish) and /oyunlar/en/ (English): one page listing every game.

Run after build.py: python3 _tanitim/hub.py [apartman-icon.png]
Icons are copied from the pages that already exist in this repository.
"""
import html
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://cemgungor9.github.io"
OUT = ROOT / "oyunlar"

# slug, link (site-relative), icon source (repo-relative), TR name, EN name, TR line, EN line, state
# state: "soon" | "web" (playable in the browser) | ("ios", url) | "ios" (live, link not known here)
GROUPS = [
    ("Bulmaca ve strateji", "Puzzle and strategy", [
        ("sancak-blok", "sancak-blok/", "sancak-blok/tanitim/icon.png", "Sancak & Blok", "Sancak & Blok",
         "Mücevher blokları yerleştir, sıraları patlat, kaleni inşa et.", "Place jewel blocks, clear rows and build your castle.", "soon"),
        ("akinci-yolu", "akinci-yolu/", "akinci-yolu/tanitim/icon.png", "Akıncı Yolu", "Trail Tactics: Conquest",
         "Birliklerini yolla, kaleleri ele geçir.", "Send your troops, take the forts.", "soon"),
        ("cay-ocagi", "cay-ocagi/", "cay-ocagi/tanitim/icon.png", "Çay Ocağı", "Tea Time: Café Tycoon",
         "Çay demle, misafirleri ağırla, çay ocaklarını büyüt.", "Brew tea, serve your guests and grow the city's tea houses.", "soon"),
        ("bogaz-muhafizlari", "bogaz-muhafizlari/", "bogaz-muhafizlari/tanitim/icon.png", "Boğaz Muhafızları", "Bosphorus Guard: Defense",
         "Kuleleri kur, zinciri kaldır, Boğaz'ı koru.", "Build towers, raise the chain, defend the Bosphorus.", "soon"),
        ("kapalicarsi", "kapalicarsi/", "kapalicarsi/tanitim/icon.png", "Kapalıçarşı", "Bazaar Atelier",
         "Eski çarşıyı onar: ürünü yap, doğru alıcıya sat.", "Restore an old bazaar: craft it, sell it to the right buyer.", "soon"),
        ("anadolu-lojistik", "anadolu-lojistik/", "anadolu-lojistik/tanitim/icon.png", "Anadolu Lojistik", "Anatolia Logistics: Fleet",
         "Rotayı çiz, sandıkları zamanında teslim et.", "Draw the route, deliver every crate on time.", "soon"),
        ("surlarin-efendisi", "surlarin-efendisi/", "surlarin-efendisi/icons/Icon-192.png", "Surların Efendisi", "Keep & Catapult",
         "Sapanı çek, rüzgârı oku, kaleyi yık.", "Pull the sling, read the wind, topple the keep.", "web"),
        ("isik-ustasi", "isik-ustasi/", "isik-ustasi/icons/Icon-192.png", "Işık Ustası", "Işık Ustası",
         "Aynaları döndür, renkleri yönlendir.", "Turn mirrors, steer colored light.", "web"),
        ("golge-sokagi", "golge-sokagi/", "golge-sokagi/icons/Icon-192.png", "Gölge Sokağı", "Shadow Lane",
         "Devriyeyi izle, çıkışa sessizce ulaş.", "Watch the patrol, slip to the exit.", "web"),
    ]),
    ("Arkadaşlarla aynı masada", "Around one table with friends", [
        ("vampir-koylu", "vampir-koylu/", "vampir-koylu/icon-192.png", "Vampir Köylü", "Vampire Village",
         "Herkes kendi telefonunda, moderatör yok. 4–20 oyuncu.", "One phone each, no moderator. 4–20 players.", "web"),
        ("sahtekar", "sahtekar/", "sahtekar/icon-192.png", "Sahtekâr", "Sahtekâr",
         "Herkes gizli kelimeyi bilir, biri hariç. 3–20 oyuncu.", "Everyone knows the secret word, except one of you. 3–20 players.", "web"),
        ("palavra", "palavra/", "palavra/icon-192.png", "Palavra", "Palavra",
         "Palavra at, arkadaşlarını kandır, gerçeği bul. 3–12 oyuncu.", "Write fake answers, find the real one. 3–12 players.", "web"),
        ("gizli-konsey", "gizli-konsey/", "gizli-konsey/icon-192.png", "Gizli Konsey", "Gizli Konsey",
         "Gizli rol ve blöf oyunu. 5–10 oyuncu.", "Hidden-role party game. 5–10 players.", "web"),
    ]),
    ("Yönetim ve kariyer", "Management and career", [
        ("apartman", "apartman/", None, "Apartman", "Apartman",
         "Papatya Apartmanı'nın yöneticisi sensin: aidat, tamir, komşu ve genel kurul.",
         "You run Papatya Apartments: dues, repairs, neighbours and residents' meetings.", "ios"),
        ("emlak-yildizi", "emlak-yildizi/oyun/", "emlak-yildizi/oyun/tanitim/icon.png", "Emlak Yıldızı", "Realty Star",
         "Dinle, pazarlık et, ofisini büyüt.", "Read clients, negotiate, grow your office.", "soon"),
    ]),
    ("Futbol", "Football", [
        ("futbolcu-kart", "futbolcu-kart/", "futbolcu-kart/tanitim/icon.png", "Derbi", "Derbi",
         "Kart düellosu, günün bulmacaları ve paketler.", "Card duels, daily puzzles and packs.", "ios"),
    ]),
]
STATE = {
    "tr": {"soon": "Yakında", "web": "Tarayıcıda oynanır", "ios": "App Store'da"},
    "en": {"soon": "Coming soon", "web": "Plays in the browser", "ios": "On the App Store"},
}
TEXT = {
    "tr": {"title": "Cem Güngör'ün oyunları", "lede": "Tek kişilik bir stüdyodan oyunlar. Hepsi ücretsiz, iOS ve Android için.",
           "other": "English", "desc": "Cem Güngör'ün iOS ve Android oyunları: bulmaca, strateji, parti oyunları, yönetim ve futbol."},
    "en": {"title": "Games by Cem Güngör", "lede": "Games from a one-person studio. All free, for iOS and Android.",
           "other": "Türkçe", "desc": "iOS and Android games by Cem Güngör: puzzle, strategy, party games, management and football."},
}
CSS = """
@font-face{font-family:'Rubik';src:url(%(base)srubik.woff) format('woff');font-weight:400 700;font-display:swap}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%%}
body{margin:0;background:#f2f4f7;color:#131a27;font:1.0625rem/1.55 'Rubik',system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:inherit}
a:focus-visible{outline:3px solid #2b5bd7;outline-offset:4px;border-radius:10px}
.wrap{max-width:1080px;margin:0 auto;padding:0 1.25rem}
header{padding:3.5rem 0 1rem}
h1{font-size:clamp(2.1rem,7vw,3.5rem);line-height:1.05;font-weight:500;letter-spacing:-.02em;margin:0;text-wrap:balance}
header p{font-size:clamp(1.1rem,2.4vw,1.3rem);color:#4b5568;max-width:38ch;margin:1rem 0 0}
h2{font-size:1.2rem;font-weight:500;margin:3rem 0 1.25rem;padding-top:1.25rem;border-top:1px solid #d9dee7}
ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%%,20rem),1fr));gap:1.5rem 2.5rem}
li a{display:grid;grid-template-columns:4.75rem 1fr;gap:1rem;align-items:center;text-decoration:none}
li img{width:4.75rem;height:4.75rem;border-radius:22%%;display:block;box-shadow:0 0 0 1px #d9dee7}
li b{display:block;font-weight:500;font-size:1.15rem;line-height:1.25}
li a:hover b{text-decoration:underline;text-underline-offset:.2em}
li span{display:block;color:#4b5568;font-size:.95rem;line-height:1.4;margin-top:.15rem}
li small{display:block;color:#5d6779;font-size:.85rem;margin-top:.3rem}
footer{margin-top:4rem;padding:1.5rem 0 3rem;border-top:1px solid #d9dee7;color:#4b5568;font-size:.95rem;display:flex;gap:1.5rem;justify-content:space-between}
"""


def page(lang):
    t = TEXT[lang]
    base = "" if lang == "tr" else "../"
    up = "../" if lang == "tr" else "../../"
    e = html.escape
    parts = []
    for tr_head, en_head, games in GROUPS:
        rows = []
        for slug, link, _icon, tr_name, en_name, tr_line, en_line, state in games:
            name, line = (tr_name, tr_line) if lang == "tr" else (en_name, en_line)
            href = up + link
            if lang == "en" and (ROOT / link / "en" / "index.html").exists():
                href += "en/"
            rows.append(
                f'<li><a href="{href}"><img src="{base}ikon/{slug}.png" width="152" height="152" alt="" loading="lazy">'
                f'<div><b>{e(name)}</b><span>{e(line)}</span><small>{STATE[lang][state]}</small></div></a></li>'
            )
        parts.append(f'<h2>{tr_head if lang == "tr" else en_head}</h2>\n<ul>{"".join(rows)}</ul>')
    url = f"{SITE}/oyunlar/" + ("" if lang == "tr" else "en/")
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(t["title"])}</title>
<meta name="description" content="{e(t["desc"])}">
<meta name="theme-color" content="#f2f4f7">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="tr" href="{SITE}/oyunlar/">
<link rel="alternate" hreflang="en" href="{SITE}/oyunlar/en/">
<style>{CSS % {"base": base}}</style>
</head>
<body>
<div class="wrap">
<header><h1>{e(t["title"])}</h1><p>{e(t["lede"])}</p></header>
<main>
{chr(10).join(parts)}
</main>
<footer><span>Cem Güngör</span><a href="{'en/' if lang == 'tr' else '../'}" lang="{'en' if lang == 'tr' else 'tr'}">{t["other"]}</a></footer>
</div>
</body>
</html>
"""


if __name__ == "__main__":
    (OUT / "ikon").mkdir(parents=True, exist_ok=True)
    (OUT / "en").mkdir(exist_ok=True)
    for _, _, games in GROUPS:
        for slug, _link, icon, *_ in games:
            dst = OUT / "ikon" / f"{slug}.png"
            src = ROOT / icon if icon else (Path(sys.argv[1]) if len(sys.argv) > 1 else None)
            if src is None:
                if not dst.exists():
                    raise SystemExit(f"no icon source for {slug}")
                continue
            Image.open(src).convert("RGBA").resize((152, 152), Image.LANCZOS).save(dst, optimize=True)
    shutil.copy(ROOT / "sancak-blok/tanitim/body.woff", OUT / "rubik.woff")
    shutil.copy(ROOT / "sancak-blok/tanitim/OFL-SancakBody-Rubik.txt", OUT / "OFL-Rubik.txt")
    (OUT / "index.html").write_text(page("tr"), encoding="utf-8")
    (OUT / "en" / "index.html").write_text(page("en"), encoding="utf-8")
    print("oyunlar ok")
