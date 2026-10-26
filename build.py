"""Builds index.html (self-contained) for Signature, the hotel-lead qualification assistant."""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
engine = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
SEED = ["Former central bank building in Prague, 1912, 140 rooms, ADR €420, 71% occupancy, iconic, owner wants a management contract",
        "Hôtel de 260 chambres à Lyon, salles de séminaires, restaurant, ADR 240 €, TO 72 %",
        "boutique design hotel in Lisbon, 48 rooms, ADR €260, rooftop bar",
        "resort en bord de mer en Corse, 85 chambres, piscine, spa, ADR 520 €, TO 55 %, famille propriétaire, franchise",
        "projet en construction à Dubai, 320 rooms, opening 2028, ADR €380",
        "hôtel 2 étoiles de 60 chambres à Limoges, ADR 85 €",
        "riad historique à Marrakech, 24 chambres, ADR 410 €, TO 62 %, le propriétaire veut rester indépendant",
        "un hôtel à Nice"]
CHIPS = [("Château près de Bordeaux", "Château du XVIIIe à 40 min de Bordeaux, 32 chambres, spa, ADR 380 €, TO 58 %, le propriétaire veut garder son nom"),
         ("Ancienne banque à Prague (EN)", "Former central bank building in Prague, 1912, 140 rooms, ADR €420, 71% occupancy, iconic, owner wants a management contract"),
         ("Resort en Corse", "Resort en bord de mer en Corse, 85 chambres, piscine, spa, ADR 520 €, TO 55 %, franchise"),
         ("Hôtel d'affaires à Lyon", "Hôtel de 260 chambres à Lyon, salles de séminaires, restaurant, ADR 240 €, TO 72 %"),
         ("Et en franchise ?", "et en franchise ?"), ("Pipeline", "pipeline"), ("Nouveau lead", "nouveau lead")]
chips = "".join(f'<button class="chip" data-q="{q.replace(chr(34), "&quot;")}">{lab}</button>' for lab, q in CHIPS)
FONTS = "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"

CSS = """
@property --n{syntax:'<integer>';initial-value:0;inherits:false}
@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes count{from{--n:0}to{--n:var(--to)}}
@keyframes seal{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
@keyframes ring{from{stroke-dashoffset:302}to{stroke-dashoffset:var(--off)}}
@keyframes dot{0%,80%,100%{opacity:.25}40%{opacity:1}}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{font-family:Montserrat,system-ui,'Helvetica Neue',Arial,sans-serif;color:#3E3D48;display:flex;flex-direction:column;align-items:center;
  background:linear-gradient(180deg,#1E1853 0,#1E1853 230px,#F4F5F9 230px,#F4F5F9 100%);-webkit-font-smoothing:antialiased}
.mono{font-family:Montserrat,system-ui,sans-serif;font-variant-numeric:tabular-nums}
.lab{text-transform:uppercase;letter-spacing:.14em;font-size:10px;font-weight:600;color:#747583}
.top{width:min(900px,100% - 32px);display:flex;align-items:center;gap:14px;padding:26px 2px 18px;color:#fff}
.logo{width:42px;height:42px;border-radius:50%;border:1px solid #C7A36A;display:flex;align-items:center;justify-content:center;flex:none;color:#C7A36A;font-weight:500;font-size:18px;letter-spacing:.02em}
.top h1{margin:0;font-size:20px;font-weight:600;letter-spacing:.18em;text-transform:uppercase}
.top p{margin:3px 0 0;font-size:12.5px;color:#C9C6E0;font-weight:400;letter-spacing:.02em}
.top .tag{margin-left:auto;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#C7A36A;border:1px solid rgba(199,163,106,.6);border-radius:999px;padding:5px 12px}
#app{width:min(900px,100% - 32px);margin:0 16px 10px;flex:1;min-height:0;display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;
  box-shadow:0 24px 60px rgba(30,24,83,.16),0 2px 6px rgba(30,24,83,.06)}
#log{flex:1;overflow-y:auto;padding:8px 26px 14px;min-height:0;position:relative}
.u{display:flex;justify-content:flex-end;margin:18px 0}.u>div{background:#1E1853;color:#fff;padding:12px 18px;max-width:78%;font-weight:500;font-size:14px;border-radius:12px 12px 2px 12px}
.b{display:flex;align-items:flex-start;margin:18px 0}.b>.card{background:#fff;border:1px solid #D9DCE6;border-radius:12px;padding:22px 24px;max-width:calc(100% - 46px);min-width:0;flex:1}
.b.txt>.card{flex:0 1 auto;background:#EAEDF5;border-color:#EAEDF5;font-size:14px;line-height:1.6}
.av{width:32px;min-width:32px;height:32px;margin:4px 14px 0 0;border-radius:50%;background:#1E1853;color:#C7A36A;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
.h{font-weight:600;font-size:22px;line-height:1.25;color:#1E1853;letter-spacing:-.005em}
.sec{margin-top:20px;padding-top:16px;border-top:1px solid #F0F1F5}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.two ul{margin:8px 0 0;padding-left:18px;font-size:13.5px;line-height:1.55}.two li{margin:2px 0}.two li::marker{color:#C7A36A}
.pill{font-size:9px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#1E1853;border:1px solid #C7A36A;border-radius:999px;padding:2px 8px;vertical-align:2px;margin-left:0;background:#fff;display:inline-block;margin-top:3px}
.rec{margin-top:18px;background:#1E1853;color:#fff;padding:18px 20px;border-radius:12px;position:relative;overflow:hidden}
.rec::before{content:"";position:absolute;left:20px;right:20px;top:0;height:2px;background:linear-gradient(90deg,#C7A36A,rgba(199,163,106,0))}
.rec .h{color:#fff;font-size:21px}.rec .mono{color:#C7A36A !important;letter-spacing:.06em}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px}
.kpi{background:#F4F5F9;border-radius:10px;padding:14px 14px 12px}.kpi .big{font-weight:600;font-size:18px;line-height:1.2;font-variant-numeric:tabular-nums}
.kpi .lab{margin-top:6px !important;letter-spacing:.1em;font-size:9.5px}
.stamp{flex:none;width:104px;height:104px;border-radius:50%;border:1px solid !important;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff;
  box-shadow:inset 0 0 0 5px #fff,inset 0 0 0 6px currentColor}
.stamp .g{font-weight:500;font-size:40px;line-height:1;font-family:Montserrat,sans-serif}
.count{counter-reset:n var(--to)}.count::after{content:counter(n)}
.new{animation:up .32s cubic-bezier(.2,.7,.2,1) both}
.new .row{opacity:0;animation:up .38s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:calc(var(--i)*90ms + 120ms)}
.new .bar{transform-origin:left;transform:scaleX(0);animation:grow .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i)*90ms + 220ms)}
.new .kpi{opacity:0;animation:up .38s ease forwards;animation-delay:calc(var(--i)*100ms + 650ms)}
.new .rec{opacity:0;animation:up .4s ease forwards;animation-delay:520ms}
.new .stamp{opacity:0;animation:seal .6s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:1000ms}
.new .count{animation:count 1.1s ease-out forwards;animation-delay:1000ms;counter-reset:n var(--n)}
.dots i{display:inline-block;width:6px;height:6px;margin:0 3px;border-radius:50%;background:#1E1853;animation:dot 1.1s infinite}.dots i:nth-child(2){animation-delay:.18s}.dots i:nth-child(3){animation-delay:.36s}
#chips{display:flex;gap:8px;overflow-x:auto;padding:14px 22px 6px;border-top:1px solid #F0F1F5;scrollbar-width:none}#chips::-webkit-scrollbar{display:none}
.chip{font:inherit;font-size:12.5px;font-weight:500;background:#fff;color:#1E1853;border:1px solid #D9DCE6;border-radius:999px;padding:8px 14px;cursor:pointer;white-space:nowrap;transition:border-color .15s,background .15s}
.chip:hover{border-color:#1E1853;background:#F4F5F9}
form{display:flex;gap:10px;padding:8px 22px 20px}
#q{flex:1;min-width:0;font:inherit;font-size:14.5px;border:1px solid #D9DCE6;border-radius:8px;padding:12px 14px;outline:none;color:#3E3D48;transition:border-color .15s,box-shadow .15s}
#q:focus{border-color:#1E1853;box-shadow:0 0 0 3px rgba(30,24,83,.08)}
#go{font:inherit;font-weight:600;font-size:14px;background:#1E1853;color:#fff;border:0;border-radius:8px;padding:0 22px;cursor:pointer;transition:background .15s}
#go:hover{background:#2C2470}
footer{color:#747583;font-size:11.5px;text-align:center;padding:6px 16px 18px;max-width:900px;line-height:1.6}footer b{color:#1E1853;font-weight:600}
@media (max-width:640px){.top p,.top .tag{display:none}#log{padding:4px 14px 10px}.b>.card{padding:16px}.kpis{grid-template-columns:1fr 1fr}.two{grid-template-columns:1fr}
  .stamp{width:80px;height:80px}.stamp .g{font-size:30px}.b .card div[style*="margin:2px 0 0 138px"]{margin-left:0 !important}#chips,form{padding-left:14px;padding-right:14px}}
@media (prefers-reduced-motion:reduce){.new,.new *{animation:none !important;opacity:1 !important;transform:none !important}}
"""

page = f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Signature · qualification de leads hôteliers</title>
<meta name="description" content="Décrivez un hôtel en une phrase : marque la plus adaptée (Sofitel, Sofitel Legend, MGallery, Emblems), économie indicative du contrat et note du lead. Prototype étudiant indépendant.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="{FONTS}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%231E1853'/%3E%3Ctext x='32' y='42' font-family='Arial' font-size='28' fill='%23C7A36A' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E">
<style>{CSS}</style></head><body>
<div class="top"><div class="logo">S</div><div><h1>Signature</h1><p>Qualification de leads · Sofitel · Sofitel Legend · MGallery · Emblems</p></div><span class="tag">Prototype</span></div>
<div id="app">
  <div id="log"><div id="inner"></div></div>
  <div id="chips">{chips}</div>
  <form id="f" autocomplete="off"><input id="q" aria-label="Message" placeholder="Décrivez l'hôtel ou le projet / Describe the property"><button id="go" type="submit">Qualifier le lead</button></form>
</div>
<footer>Prototype étudiant indépendant par <b>Anugraha SN</b> · BBA, EDHEC Business School · non affilié à Accor · seuils, hausses de RevPAR et taux de frais illustratifs.</footer>
<script>
{engine}
const inner = document.getElementById('inner'), logEl = document.getElementById('log'), q = document.getElementById('q');
const AV = '<div class="av">S</div>';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function add(html) {{ inner.querySelectorAll('.new').forEach(n => n.classList.remove('new')); inner.insertAdjacentHTML('beforeend', html); return inner.lastElementChild; }}
let busy = false;
async function say(text) {{
  if (!text.trim() || busy) return; busy = true;
  add(`<div class="u new"><div>${{esc(text)}}</div></div>`);
  const typing = add(`<div class="b txt new">${{AV}}<div class="card"><span class="dots"><i></i><i></i><i></i></span></div></div>`);
  logEl.scrollTo({{top: logEl.scrollHeight, behavior: 'smooth'}});
  const d = chatData(text); await sleep(700); typing.remove();
  const b = add(`<div class="b ${{d.type === 'text' ? 'txt' : ''}} new">${{AV}}<div class="card">${{toHtml(d)}}</div></div>`);
  logEl.scrollTo({{top: Math.max(0, b.previousElementSibling.offsetTop - 12), behavior: 'smooth'}}); busy = false;
}}
document.getElementById('f').addEventListener('submit', e => {{ e.preventDefault(); const t = q.value; q.value = ''; say(t); }});
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => say(c.dataset.q)));
seed({json.dumps(SEED, ensure_ascii=False)});
add(`<div class="b txt new">${{AV}}<div class="card">${{toHtml({{type:'text', lang:'fr', text: TXT.fr.hello}})}}</div></div>`);
</script></body></html>"""
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print("index.html", len(page) // 1024, "KB")
