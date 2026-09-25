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
  const pfad = url.pathname;
  const params = url.searchParams;

  let ziel = null;

  if (pfad === '/plattform/mental/thema.html') {
    const slug = params.get('slug');
    const tabelle = await ladeTabelle(env, request);
    ziel = slug && tabelle.themen.includes(slug) ? `/lexikon/${slug}/` : '/lexikon/';
  } else if (pfad === '/plattform/mental/gebiet.html') {
    const g = params.get('g');
    const tabelle = await ladeTabelle(env, request);
    ziel = g && tabelle.fachgebiete.includes(g) ? `/lexikon/fachgebiet/${g}/` : '/lexikon/';
  } else if (pfad === '/plattform/mental/frage.html') {
    const slug = params.get('slug');
    const tabelle = await ladeTabelle(env, request);
    ziel = slug && tabelle.wege.includes(slug) ? `/wege/${slug}/` : '/bereiche/';
  } else if (pfad === '/plattform/welt.html') {
    ziel = '/lexikon/';
  } else if (pfad === '/plattform/mental/philosophie/denkschule.html') {
    ziel = '/tools/denkschule/';
  } else if (pfad === '/plattform/suche.html') {
    ziel = '/suche/';
  } else if (pfad.startsWith('/plattform/') || pfad === '/plattform') {
    ziel = '/';
  } else if (pfad === '/blog-artikel.html') {
    const slug = params.get('slug');
    const tabelle = await ladeTabelle(env, request);
    const neu = slug ? tabelle.essaysByAltSlug[slug] : undefined;
    ziel = neu ? `/essays/${neu}/` : '/essays/';
  } else if (pfad === '/blog.html') {
    ziel = '/essays/';
  } else if (pfad === '/lernjournal.html') {
    ziel = '/journale/lernjournal/';
  } else if (pfad === '/studienplaner.html') {
    ziel = '/journale/studienplaner/';
  } else if (pfad === '/notizbuch.html') {
    ziel = '/journale/notizbuch/';
  } else if (pfad === '/workoutlogbuch.html') {
    ziel = '/journale/workoutlogbuch/';
  } else if (pfad === '/impressum.html') {
    ziel = '/impressum/';
  } else if (pfad === '/datenschutz.html') {
    ziel = '/datenschutz/';
  }

  if (!ziel) return next();

  const zielMitUtm = mitUtmParametern(ziel, params);
  return Response.redirect(new URL(zielMitUtm, url.origin).toString(), 301);
}
