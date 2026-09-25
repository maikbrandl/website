// Die vier hybridlog Journale. Statisch, aus legacy/*.html uebernommen, kein CMS noetig.
export interface JournalEintrag {
  slug: string;
  titel: string;
  kicker: string;
  h1: string;
  untertitel: string;
  seiten: number;
  format: string;
  einband: string;
  asin?: string;
  amazonUrl: string;
  bild: string;
  highlights: string[];
  faq: { frage: string; antwort: string }[];
}

export const JOURNALE: JournalEintrag[] = [
  {
    slug: 'lernjournal',
    titel: 'Lernjournal',
    kicker: 'Lernjournal',
    h1: 'Lerne smarter. Nicht härter.',
    untertitel:
      'Das hybridlog Lernjournal hilft dir, deinen Lernfortschritt systematisch zu tracken, Schwächen zu erkennen und deine Lernmethoden kontinuierlich zu verbessern.',
    seiten: 190,
    format: 'A5',
    einband: 'Hardcover',
    asin: 'B0DJZ9GGYS',
    amazonUrl: 'https://link.amazon/B04iIGIRG',
    bild: '/images/Lernjournal%20Produktbilder/mockup-of-a-hardcover-book-featuring-a-customizable-background-33646(1).png',
    highlights: [
      '190 Seiten für nachhaltiges Wissenstracking',
      'A5 Hardcover, kompakt und langlebig',
      'Gezielte Reflexionsfragen',
      'Lernfortschritt sichtbar machen',
      'Für Schüler, Studierende und Autodidakten',
    ],
    faq: [
      {
        frage: 'Was ist ein Lernjournal?',
        antwort:
          'Ein Lernjournal ist ein strukturiertes Notizbuch, das beim nachhaltigen Lernen hilft. Es kombiniert Wissenstracking, Reflexionsfragen und Lernfortschritts-Seiten in einem Buch.',
      },
      {
        frage: 'Wie viele Seiten hat das hybridlog Lernjournal?',
        antwort: 'Das Lernjournal hat 190 Seiten im A5-Format mit Hardcover.',
      },
      {
        frage: 'Für wen eignet sich das Lernjournal?',
        antwort:
          'Das Lernjournal eignet sich für Studierende, Berufstätige in Weiterbildung und alle, die neues Wissen nachhaltig verankern wollen, nicht nur für die Schule.',
      },
    ],
  },
  {
    slug: 'studienplaner',
    titel: 'Studienplaner',
    kicker: 'Studienplaner',
    h1: 'Dein Semester. Dein System.',
    untertitel:
      'Der hybridlog Studienplaner gibt dir die Werkzeuge an die Hand, um dein Semester von Anfang bis Ende strukturiert und effizient zu gestalten.',
    seiten: 311,
    format: 'A5',
    einband: 'Hardcover',
    asin: 'B0FRYTVJL1',
    amazonUrl: 'https://link.amazon/B00gkg4Et',
    bild: '/images/Studentenplaner/mockup-of-a-hardcover-book-featuring-a-customizable-background-33646(1).png',
    highlights: [
      '311 Seiten mit klarer Struktur',
      'A5 Hardcover, robust und handlich',
      'Semesterplanung, Wochenplaner und Reflexion',
      'Zielsetzung und Fortschrittstracking',
      'Raum für eigene Notizen und Kreativität',
    ],
    faq: [
      {
        frage: 'Wie viele Seiten hat der hybridlog Studienplaner?',
        antwort: 'Der hybridlog Studienplaner hat 311 Seiten im A5-Format mit Hardcover.',
      },
      {
        frage: 'Was ist im Studienplaner enthalten?',
        antwort:
          'Der Studienplaner enthält Semesterplanung, Wochenpläne, Reflexionsseiten und Zielsetzungs-Tools, alles in einem Buch für strukturiertes Studieren.',
      },
      {
        frage: 'Ist der Studienplaner für alle Studiengänge geeignet?',
        antwort:
          'Ja, der Studienplaner ist studiengangsunabhängig konzipiert und eignet sich für alle Fachrichtungen an Hochschulen und Universitäten.',
      },
    ],
  },
  {
    slug: 'notizbuch',
    titel: 'Schul-Notizbuch',
    kicker: 'Schul-Notizbuch',
    h1: 'Notizen, die hängen bleiben.',
    untertitel:
      'Das hybridlog Schul-Notizbuch bringt die bewährte Cornell-Methode in ein hochwertiges A4-Format, für Notizen, die wirklich beim Lernen helfen.',
    seiten: 125,
    format: 'A4',
    einband: 'Hardcover',
    asin: 'B0FRMHZBB8',
    amazonUrl: 'https://link.amazon/B0cXEUPWO',
    bild: '/images/Schul-Notizbuch/Mockups%20fertig/mockup-of-a-hardcover-book-featuring-a-customizable-background-33646.png',
    highlights: [
      '125 Seiten im Cornell-Layout',
      'A4 Hardcover, viel Platz für Notizen',
      'Stichwort-Spalte, Notizen-Bereich und Zusammenfassung',
      'Ideal für Unterricht und Selbststudium',
      'Fördert aktives Wiederholen und Verstehen',
    ],
    faq: [
      {
        frage: 'Was ist die Cornell-Methode?',
        antwort:
          'Die Cornell-Methode ist eine bewährte Notiztechnik, bei der das Blatt in drei Bereiche aufgeteilt wird: Notizen, Stichworte und Zusammenfassung. Das fördert aktives Lernen und einfache Wiederholung.',
      },
      {
        frage: 'Wie viele Seiten hat das hybridlog Schul-Notizbuch?',
        antwort: 'Das Schul-Notizbuch hat 125 Seiten im A4-Format mit Hardcover.',
      },
      {
        frage: 'Für wen ist das Schul-Notizbuch geeignet?',
        antwort:
          'Das Notizbuch ist ideal für Schülerinnen und Schüler ab der Mittelstufe sowie für alle, die strukturierter lernen und Notizen besser organisieren möchten.',
      },
    ],
  },
  {
    slug: 'workoutlogbuch',
    titel: 'Workout Logbuch',
    kicker: 'Workout Logbuch',
    h1: 'Maximiere deinen Fortschritt.',
    untertitel:
      'Dokumentiere jedes Workout klar und effektiv. Das hybridlog Workout Logbuch gibt dir die Struktur, um dein Training messbar und nachhaltig erfolgreicher zu machen.',
    seiten: 206,
    format: 'A5',
    einband: 'Ringbuch',
    amazonUrl: 'https://link.amazon/B08vdkWlC',
    bild: '/images/Workoutlogbuch/1.png',
    highlights: [
      'Maximaler Fortschritt, erkenne sofort, ob du stärker wirst',
      'Intensität festhalten: RPE/RIR, Pausenzeiten und Sätze',
      'Fokus statt Ablenkung, trainiere ohne Handy',
      'Alles an einem Ort, klar strukturiert und nachschlagbar',
      'Bis zu 10 Übungen pro Tag mit 7 Sätzen je Übung',
    ],
    faq: [],
  },
];

export function journalBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return JOURNALE.find((j) => j.slug === slug);
}
