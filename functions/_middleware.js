// Weiterleitungen fuer alte Adressen aus der Zeit vor dem Astro Relaunch.
// Laeuft nur fuer die in public/_routes.json gelisteten Pfade.
// Die Tabelle (Slug Listen + Essay Zuordnung) kommt aus dist/redirects.json,
// weil Functions nicht direkt auf content/ zugreifen koennen, und wird pro
// Worker Instanz nur einmal geladen (Modulspeicher).

let tabellePromise;

function ladeTabelle(env, request) {
  if (!tabellePromise) {
    tabellePromise = env.ASSETS.fetch(new URL('/redirects.json', request.url))
      .then((antwort) => antwort.json())
      .catch(() => ({ themen: [], fachgebiete: [], wege: [], essaysByAltSlug: {} }));
  }
  return tabellePromise;
}

function mitUtmParametern(zielPfad, suchparameter) {
  let ergebnis = zielPfad;
  const utm = new URLSearchParams();
  for (const [schluessel, wert] of suchparameter) {
    if (schluessel.startsWith('utm_')) utm.append(schluessel, wert);
  }
  const utmString = utm.toString();
  if (utmString) ergebnis += `?${utmString}`;
  return ergebnis;
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;
  // Die alte Seite lief auf Cloudflare Pages mit sauberen Adressen ohne .html.
  // Geteilte Links (z. B. Pinterest) haben deshalb oft keine Endung oder einen Schraegstrich am Ende.
  const roh = url.pathname;
  const mitHtml = roh.endsWith('.html');
  const pfad = mitHtml ? roh.slice(0, -5) : roh.length > 1 ? roh.replace(/\/$/, '') : roh;

  let ziel = null;

  if (pfad === '/plattform/mental/thema') {
    const slug = params.get('slug');
    const tabelle = await ladeTabelle(env, request);
    ziel = slug && tabelle.themen.includes(slug) ? `/lexikon/${slug}/` : '/lexikon/';
  } else if (pfad === '/plattform/mental/gebiet') {
    const g = params.get('g');
    const tabelle = await ladeTabelle(env, request);
    ziel = g && tabelle.fachgebiete.includes(g) ? `/lexikon/fachgebiet/${g}/` : '/lexikon/';
  } else if (pfad === '/plattform/mental/frage') {
    const slug = params.get('slug');
    const tabelle = await ladeTabelle(env, request);
    ziel = slug && tabelle.wege.includes(slug) ? `/wege/${slug}/` : '/bereiche/';
  } else if (pfad === '/plattform/welt') {
    ziel = '/lexikon/';
  } else if (pfad === '/plattform/mental/philosophie/denkschule') {
    ziel = '/tools/denkschule/';
  } else if (pfad === '/plattform/suche') {
    ziel = '/suche/';
  } else if (pfad.startsWith('/plattform/') || pfad === '/plattform') {
    ziel = '/';
  } else if (pfad === '/blog-artikel') {
    const slug = params.get('slug');
    const tabelle = await ladeTabelle(env, request);
    const neu = slug ? tabelle.essaysByAltSlug[slug] : undefined;
    ziel = neu ? `/essays/${neu}/` : '/essays/';
  } else if (pfad === '/blog') {
    ziel = '/essays/';
  } else if (pfad === '/lernjournal') {
    ziel = '/journale/lernjournal/';
  } else if (pfad === '/studienplaner') {
    ziel = '/journale/studienplaner/';
  } else if (pfad === '/notizbuch') {
    ziel = '/journale/notizbuch/';
  } else if (pfad === '/workoutlogbuch') {
    ziel = '/journale/workoutlogbuch/';
  } else if (mitHtml && pfad === '/impressum') {
    ziel = '/impressum/';
  } else if (mitHtml && pfad === '/datenschutz') {
    ziel = '/datenschutz/';
  }

  if (!ziel) return next();

  const zielMitUtm = mitUtmParametern(ziel, params);
  return Response.redirect(new URL(zielMitUtm, url.origin).toString(), 301);
}
