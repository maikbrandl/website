---
title: "Large Language Model"
slug: "large-language-model"
art: "Technologie"
wissensraum: "mind"
gebiet: "technologie-zukunft"
untergruppe: "Künstliche Intelligenz"
einstieg: false
lead: "Ein Large Language Model ist ein Programm, das aus riesigen Textmengen gelernt hat, ==das jeweils wahrscheinlichste nächste Wortstück vorherzusagen==, und daraus ganze Antworten baut."
lesezeit: 3
vertiefzeit: 10
geprueft_am: "2026-10-02"
bloecke:
  - type: kurz_erklaert
    text: "Ein Large Language Model, kurz LLM, ist im Kern eine riesige Rechenmaschine für Wahrscheinlichkeiten. Milliarden einstellbarer Werte, Parameter genannt, lernen beim Training an gewaltigen Textmengen, welches Wortstück als Nächstes am wahrscheinlichsten folgt. Mehr steckt zunächst nicht dahinter. Beim Antworten wiederholt das Modell genau diesen einen Trick, Stück für Stück, bis ein ganzer Satz dasteht. Nachschlagen kann es dabei nichts, eine Datenbank mit Fakten gibt es im Inneren nicht, nur Zahlen, die sich beim Training verschoben haben."
  - type: icon_fakten
    titel_override: "Auf einen Blick"
    fakten:
      - icon: lightbulb
        label: "Ursprung"
        text: "Google Forschende stellten 2017 die Transformer Architektur vor, in einem Paper mit dem schlichten Titel „Attention Is All You Need“."
      - icon: search
        label: "Größe"
        text: "GPT-3 kam 2020 mit rund 175 Milliarden Parametern. Aktuelle Modelle liegen vermutlich weit darüber, offizielle Zahlen nennen die Hersteller kaum noch."
      - icon: shield
        label: "Grenze"
        text: "Halluzination nennt die Forschung erfundene, aber glaubwürdig klingende Aussagen. Eines der hartnäckigsten offenen Probleme."
  - type: prozess
    titel_override: "So entsteht es"
    schritte:
      - titel: "Vortraining"
        untertitel: "Vorhersage des nächsten Tokens über Hunderte Milliarden Wortstücke hinweg, ohne jede menschliche Anleitung"
        icon: lightbulb
      - titel: "Feinschliff"
        untertitel: "Menschen bewerten Antworten, das Modell lernt daraus, welcher Ton gefragt ist"
        icon: search
      - titel: "Antwort"
        untertitel: "Token für Token entsteht am Ende ein Text, der wie eine durchdachte Antwort wirkt"
        icon: check
  - type: textabschnitt
    titel_override: "Anwendung"
    text: "Richtig stark ist ein LLM dort, wo sich das Ergebnis leicht gegenprüfen lässt: eine Mail umformulieren, einen langen Text zusammenfassen, Code erklären, einen ersten Entwurf liefern. Schwierig wird es bei Fakten ohne Quelle, bei Ereignissen nach dem Trainingsende, bei langen Rechenketten mit vielen Zwischenschritten. Ein eingebautes Gespür dafür, was es nicht weiß, hat das Modell nicht. Eine falsche Jahreszahl kommt im selben ruhigen Ton wie eine richtige."
  - type: beispiel
    text: "Jemand bittet einen Chatbot um eine Studie zu Schlaf und Gedächtnis. Die Antwort nennt Autoren, Jahr, Zeitschrift, alles klingt plausibel. Nur: Die Fachdatenbank kennt den Artikel nicht."
    ergebnis: "Die Quelle war erfunden, die Form stimmte, der Inhalt nicht."
  - type: liste
    titel_override: "Was du tun kannst"
    punkte:
      - "Zahlen, Namen und Quellen immer gegen eine zweite, unabhängige Quelle prüfen."
      - "Eigenen Kontext mitgeben, etwa den Text, um den es wirklich geht."
      - "Ausdrücklich nachfragen, wie sicher sich das Modell ist, und warum."
      - "Keine Passwörter oder Gesundheitsdaten in einen Chat kopieren, so praktisch das auch wäre."
  - type: evidenz
    text: "Ji und Kollegen werteten 2023 eine ganze Reihe von Aufgaben aus, vom Zusammenfassen bis zum offenen Dialog, und fanden Halluzinationen fast überall. Ein Grund liegt tief im Trainingsziel selbst: Belohnt wird plausibler Text, nicht wahrer."
    link_label: "Ji et al. (2023), Survey of Hallucination in Natural Language Generation"
    link_url: "https://arxiv.org/abs/2202.03629"
  - type: faq
    eintraege:
      - frage: "Versteht ein LLM, was es schreibt?"
        antwort: "Darüber streiten sich Fachleute bis heute. Unstrittig ist nur, dass ein LLM sprachliche Muster extrem genau abbildet und damit Aufgaben löst, die Verständnis zu verlangen scheinen. Ob dahinter etwas steckt, das man im menschlichen Sinn Verstehen nennen würde, lässt sich mit heutigen Methoden schlicht nicht beantworten."
      - frage: "Ist ChatGPT ein LLM?"
        antwort: "Nicht ganz. ChatGPT ist eine Anwendung mit einem LLM im Kern, dazu kommen Websuche, Bildverarbeitung, Regeln für den Ton. Claude und Gemini sind nach demselben Prinzip gebaut."
      - frage: "Woher weiß ein LLM Dinge?"
        antwort: "Aus den Texten, mit denen es trainiert wurde, gespeichert nicht als Kopie, sondern als statistische Spur in den Parametern. Das erlaubt neue Kombinationen, aber eben auch Verwechslungen."
wege: []
verwandte_themen:
  - "agi-und-superintelligenz"
  - "alignment-problem"
verwandte_tools: []
quellen:
  - titel: "Vaswani et al. (2017), Attention Is All You Need"
    url: "https://arxiv.org/abs/1706.03762"
  - titel: "Brown et al. (2020), Language Models are Few-Shot Learners"
    url: "https://arxiv.org/abs/2005.14165"
  - titel: "Ji et al. (2023), Survey of Hallucination in Natural Language Generation"
    url: "https://arxiv.org/abs/2202.03629"
seo_title: "Large Language Model einfach erklärt · Hybridlog"
seo_description: "Was ist ein Large Language Model? Wie ChatGPT und Claude Text Wort für Wort vorhersagen, wo sie glänzen und warum sie manchmal Quellen erfinden."
---
