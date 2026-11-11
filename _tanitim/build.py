#!/usr/bin/env python3
"""Builds the per-app landing pages (/<slug>/index.html and /<slug>/en/index.html).

Sources are the store kits in the game repositories; nothing here is hand-drawn.
Run: python3 _tanitim/build.py studio=<path> derbi=<path> emlak=<path> [slug ...]
An app whose folder root already holds another page sets "path" (for example
"emlak-yildizi/oyun") and "privacy" (link to its privacy page, relative to the Turkish page).
The folder name starts with an underscore so GitHub Pages (Jekyll) does not publish it.
"""
import colorsys
import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://cemgungor9.github.io"
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+011E,U+011F,U+0130,U+0131,U+015E,U+015F,"
    "U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026"
)
TEXT = {
    "tr": {
        "ios": "App Store'dan indir",
        "android": "Google Play'den indir",
        "soon_both": "Yakında App Store ve Google Play'de.",
        "soon_android": "Google Play'de yakında.",
        "soon_ios": "App Store'da yakında.",
        "privacy": "Gizlilik politikası",
        "other": "English",
        "by": "Cem Güngör tarafından yapıldı.",
        "shots": "Oyundan görüntüler",
        "free": "Ücretsiz. iOS ve Android.",
    },
    "en": {
        "ios": "Download on the App Store",
        "android": "Get it on Google Play",
        "soon_both": "Coming soon to the App Store and Google Play.",
        "soon_android": "Coming soon to Google Play.",
        "soon_ios": "Coming soon to the App Store.",
        "privacy": "Privacy policy",
        "other": "Türkçe",
        "by": "Made by Cem Güngör.",
        "shots": "Screenshots",
        "free": "Free. iOS and Android.",
    },
}


def lum(rgb):
    def f(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def hexc(rgb):
    return "#%02x%02x%02x" % tuple(int(round(max(0, min(255, c)))) for c in rgb)


def hls(rgb):
    return colorsys.rgb_to_hls(*(c / 255 for c in rgb))


def from_hls(h, l, s):
    return tuple(c * 255 for c in colorsys.hls_to_rgb(h, l, s))


def palette(hero: Path, override=None):
    """Page colours taken from the game's own feature art."""
    im = Image.open(hero).convert("RGB")
    w, h = im.size
    # The page continues below the poster, so the base colour is the art's bottom band.
    band = im.crop((0, int(h * 0.9), w, h)).resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    mean = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    hh, ll, ss = hls(band)
    dark = lum(mean) < 0.32
    if dark:
        bg = from_hls(hh, min(ll, 0.11), min(ss, 0.55))
        ink = from_hls(hh, 0.93, min(ss, 0.35))
        muted = from_hls(hh, 0.74, min(ss, 0.25))
        line = from_hls(hh, 0.24, min(ss, 0.4))
    else:
        bg = from_hls(hh, max(ll, 0.95), min(ss, 0.6))
        ink = from_hls(hh, 0.14, min(ss, 0.5))
        muted = from_hls(hh, 0.36, min(ss, 0.3))
        line = from_hls(hh, 0.84, min(ss, 0.4))
    # Accent: the most vivid colour that occupies real area in the art.
    q = im.resize((160, 78)).quantize(12, method=Image.MEDIANCUT)
    pal = q.getpalette()[: 12 * 3]
    counts = sorted(q.getcolors(), reverse=True)
    best, score = None, -1
    for n, idx in counts:
        c = tuple(pal[idx * 3 : idx * 3 + 3])
        ch, cl, cs = hls(c)
        if not 0.3 < cl < 0.75:
            continue
        sc = cs * (0.5 + cl) * (n ** 0.25)
        if sc > score:
            best, score = c, sc
    accent = best or (from_hls(hh, 0.6, 0.7))
    ah, al, as_ = hls(accent)
    as_ = max(as_, 0.6)
    # Make the accent readable as a button on the page background.
    for _ in range(40):
        accent = from_hls(ah, al, as_)
        if contrast(accent, bg) >= 4.5:
            break
        al += 0.02 if dark else -0.02
    on_accent = (20, 16, 12) if contrast(accent, (20, 16, 12)) >= contrast(accent, (255, 255, 255)) else (255, 255, 255)
    out = {
        "bg": hexc(bg), "ink": hexc(ink), "muted": hexc(muted), "line": hexc(line),
        "accent": hexc(accent), "on_accent": hexc(on_accent), "dark": dark,
    }
    out.update(override or {})
    return out


def subset_font(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [sys.executable, "-m", "fontTools.subset", str(src), f"--unicodes={UNICODES}",
         "--flavor=woff", "--layout-features=kern,liga", "--name-IDs=*", f"--output-file={dst}"],
        check=True, capture_output=True,
    )


def derbi_fonts(derbi: Path, out: Path):
    """Derbi ships pre-split woff2 files; copy the Latin and Latin-ext cuts."""
    css = (derbi / "public/fonts/fonts.css").read_text()
    faces = []
    for block in re.findall(r"@font-face\s*{[^}]*}", css):
        fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        url = re.search(r"url\(/fonts/([^)]+)\)", block).group(1)
        weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
        rng = re.search(r"unicode-range:\s*([^;]+);", block).group(1)
        want = (fam == "Anton") or (fam == "DM Sans" and weight in ("400", "500"))
        latin = rng.startswith("U+0000-00FF") or rng.startswith("U+0100-02BA")
        if want and latin and "italic" not in block:
            shutil.copy(derbi / "public/fonts" / url, out / url)
            name = "Display" if fam == "Anton" else "Body"
            faces.append(
                f"@font-face{{font-family:'{name}';src:url(tanitim/{url}) format('woff2');"
                f"font-weight:{weight if name == 'Body' else 400};font-display:swap;unicode-range:{rng}}}"
            )
    return faces


CSS = """
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:1.0625rem/1.6 'Body',system-ui,-apple-system,'Segoe UI',sans-serif}
img{display:block;max-width:100%;height:auto}
a{color:inherit}
a:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:6px}
.poster{margin:0 auto;max-width:1080px}
.poster img{width:100%;-webkit-mask-image:linear-gradient(#000 88%,transparent);mask-image:linear-gradient(#000 88%,transparent)}
main{max-width:1080px;margin:1rem auto 0;padding:0 1.25rem 3rem;position:relative}
.id{display:flex;align-items:center;gap:1rem}
.id img{width:4.5rem;height:4.5rem;border-radius:22%;flex:none;box-shadow:0 0 0 1px var(--line)}
h1{font:400 clamp(2.1rem,7.5vw,3.75rem)/1.02 'Display','Body',system-ui,sans-serif;margin:0;letter-spacing:-.01em;text-wrap:balance}
.lede{font-size:clamp(1.15rem,2.6vw,1.45rem);line-height:1.4;max-width:34ch;margin:1.4rem 0 0;text-wrap:balance}
.about{max-width:58ch;margin:.9rem 0 0;color:var(--muted)}
.get{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 1.25rem;margin:1.75rem 0 0}
.store{display:inline-block;background:var(--accent);color:var(--on-accent);text-decoration:none;font-weight:600;padding:.85rem 1.35rem;border-radius:.8rem}
.store:hover{filter:brightness(1.08)}
.soon{color:var(--muted)}
.free{margin:.9rem 0 0;color:var(--muted);font-size:.95rem}
.shots{list-style:none;margin:2.75rem -1.25rem 0;padding:0 1.25rem 1rem;display:grid;grid-auto-flow:column;grid-auto-columns:min(62vw,270px);gap:.9rem;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 1.25rem}
.shots li{scroll-snap-align:start}
.shots img{border-radius:1rem;box-shadow:0 0 0 1px var(--line);aspect-ratio:9/16;width:100%;background:var(--line)}
footer{max-width:1080px;margin:0 auto;padding:1.5rem 1.25rem 3rem;border-top:1px solid var(--line);color:var(--muted);font-size:.95rem;display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}
footer span{flex:1 0 100%}
@media (min-width:900px){
 .poster img{-webkit-mask-image:linear-gradient(#000 72%,transparent);mask-image:linear-gradient(#000 72%,transparent)}
 main{padding:0 2.5rem 4rem;margin-top:-3.5rem}
 .shots{margin:3.5rem 0 0;padding:0;grid-auto-flow:row;grid-template-columns:repeat(4,1fr);gap:1.25rem;overflow:visible}
 footer{padding:1.75rem 2.5rem 3.5rem}
 footer span{flex:0 1 auto;margin-right:auto}
}
@media (min-width:1080px){
 .poster img{-webkit-mask-image:linear-gradient(#000 72%,transparent),linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(#000 72%,transparent),linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-composite:intersect}
}
"""


def page(app, lang, pal, faces, n_shots):
    t = TEXT[lang]
    d = app[lang]
    slug = app.get("path", app["slug"])
    base = "" if lang == "tr" else "../"
    other = "en/" if lang == "tr" else "../"
    url = f"{SITE}/{slug}/" + ("" if lang == "tr" else "en/")
    ios, android = app.get("ios"), app.get("android")
    get = []
    if ios:
        get.append(f'<a class="store" href="{html.escape(ios)}">{t["ios"]}</a>')
    if android:
        get.append(f'<a class="store" href="{html.escape(android)}">{t["android"]}</a>')
    if not ios and not android:
        get.append(f'<span class="soon">{t["soon_both"]}</span>')
    elif not android:
        get.append(f'<span class="soon">{t["soon_android"]}</span>')
    elif not ios:
        get.append(f'<span class="soon">{t["soon_ios"]}</span>')
    shots = "".join(
        f'<li><img src="{base}tanitim/{lang}-{i}.webp" width="540" height="960" loading="lazy" '
        f'alt="{html.escape(d["name"])}: {t["shots"].lower()} {i}"></li>'
        for i in range(1, n_shots + 1)
    )
    css_faces = "".join(faces).replace("url(tanitim/", f"url({base}tanitim/")
    e = html.escape
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(d["name"]) if ":" in d["name"] else e(d["name"]) + ": " + e(d["subtitle"])}</title>
<meta name="description" content="{e(d["lede"])}">
<meta name="theme-color" content="{pal["bg"]}">
<meta name="color-scheme" content="{'dark' if pal['dark'] else 'light'}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="tr" href="{SITE}/{slug}/">
<link rel="alternate" hreflang="en" href="{SITE}/{slug}/en/">
<link rel="icon" href="{base}tanitim/icon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(d["name"])}">
<meta property="og:description" content="{e(d["lede"])}">
<meta property="og:image" content="{SITE}/{slug}/tanitim/hero-{lang}.jpg">
<meta property="og:url" content="{url}">
<style>
{css_faces}
:root{{--bg:{pal["bg"]};--ink:{pal["ink"]};--muted:{pal["muted"]};--line:{pal["line"]};--accent:{pal["accent"]};--on-accent:{pal["on_accent"]}}}
{CSS}</style>
</head>
<body>
<header class="poster"><img src="{base}tanitim/hero-{lang}.jpg" width="1024" height="500" alt="{e(d["name"])}. {e(d["subtitle"])}."></header>
<main>
<div class="id"><img src="{base}tanitim/icon.png" width="192" height="192" alt=""><h1>{e(d["name"])}</h1></div>
<p class="lede">{e(d["lede"])}</p>
<p class="about">{e(d["about"])}</p>
<div class="get">{''.join(get)}</div>
<p class="free">{t["free"]}</p>
<ul class="shots" aria-label="{t["shots"]}">{shots}</ul>
</main>
<footer><span>{t["by"]}</span><a href="{base}{app.get("privacy", "privacy.html")}">{t["privacy"]}</a><a href="{other}" lang="{'en' if lang == 'tr' else 'tr'}">{t["other"]}</a></footer>
</body>
</html>
"""


def build(app, roots):
    src = roots[app["repo"]] / app["root"]
    out = ROOT / app.get("path", app["slug"])
    assets = out / "tanitim"
    assets.mkdir(parents=True, exist_ok=True)
    names = app.get("shot_names")
    Image.open(src / app["icon"]).convert("RGBA").resize((192, 192), Image.LANCZOS).save(assets / "icon.png", optimize=True)
    n = len(names) if names else app.get("shots", 4)
    for lang in ("tr", "en"):
        hero = Image.open(src / app["hero"].format(lang=lang)).convert("RGB")
        if hero.size != (1024, 500):
            hero = hero.resize((1024, 500), Image.LANCZOS)
        hero.save(assets / f"hero-{lang}.jpg", quality=86, optimize=True, progressive=True)
        for i in range(1, n + 1):
            shot = Image.open(src / app["shot"].format(lang=lang, i=i, i2=f"{i:02d}", name=names[i - 1] if names else "")).convert("RGB")
            shot.resize((540, 960), Image.LANCZOS).save(assets / f"{lang}-{i}.webp", quality=80, method=6)
    pal = palette(assets / "hero-tr.jpg", app.get("palette"))
    if app["repo"] == "derbi":
        faces = derbi_fonts(roots["derbi"], assets)
    else:
        faces = []
        for name, key in (("Display", "display"), ("Body", "body")):
            if app.get(key):
                subset_font(src / app[key], assets / f"{key}.woff")
                # The fonts are under the SIL Open Font License; ship the licence text with them.
                for lic in (src / app[key]).parent.glob("OFL*.txt"):
                    shutil.copy(lic, assets / lic.name)
                faces.append(
                    f"@font-face{{font-family:'{name}';src:url(tanitim/{key}.woff) format('woff');"
                    f"font-weight:{'400' if name == 'Display' else '400 700'};font-display:swap}}"
                )
    (out / "index.html").write_text(page(app, "tr", pal, faces, n), encoding="utf-8")
    (out / "en").mkdir(exist_ok=True)
    (out / "en" / "index.html").write_text(page(app, "en", pal, faces, n), encoding="utf-8")
    return pal


if __name__ == "__main__":
    roots = {k: Path(v) for k, v in (a.split("=", 1) for a in sys.argv[1:] if "=" in a)}
    only = {a for a in sys.argv[1:] if "=" not in a}
    apps = json.loads((Path(__file__).parent / "apps.json").read_text(encoding="utf-8"))
    for app in apps:
        if only and app["slug"] not in only:
            continue
        if app["repo"] not in roots:
            print("skip", app["slug"], "(no source root given)")
            continue
        existing = ROOT / app.get("path", app["slug"]) / "index.html"
        if existing.exists() and "tanitim/hero-" not in existing.read_text(encoding="utf-8", errors="ignore"):
            raise SystemExit(f"{existing} exists and is not a landing page; refusing to overwrite")
        print(app["slug"], build(app, roots))
