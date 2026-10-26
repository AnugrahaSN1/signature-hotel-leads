// SIGNATURE · hotel-lead qualification assistant (Sofitel · Sofitel Legend · MGallery · Emblems)
// Pure logic + HTML rendering, no DOM. All thresholds, uplifts and fee rates are ILLUSTRATIVE assumptions.

// ---------- 1. ASSUMPTIONS (illustrative, editable) ----------
const BRANDS = {
  sofitel: { name: "Sofitel", rooms: [100, 450], adr: [220, 650], uplift: 0.15, contract: "management",
    fr: "Luxe à la française, grandes villes et resorts majeurs, offre complète (restaurants, réunions).",
    en: "French-flavoured luxury in major cities and resorts, full service (dining, meetings)." },
  legend: { name: "Sofitel Legend", rooms: [50, 260], adr: [380, 1500], uplift: 0.18, contract: "management",
    fr: "Adresses historiques et iconiques, luxe intemporel.",
    en: "Historic, iconic addresses with timeless luxury." },
  mgallery: { name: "MGallery", rooms: [25, 160], adr: [140, 450], uplift: 0.12, contract: "management or franchise",
    fr: "Collection d'hôtels boutique, chacun avec une histoire et un fort sens du lieu.",
    en: "Boutique collection, each hotel with a story and a strong sense of place." },
  emblems: { name: "Emblems", rooms: [15, 220], adr: [300, 1500], uplift: 0.10, contract: "franchise or management",
    fr: "Collection luxe pour indépendants qui gardent leur identité ; catégories Heritage, Retreat, Signature.",
    en: "Luxury collection for independents who keep their identity; Heritage, Retreat or Signature." },
};
const ORDER = ["sofitel", "legend", "mgallery", "emblems"];
const FIN = { gop: 0.32, flow: 0.60, ota_saving: 0.05, mgmt_base: 0.025, mgmt_incentive: 0.07, mkt_loyalty: 0.04, franchise_royalty: 0.045, years: 10, occ_default: 0.65 };
// ota_saving: own sales, marketing and OTA commissions replaced by the brand's distribution and loyalty, as a share of rooms revenue

// ---------- 2. VOCABULARY ----------
const GATEWAY = "paris|londres|london|rome|milan|barcelone|barcelona|madrid|lisbonne|lisbon|porto|amsterdam|bruxelles|brussels|prague|vienne|vienna|berlin|munich|zurich|geneve|geneva|venise|venice|florence|athenes|athens|istanbul|dubai|abu dhabi|doha|riyad|riyadh|le caire|cairo|marrakech|casablanca|new york|miami|los angeles|tokyo|kyoto|singapour|singapore|bangkok|hong kong|shanghai|sydney|melbourne|mumbai|delhi|nice|cannes|monaco|lyon|bordeaux";
const CITY_LABEL = s => s.replace(/\b\w/g, c => c.toUpperCase());
const RX = {
  rooms: "(\\d{2,4})\\s*(?:chambres?|ch\\.?\\b|rooms?|keys?|cles|suites et chambres|unites|units)",
  adr: "(?:adr|prix moyen|tarif moyen|average (?:daily )?rate|rate)\\s*(?:de|of|:|a|=)?\\s*(?:€\\s*)?(\\d{2,4})\\s*(?:€|eur|euros?)?|(?:€\\s*)?(\\d{2,4})\\s*(?:€|eur|euros?)?\\s*(?:la nuit|par nuit|per night|a night|\\/nuit|\\/night|de prix moyen|d'adr|adr)",
  occ: "(?:to|taux d'occupation|occupation|occupancy|occ\\.?)\\s*(?:de|of|:|a|=)?\\s*(\\d{2})\\s*%|(\\d{2})\\s*%\\s*(?:d'occupation|occupancy|de to|occupation)",
  heritage: "chateau|palais|palace|abbaye|couvent|monastere|hotel particulier|historique|historic|classe monument|monument historique|listed|heritage|patrimoine|xviii|xixe|xix|18th|19th|17th|xvii|ancien(?:ne)? (?:gare|banque|prison|usine|hopital|bourse|poste)|former (?:bank|station|prison|palace|monastery)|\\b1[5-8]\\d\\d\\b|\\b19[0-3]\\d\\b|centenaire|riad|manoir|manor",
  landmark: "iconique|emblematique|landmark|legendaire|legendary|mythique|iconic|celebre|famous|vue sur (?:la tour eiffel|les pyramides|le lac)",
  design: "boutique|design|architecte|architect|designer|art deco|galerie|gallery|contemporain|contemporary|arty|creatif",
  resort: "plage|beach|bord de mer|seaside|\\bmer\\b|\\bocean|montagne|mountain|\\bski\\b|\\bile\\b|\\biles\\b|island|vignoble|vineyard|vignes|campagne|countryside|\\blac\\b|\\blake\\b|desert|golf|thalasso|resort|domaine|wine estate|nature|foret|forest|corse|corsica|provence|alpes|alps|riviera|cote d'azur|maldives|seychelles|bali",
  spa: "spa|wellness|bien-etre|thermal|thalasso|piscine|pool|hammam",
  fnb: "restaurant|etoile|michelin|starred|gastronomique|bar\\b|rooftop|brasserie",
  meeting: "seminaires?|salles? de reunion|meeting|conference|mice|congres|events?|evenementiel|ballroom",
  keepname: "garder (?:son|le|leur|notre) nom|garder (?:son|leur|notre) identite|keep (?:its|the|our|their) (?:name|identity)|rester independant|stay independent|soft brand|independant",
  franchise: "franchise|exploiter (?:nous|lui|elle)-memes?|gerer (?:nous|lui|elle)-memes?|self.?operat|keep operating|garder l'exploitation|exploitant lui-meme",
  management: "contrat de gestion|management contract|ne veut pas gerer|hands.?off|deleguer la gestion|operator wanted|cherche un operateur",
  renovate: "a renover|needs? renovation|vieillissant|dated|travaux a prevoir|en mauvais etat|tired|refurbish",
  renovated: "renove|renovated|refait|neuf|brand new|recent",
  build: "en construction|under construction|projet|greenfield|ouverture prevue|opening in|to open|livraison|permis de construire|vefa",
  big_owner: "fonds|fund|family office|institutionnel|institutional|reit|groupe immobilier|investisseur|investor",
};
const PTYPES = [["chateau", "Château", "Château"], ["\\briad\\b", "Riad", "Riad"], ["palais|palace\\b", "Palais", "Palace"], ["abbaye|monastere|couvent|monastery|convent", "Ancien monastère", "Former monastery"],
  ["manoir|manor", "Manoir", "Manor house"], ["hotel particulier", "Hôtel particulier", "Townhouse"], ["(?:ancienne|former)\\s+(?:\\w+\\s+)?(?:banque|bank)", "Ancienne banque", "Former bank"],
  ["(?:ancienne|former)\\s+(?:gare|station)", "Ancienne gare", "Former station"], ["boutique", "Hôtel boutique", "Boutique hotel"], ["\\bresort\\b", "Resort", "Resort"],
  ["en construction|under construction|greenfield|\\bprojet\\b", "Projet neuf", "New-build project"]];
const FR_W = "\\b(chateau|chambres?|le|la|les|des|une|un|avec|pour|proprietaire|veut|garder|son|nom|pres|de|du|et|a|vue|ville|mer|taux|prix|moyen|ancien|hotel particulier)\\b";
const EN_W = "\\b(rooms?|the|with|owner|wants|keep|its|name|near|and|a|of|view|city|sea|rate|average|former|keys|in|on)\\b";

// ---------- 3. HELPERS ----------
const cache = {};
const rx = (p, f = "") => cache[p + f] || (cache[p + f] = new RegExp(p, f));
const has = (k, t) => rx(RX[k] || k).test(t);
function norm(s) { return String(s).toLowerCase().replace(/œ/g, "oe").replace(/’/g, "'").normalize("NFKD").replace(/[̀-ͯ]/g, ""); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
const sep = (s, c) => s.replace(/\B(?=(\d{3})+(?!\d))/g, c);
function money(x, lang, dec = 0) {
  const neg = x < 0, v = Math.abs(x);
  let s;
  if (v >= 1e6) s = (lang === "fr" ? (v / 1e6).toFixed(1).replace(".", ",") + " M€" : "€" + (v / 1e6).toFixed(1) + "m");
  else if (v >= 1e4) s = (lang === "fr" ? sep(Math.round(v / 1e3).toString(), " ") + " k€" : "€" + sep(Math.round(v / 1e3).toString(), ",") + "k");
  else s = (lang === "fr" ? sep(v.toFixed(dec), " ").replace(".", ",") + " €" : "€" + sep(v.toFixed(dec), ","));
  return (neg ? "−" : "") + s;
}
const pct = (x, d = 0) => (x * 100).toFixed(d) + " %";
const pctEN = (x, d = 0) => (x * 100).toFixed(d) + "%";
const P = (lang, x, d = 0) => lang === "fr" ? pct(x, d).replace(".", ",") : pctEN(x, d);
const inside = (v, [a, b]) => v >= a && v <= b;
const near = (v, [a, b]) => v < a ? Math.max(0, 1 - (a - v) / a) : v > b ? Math.max(0, 1 - (v - b) / b) : 1;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- 4. PARSING ----------
function isFrench(t) { const n = norm(t); return (n.match(rx(FR_W, "g")) || []).length >= (n.match(rx(EN_W, "g")) || []).length; }
function parse(text, L) {
  const t = norm(text);
  let m = rx(RX.rooms).exec(t); if (m) L.rooms = parseInt(m[1]);
  m = rx(RX.adr).exec(t); if (m) L.adr = parseInt(m[1] || m[2]);
  m = rx(RX.occ).exec(t); if (m) L.occ = parseInt(m[1] || m[2]) / 100;
  const city = rx("\\b(" + GATEWAY + ")\\b").exec(t); if (city) { L.city = city[1]; L.gateway = true; }
  const near_ = rx("(?:a|pres de|near|outside|aux portes de|proche de)\\s+(\\d+\\s*(?:min|km)\\s*(?:de|from)\\s*)?(" + GATEWAY + ")").exec(t);
  if (near_) { L.city = near_[2]; L.gateway = !near_[1]; L.near = !!near_[1]; }
  const flags = ["heritage", "landmark", "design", "resort", "spa", "fnb", "meeting", "renovate", "renovated", "build", "big_owner"];
  for (const k of flags) if (has(k, t)) L[k] = true;
  if (L.renovate && rx("renove|renovated|refait").test(t) && !rx("a renover|needs? renovation").test(t)) L.renovate = false;
  if (has("keepname", t)) L.keepname = true;
  if (has("franchise", t)) L.pref = "franchise"; else if (has("management", t)) L.pref = "management";
  if (rx("pas de franchise|no franchise").test(t)) L.pref = "management";
  if (rx("\\b(etoile|michelin|starred)").test(t)) L.starred = true;
  const yr = rx("(?:ouverture|opening|open|livraison)\\D{0,12}(20[2-3]\\d)").exec(t); if (yr) L.open_year = parseInt(yr[1]);
  if (L.near && !L.resort) L.resort = true;
  for (const [p, fr, en] of PTYPES) if (rx(p).test(t)) { L.ptype = [fr, en]; break; }
  return L;
}

// ---------- 5. SCORING ----------
function fit(L) {
  const s = {}, why = {};
  for (const k of ORDER) { s[k] = 0; why[k] = []; }
  const r = L.rooms, a = L.adr;
  for (const k of ORDER) {
    const B = BRANDS[k];
    if (r) s[k] += 25 * near(r, B.rooms); else s[k] += 12;
    if (a) s[k] += 25 * near(a, B.adr); else s[k] += 12;
  }
  // Sofitel: scale, gateway, full service
  if (L.gateway) s.sofitel += 18; if (L.resort && L.spa) s.sofitel += 8; if (L.meeting) s.sofitel += 10; if (L.fnb) s.sofitel += 6;
  if (L.keepname) s.sofitel -= 22; if (L.pref === "franchise") s.sofitel -= 10;
  // Legend: history + icon + top rate
  if (L.heritage) s.legend += 16; if (L.landmark) s.legend += 18; if (L.gateway) s.legend += 6; if (L.starred) s.legend += 4;
  if (!L.heritage && !L.landmark) s.legend -= 30; if (L.keepname) s.legend -= 12; if (L.pref === "franchise") s.legend -= 15; if (L.renovate) s.legend -= 6;
  // MGallery: story, boutique, design
  if (L.heritage) s.mgallery += 14; if (L.design) s.mgallery += 12; if (L.landmark) s.mgallery += 4; if (L.keepname) s.mgallery += 6;
  if (!L.heritage && !L.design && !L.landmark) s.mgallery -= 12;
  // Emblems: independent luxury keeping identity; Heritage / Retreat / Signature
  if (L.keepname) s.emblems += 18; if (L.pref === "franchise") s.emblems += 10;
  if (L.heritage || (L.resort && L.spa) || L.design) s.emblems += 14; else s.emblems -= 12;
  if (L.starred) s.emblems += 4;
  if (L.build) { s.mgallery -= 4; s.emblems -= 6; s.legend -= 20; }
  for (const k of ORDER) s[k] = clamp(Math.round(s[k]), 0, 100);
  return s;
}
function emblemsCategory(L) {
  if (L.heritage || L.landmark) return "Heritage";
  if (L.resort && (L.spa || true)) return "Retreat";
  if (L.design) return "Signature";
  return null;
}
function reasons(k, L, lang) {
  const fr = lang === "fr", out = [], B = BRANDS[k];
  if (L.rooms) out.push(inside(L.rooms, B.rooms) ? (fr ? `${L.rooms} ch. dans la cible` : `${L.rooms} keys in range`) : (fr ? `${L.rooms} ch. hors cible (${B.rooms[0]}–${B.rooms[1]})` : `${L.rooms} keys outside ${B.rooms[0]}–${B.rooms[1]}`));
  if (L.adr) out.push(inside(L.adr, B.adr) ? (fr ? `ADR ${L.adr} € cohérent` : `ADR €${L.adr} fits`) : (fr ? `ADR ${L.adr} € ${L.adr < B.adr[0] ? "trop bas" : "très haut"}` : `ADR €${L.adr} ${L.adr < B.adr[0] ? "too low" : "very high"}`));
  if (k === "sofitel") { if (L.gateway) out.push(fr ? "grande ville" : "gateway city"); if (L.meeting) out.push(fr ? "réunions" : "meetings"); if (L.keepname) out.push(fr ? "le propriétaire veut garder son nom" : "owner wants to keep the name"); }
  if (k === "legend") { if (L.landmark) out.push(fr ? "adresse iconique" : "iconic address"); if (L.heritage) out.push(fr ? "bâtiment historique" : "historic building"); if (!L.heritage && !L.landmark) out.push(fr ? "pas d'histoire légendaire" : "no legendary story"); }
  if (k === "mgallery") { if (L.heritage) out.push(fr ? "une histoire à raconter" : "a story to tell"); if (L.design) out.push(fr ? "design marqué" : "strong design"); }
  if (k === "emblems") { const c = emblemsCategory(L); if (c) out.push((fr ? "catégorie " : "category ") + c); if (L.keepname) out.push(fr ? "garde son identité" : "keeps its identity"); if (L.pref === "franchise") out.push(fr ? "franchise possible" : "franchise available"); }
  return out.slice(0, 3);
}

// ---------- 6. ECONOMICS (illustrative) ----------
function economics(L, k) {
  const occ = L.occ || FIN.occ_default, adr = L.adr, rooms = L.rooms;
  if (!adr || !rooms) return null;
  const B = BRANDS[k];
  const franchise = (L.pref === "franchise" && (k === "emblems" || k === "mgallery"));
  const revpar0 = adr * occ, roomsRev0 = revpar0 * rooms * 365;
  const fbMult = L.fnb || L.meeting ? 1.45 : (L.spa ? 1.3 : 1.15);
  const R0 = roomsRev0 * fbMult, GOP0 = R0 * FIN.gop;
  const calc = u => {
    const roomsRev1 = roomsRev0 * (1 + u), R1 = roomsRev1 * fbMult;
    const GOP1 = GOP0 + (R1 - R0) * FIN.flow + roomsRev1 * FIN.ota_saving;
    const fees = franchise ? roomsRev1 * (FIN.franchise_royalty + FIN.mkt_loyalty)
                           : R1 * FIN.mgmt_base + GOP1 * FIN.mgmt_incentive + roomsRev1 * FIN.mkt_loyalty;
    return { R1, GOP1, fees, delta: GOP1 - fees - GOP0, revpar1: revpar0 * (1 + u) };
  };
  const base = calc(B.uplift);
  let lo = 0, hi = 0.6;                                   // break-even uplift by bisection
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (calc(mid).delta < 0) lo = mid; else hi = mid; }
  return { occ, occ_assumed: !L.occ, revpar0, revpar1: base.revpar1, R0, fees: base.fees, delta: base.delta, breakeven: hi, uplift: B.uplift,
           contract_value: base.fees * FIN.years, franchise };
}

// ---------- 7. LEAD GRADE ----------
function grade(L, s, best, eco, lang) {
  const fr = lang === "fr", flags = [], ask = [];
  const fitPts = s[best] * 0.55;
  const known = ["rooms", "adr", "occ", "city"].filter(k => L[k]).length;
  const dataPts = known * 2.5;
  let intent = 5; if (L.pref) intent += 3; if (L.keepname && (best === "emblems" || best === "mgallery")) intent += 2;
  let ecoPts = 5; if (eco) ecoPts = eco.delta > 0 ? 10 : (eco.breakeven < 0.15 ? 5 : 0);
  let timing = 7; if (L.renovate) timing -= 3; if (L.build) timing -= 2; if (L.renovated) timing += 3;
  const score = clamp(Math.round(fitPts + dataPts + intent + ecoPts + timing), 0, 100);
  if (s[best] < 55) flags.push(fr ? "aucune marque du périmètre ne colle vraiment" : "no brand in scope is a strong fit");
  if (L.rooms && L.rooms < 20) flags.push(fr ? "très petite capacité" : "very small inventory");
  if (eco && eco.delta <= 0) flags.push(fr ? `il faut +${(eco.breakeven * 100).toFixed(0)} % de RevPAR pour couvrir les frais` : `needs +${(eco.breakeven * 100).toFixed(0)}% RevPAR to cover fees`);
  if (L.renovate) flags.push(fr ? "rénovation à chiffrer (PIP)" : "renovation to be costed (PIP)");
  if (L.build) flags.push(fr ? `projet neuf${L.open_year ? ", ouverture " + L.open_year : ""} : revenus des frais décalés` : `new build${L.open_year ? ", opening " + L.open_year : ""}: fee income starts later`);
  if (L.keepname && (best === "sofitel" || best === "legend")) flags.push(fr ? "souhaite garder son nom : marque intégrée difficile" : "wants to keep its name: hard-brand conflict");
  if (L.pref === "franchise" && (best === "sofitel" || best === "legend")) flags.push(fr ? "veut une franchise, marque surtout en gestion" : "wants a franchise; brand is mostly managed");
  if (!L.rooms) ask.push(fr ? "Combien de chambres ?" : "How many keys?");
  if (!L.adr) ask.push(fr ? "Quel prix moyen (ADR) ?" : "What is the ADR?");
  if (!L.occ) ask.push(fr ? "Quel taux d'occupation sur 12 mois ?" : "Trailing-12-month occupancy?");
  if (!L.city) ask.push(fr ? "Quelle localisation exacte ?" : "Exact location?");
  if (!L.pref) ask.push(fr ? "Franchise ou contrat de gestion ?" : "Franchise or management contract?");
  if (best === "legend" || best === "mgallery" || best === "emblems") ask.push(fr ? "Quelle est l'histoire du lieu (date, architecte, classement) ?" : "What is the building's story (date, architect, listing)?");
  if (!L.renovated && !L.build) ask.push(fr ? "Dernière rénovation et budget prévu ?" : "Last renovation and planned capex?");
  const g = score >= 75 ? "A" : score >= 55 ? "B" : "C";
  return { score, grade: g, flags: flags.slice(0, 4), ask: ask.slice(0, 4) };
}

// ---------- 8. TEXTS ----------
const TXT = {
  fr: { hello: "Bonjour ! Décrivez un hôtel ou un projet en une phrase, et je le qualifie pour Sofitel, Sofitel Legend, MGallery ou Emblems : marque la plus adaptée, économie indicative du contrat et note du lead.\nEssayez : « château du XVIIIe à 40 min de Bordeaux, 32 chambres, spa, ADR 380 €, TO 58 %, le propriétaire veut garder son nom ».\nEnsuite : « et en franchise ? », « ADR 450 », « 60 chambres ». Tapez « pipeline » pour la vue d'équipe.",
        ask: "Pour qualifier le lead, il me faut au moins le nombre de chambres ou le prix moyen, et le type de lieu (ville, resort, bâtiment historique…).",
        reset: "Nouveau lead. Décrivez l'hôtel ou le projet.", brandfit: "Adéquation marque", rec: "Recommandé", contract: "Contrat", eco: "Économie indicative (par an)",
        revpar: "RevPAR", owner: "Gain propriétaire", fees: "Frais Accor", be: "Hausse de RevPAR pour couvrir les frais", value: "Valeur de contrat sur 10 ans",
        flags: "Points d'attention", ask_t: "À demander au propriétaire", grade: "Note du lead", noeco: "Ajoutez le nombre de chambres et le prix moyen pour chiffrer le contrat.",
        assumed: "TO supposé à 65 %", note: "Prototype indépendant, non affilié à Accor · seuils, hausses de RevPAR et taux de frais illustratifs.",
        mgmt: "contrat de gestion", fr_: "franchise", outside: "Hors périmètre : orienter vers une autre marque du Groupe (par ex. Handwritten Collection, Mercure)." },
  en: { hello: "Hi! Describe a hotel or project in one sentence and I'll qualify it for Sofitel, Sofitel Legend, MGallery or Emblems: best-fit brand, indicative deal economics and a lead grade.\nTry: \"18th-century château 40 min from Bordeaux, 32 rooms, spa, ADR €380, 58% occupancy, owner wants to keep the name\".\nThen: \"what about franchise?\", \"ADR 450\", \"60 rooms\". Type \"pipeline\" for the team view.",
        ask: "To qualify the lead I need at least the number of keys or the ADR, and the type of place (city, resort, historic building…).",
        reset: "New lead. Describe the hotel or project.", brandfit: "Brand fit", rec: "Recommended", contract: "Contract", eco: "Indicative economics (per year)",
        revpar: "RevPAR", owner: "Owner gain", fees: "Accor fees", be: "RevPAR lift needed to cover fees", value: "10-year contract value",
        flags: "Watch-outs", ask_t: "Ask the owner", grade: "Lead grade", noeco: "Add keys and ADR to price the deal.",
        assumed: "65% occupancy assumed", note: "Independent prototype, not affiliated with Accor · thresholds, RevPAR uplifts and fee rates are illustrative.",
        mgmt: "management contract", fr_: "franchise", outside: "Out of scope: route to another Group brand (e.g. Handwritten Collection, Mercure)." },
};

// ---------- 9. SESSION, PIPELINE VIEW ----------
const LEADS = []; let SEEDED = 0;
function fresh() { return { idx: null, lang: "fr" }; }
let STATE = fresh();
function isNewLead(t) {
  if (rx("^\\s*(et |and |what about|et si|plutot|instead|adr|prix|to |taux|occupation|occupancy|\\d+ (?:chambres|rooms|keys))").test(t)) return false;
  const sig = [rx(RX.rooms).test(t), rx(RX.adr).test(t), has("heritage", t) || has("design", t) || has("landmark", t), has("resort", t) || rx("\\b(" + GATEWAY + ")\\b").test(t)];
  return sig.filter(Boolean).length >= 2;
}
function chatData(text) {
  const t = norm(text.trim());
  let L = STATE; L.lang = isFrench(text) ? "fr" : "en";
  const lang = L.lang, T = TXT[lang];
  if (["reset", "nouveau", "new lead", "nouveau lead", "recommencer"].includes(t)) { STATE = fresh(); STATE.lang = lang; return { type: "text", lang, text: T.reset }; }
  if (["bonjour", "hello", "hi", "salut", "aide", "help"].includes(t)) return { type: "text", lang, text: T.hello };
  if (rx("^\\s*(pipeline|insights?|rapport|report|vue equipe|team view)").test(t)) {
    const lg = rx("english|anglais").test(t) ? "en" : rx("francais|french").test(t) ? "fr" : lang;
    return pipeline(lg);
  }
  if (isNewLead(t)) { STATE = fresh(); STATE.lang = lang; L = STATE; }
  parse(text, L);
  if (!L.rooms && !L.adr && !(L.heritage || L.resort || L.gateway || L.design)) return { type: "text", lang, text: T.ask };
  const s = fit(L);
  const ranked = [...ORDER].sort((a, b) => s[b] - s[a]);
  const best = ranked[0];
  const eco = economics(L, best);
  const g = grade(L, s, best, eco, lang);
  const contract = (L.pref === "franchise" && (best === "emblems" || best === "mgallery")) ? T.fr_
                 : (best === "emblems" && L.pref !== "management") ? (lang === "fr" ? "franchise ou gestion" : "franchise or management") : T.mgmt;
  const row = { best, grade: g.grade, score: g.score, rooms: L.rooms || null, fees: eco ? eco.fees : 0, delta: eco ? eco.delta : null,
                city: L.city || "", missing: ["rooms", "adr", "occ", "city", "pref"].filter(k => !L[k]), flags: g.flags.length };
  if (L.idx !== null) LEADS[L.idx] = row; else { L.idx = LEADS.length; LEADS.push(row); }
  const summary = [];
  if (L.ptype) summary.push(L.ptype[lang === "fr" ? 0 : 1]);
  else if (L.heritage) summary.push(lang === "fr" ? "bâtiment historique" : "historic building");
  if (L.landmark) summary.push(lang === "fr" ? "adresse iconique" : "iconic address");
  if (L.design) summary.push("design");
  if (L.rooms) summary.push(`${L.rooms} ${lang === "fr" ? "ch." : "keys"}`);
  if (L.adr) summary.push(`ADR ${lang === "fr" ? L.adr + " €" : "€" + L.adr}`);
  if (L.occ) summary.push(`${lang === "fr" ? "TO" : "occ."} ${Math.round(L.occ * 100)}${lang === "fr" ? " %" : "%"}`);
  if (L.city) summary.push((L.near ? (lang === "fr" ? "près de " : "near ") : "") + CITY_LABEL(L.city));
  if (L.resort && !L.near && !(L.ptype && L.ptype[1] === "Resort")) summary.push("resort");
  if (L.spa) summary.push("spa");
  if (L.keepname) summary.push(lang === "fr" ? "garde son nom" : "keeps its name");
  if (L.pref) summary.push(L.pref === "franchise" ? T.fr_ : T.mgmt);
  return { type: "lead", lang, s, ranked, best, eco, g, contract, summary, cat: best === "emblems" ? emblemsCategory(L) : null,
           why: Object.fromEntries(ORDER.map(k => [k, reasons(k, L, lang)])), outside: s[best] < 45 };
}
function mostCommon(m, n) { return [...m.entries()].map((e, i) => [e, i]).sort((a, b) => b[0][1] - a[0][1] || a[1] - b[1]).slice(0, n).map(x => x[0]); }
function pipeline(lang) {
  const fr = lang === "fr";
  if (!LEADS.length) return { type: "text", lang, text: fr ? "Aucun lead qualifié pour l'instant." : "No leads qualified yet." };
  const n = LEADS.length, gr = { A: 0, B: 0, C: 0 }, br = new Map(), miss = new Map();
  LEADS.forEach(l => { gr[l.grade]++; br.set(l.best, (br.get(l.best) || 0) + 1); l.missing.forEach(m => miss.set(m, (miss.get(m) || 0) + 1)); });
  const rooms = LEADS.filter(l => l.rooms).map(l => l.rooms), fees = LEADS.filter(l => l.grade !== "C").reduce((a, l) => a + l.fees, 0);
  const lab = { rooms: fr ? "nombre de chambres" : "keys", adr: "ADR", occ: fr ? "taux d'occupation" : "occupancy", city: fr ? "localisation" : "location", pref: fr ? "type de contrat" : "contract type" };
  return { type: "pipeline", lang, n, gr, brands: ORDER.map(k => [BRANDS[k].name, br.get(k) || 0]),
    rows: [[fr ? "Leads qualifiés" : "Leads qualified", String(n)],
           [fr ? "Chambres (moyenne)" : "Keys (average)", rooms.length ? String(Math.round(rooms.reduce((a, b) => a + b, 0) / rooms.length)) : "—"],
           [fr ? "Frais annuels des leads A et B" : "Annual fees, A and B leads", money(fees, lang)],
           [fr ? "Information la plus souvent manquante" : "Most often missing", mostCommon(miss, 2).map(([k, v]) => `${lab[k]} (${v})`).join(", ") || "—"]],
    note: (fr ? "Vue d'équipe : prioriser les A, compléter les B avec les bonnes questions, réorienter les C. Les champs manquants indiquent quoi ajouter au formulaire de contact."
              : "Team view: prioritise A leads, complete B leads with the right questions, reroute C leads. Missing fields show what to add to the inbound form.")
          + (SEEDED ? (fr ? ` Inclut ${SEEDED} leads de démonstration.` : ` Includes ${SEEDED} demo leads.`) : "") };
}

// ---------- 10. RENDERING ----------
const C = { NIGHT: "#1E1853", INK: "#1E1853", PAPER: "#FFFFFF", MIST: "#EAEDF5", LINE: "#D9DCE6", GREY: "#747583", AMBER: "#C7A36A", TEAL: "#2E7D5B", RED: "#A4505A", BLUE: "#1E1853" };
const GRADE_COL = { A: C.AMBER, B: C.NIGHT, C: C.RED };
function toHtml(d) {
  const T = TXT[d.lang], fr = d.lang === "fr";
  if (d.type === "text") return esc(d.text).replace(/\n/g, "<br>");
  if (d.type === "pipeline") {
    const tot = d.n, seg = ["A", "B", "C"].map((g, i) => `<span class="bar" style="--i:${i};display:block;height:14px;width:${(d.gr[g] / tot * 100).toFixed(1)}%;background:${GRADE_COL[g]}"></span>`).join("");
    const legend = ["A", "B", "C"].map(g => `<span style="margin-right:14px"><b style="color:${GRADE_COL[g]}">■</b> ${g} · ${d.gr[g]}</span>`).join("");
    const mx = Math.max(1, ...d.brands.map(b => b[1]));
    const brands = d.brands.map(([nm, v], i) => `<div class="row" style="--i:${i};display:flex;align-items:center;gap:10px;margin:5px 0;font-size:13px"><span style="width:120px">${nm}</span>`
      + `<span style="flex:1;background:${C.MIST};height:10px;border-radius:2px"><span class="bar" style="--i:${i};display:block;height:10px;width:${(v / mx * 100).toFixed(0)}%;background:${C.NIGHT};border-radius:2px"></span></span><span class="mono" style="width:24px;text-align:right">${v}</span></div>`).join("");
    const rows = d.rows.map(([a, v], i) => `<div class="row" style="--i:${i + 4};display:flex;flex-wrap:wrap;gap:4px 14px;padding:7px 0;border-top:1px solid ${C.LINE}"><span class="mono lab" style="width:230px">${esc(a)}</span><span style="flex:1;min-width:180px;font-weight:600">${esc(v)}</span></div>`).join("");
    return `<div class="mono lab">${fr ? "Vue d'équipe" : "Team view"}</div><div class="h">Pipeline</div>`
      + `<div style="display:flex;border-radius:3px;overflow:hidden;margin:8px 0 4px;background:${C.MIST}">${seg}</div><div class="mono" style="font-size:12px;margin-bottom:10px">${legend}</div>`
      + `<div class="mono lab" style="margin-top:6px">${fr ? "Marque recommandée" : "Recommended brand"}</div>${brands}<div style="margin-top:10px">${rows}</div>`
      + `<div style="font-size:12px;color:${C.GREY};margin-top:10px">${esc(d.note)}</div>`;
  }
  // lead card
  const out = [];
  out.push(`<div class="mono lab">${fr ? "Dossier lead" : "Lead file"}</div><div style="display:flex;align-items:flex-start;gap:16px;justify-content:space-between">`
    + `<div style="flex:1;min-width:0"><div class="h">${esc(d.summary.slice(0, 3).join(" · ") || (fr ? "Hôtel" : "Hotel"))}</div>`
    + `<div style="font-size:12.5px;color:${C.GREY};margin-top:2px">${esc(d.summary.slice(3).join(" · "))}</div></div>`
    + `<div class="stamp" style="border-color:${GRADE_COL[d.g.grade]};color:${GRADE_COL[d.g.grade]}"><div class="g">${d.g.grade}</div><div class="mono" style="font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;margin-top:3px">${T.grade}</div><div style="font-size:12px;font-weight:600;margin-top:1px"><span class="count" style="--to:${d.g.score}"></span>/100</div></div></div>`);
  // brand fit
  const bars = d.ranked.map((k, i) => {
    const best = k === d.best, v = d.s[k];
    return `<div class="row" style="--i:${i};padding:7px 0;${i ? `border-top:1px solid ${C.LINE}` : ""}"><div style="display:flex;align-items:center;gap:10px">`
      + `<span style="width:128px;font-weight:${best ? 700 : 500}">${BRANDS[k].name}${best ? ` <span class="pill">${T.rec}</span>` : ""}</span>`
      + `<span style="flex:1;background:${C.MIST};height:10px;border-radius:2px"><span class="bar" style="--i:${i};display:block;height:10px;width:${v}%;background:${best ? C.NIGHT : "#C9CEE0"};border-radius:2px"></span></span>`
      + `<span class="mono" style="width:34px;text-align:right;font-weight:${best ? 700 : 400}">${v}</span></div>`
      + `<div style="font-size:12px;color:${C.GREY};margin:2px 0 0 138px">${esc(d.why[k].join(" · "))}</div></div>`;
  }).join("");
  out.push(`<div class="sec"><div class="mono lab">${T.brandfit}</div>${bars}</div>`);
  const B = BRANDS[d.best];
  out.push(`<div class="rec"><div style="display:flex;flex-wrap:wrap;gap:6px 18px;align-items:baseline"><span class="h" style="font-size:20px">${B.name}${d.cat ? ` · ${d.cat}` : ""}</span>`
    + `<span class="mono" style="font-size:12px">${T.contract}${fr ? " :" : ":"} ${d.contract}</span></div><div style="font-size:13px;margin-top:3px">${d.lang === "fr" ? B.fr : B.en}</div>`
    + (d.outside ? `<div style="font-size:12.5px;color:${C.RED};margin-top:4px">${T.outside}</div>` : "") + `</div>`);
  // economics
  if (d.eco) {
    const e = d.eco, L = d.lang;
    const tile = (i, big, lab, col) => `<div class="kpi" style="--i:${i}"><div class="big" style="color:${col || C.INK}">${big}</div><div class="mono lab" style="margin-top:4px">${lab}</div></div>`;
    out.push(`<div class="sec"><div class="mono lab">${T.eco}</div><div class="kpis">`
      + tile(0, `${money(e.revpar0, L)} → ${money(e.revpar1, L)}`, `${T.revpar} (+${Math.round(e.uplift * 100)}${fr ? " %" : "%"})`)
      + tile(1, (e.delta >= 0 ? "+" : "") + money(e.delta, L), T.owner, e.delta >= 0 ? C.TEAL : C.RED)
      + tile(2, money(e.fees, L), T.fees + (e.franchise ? (fr ? " (franchise)" : " (franchise)") : ""))
      + tile(3, "+" + P(L, e.breakeven), T.be)
      + `</div><div style="font-size:12px;color:${C.GREY};margin-top:6px">${T.value}${fr ? " :" : ":"} <b>${money(e.contract_value, L)}</b>${e.occ_assumed ? " · " + T.assumed : ""}</div></div>`);
  } else out.push(`<div class="sec" style="font-size:13px;color:${C.GREY}">${T.noeco}</div>`);
  // flags & questions
  const li = arr => arr.map((x, i) => `<li class="row" style="--i:${i + 4}">${esc(x)}</li>`).join("");
  out.push(`<div class="sec two"><div><div class="mono lab">${T.flags}</div><ul>${li(d.g.flags.length ? d.g.flags : [fr ? "rien de bloquant à ce stade" : "nothing blocking at this stage"])}</ul></div>`
    + `<div><div class="mono lab">${T.ask_t}</div><ul>${li(d.g.ask)}</ul></div></div>`);
  out.push(`<div class="mono" style="font-size:10.5px;color:${C.GREY};margin-top:10px;border-top:1px solid ${C.LINE};padding-top:7px">${T.note}</div>`);
  return out.join("");
}
function seed(list) { for (const m of list) { STATE = fresh(); chatData(m); } SEEDED = list.length; STATE = fresh(); }
if (typeof module !== "undefined") module.exports = { chatData, toHtml, seed, fresh, LEADS, get STATE() { return STATE; }, set STATE(v) { STATE = v; } };
