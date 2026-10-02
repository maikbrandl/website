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
    text: "Ein Large Language Model, kurz LLM, ist ein neuronales Netz mit Milliarden einstellbarer Werte, den Parametern. Im Training liest es Text und lernt, das nächste Wortstück vorherzusagen, den sogenannten Token. Beim Antworten wiederholt es diese Vorhersage Stück für Stück. Sein Wissen liegt in keiner Datenbank, es steckt verteilt in den Parametern."
  - type: icon_fakten
    titel_override: "Auf einen Blick"
    fakten:
      - icon: lightbulb
        label: "Ursprung"
        text: "Die Transformer Architektur stammt aus einem Google Paper von 2017."
      - icon: search
        label: "Größe"
        text: "GPT-3 hatte schon 2020 rund 175 Milliarden Parameter."
      - icon: shield
        label: "Grenze"
        text: "Modelle erfinden manchmal glaubwürdig klingende Falschaussagen, sogenannte Halluzinationen."
  - type: prozess
    titel_override: "So entsteht es"
    schritte:
      - titel: "Vortraining"
        untertitel: "Vorhersage des nächsten Tokens über Hunderte Milliarden Wortstücke"
        icon: lightbulb
      - titel: "Feinschliff"
        untertitel: "Menschen bewerten Antworten, das Modell passt sich daran an"
        icon: search
      - titel: "Antwort"
        untertitel: "Token für Token entsteht Text aus Wahrscheinlichkeiten"
        icon: check
  - type: textabschnitt
    titel_override: "Anwendung"
    text: "Stark ist ein LLM dort, wo sich das Ergebnis leicht prüfen lässt. Eine Mail umformulieren, einen langen Text zusammenfassen, Code erklären oder einen ersten Entwurf liefern gehört dazu. Heikel wird es bei Fakten ohne Quelle, bei Ereignissen nach dem Trainingsende und bei langen Rechenketten. Das Modell hat kein eingebautes Gespür dafür, wann es etwas nicht weiß. Es formuliert eine falsche Jahreszahl im selben ruhigen Ton wie eine richtige."
  - type: beispiel
    text: "Jemand bittet einen Chatbot um eine Studie zu Schlaf und Gedächtnis. Die Antwort nennt Autoren, Jahr und Zeitschrift, alles plausibel. Eine Suche in der Fachdatenbank findet den Artikel nicht."
    ergebnis: "Die Quelle war erfunden. Die Form stimmte, der Inhalt nicht."
  - type: liste
    titel_override: "Was du tun kannst"
    punkte:
      - "Zahlen, Namen und Quellen immer in einer zweiten Quelle nachsehen."
      - "Eigenen Kontext mitgeben, etwa den Text, um den es geht."
      - "Ausdrücklich fragen, wie sicher das Modell sich ist und warum."
      - "Keine Passwörter oder Gesundheitsdaten in einen Chat kopieren."
  - type: evidenz
    text: "Eine Übersichtsarbeit von Ji und Kollegen fand 2023 Halluzinationen in fast allen untersuchten Aufgaben, vom Zusammenfassen bis zum Dialog. Ein Grund liegt im Trainingsziel selbst. Belohnt wird plausibler Text, nicht wahrer."
    link_label: "Ji et al. (2023), Survey of Hallucination in Natural Language Generation"
    link_url: "https://arxiv.org/abs/2202.03629"
  - type: faq
    eintraege:
      - frage: "Versteht ein LLM, was es schreibt?"
        antwort: "Das ist umstritten. Sicher ist, dass es Muster in Sprache sehr genau abbildet und damit Aufgaben löst, die Verständnis zu verlangen scheinen. Ob dahinter ein Verstehen im menschlichen Sinn steckt, lässt sich mit heutigen Methoden nicht klar beantworten."
      - frage: "Ist ChatGPT ein LLM?"
        antwort: "ChatGPT ist eine Anwendung, in deren Kern ein LLM arbeitet. Dazu kommen Zusätze wie Websuche, Bildverarbeitung oder Regeln für den Ton. Dasselbe gilt für Claude, Gemini und ähnliche Chatbots."
      - frage: "Woher weiß ein LLM Dinge?"
        antwort: "Aus den Texten, mit denen es trainiert wurde. Es speichert sie nicht als Kopie, sondern als statistische Spuren in den Parametern. Deshalb kann es Wissen neu kombinieren, aber auch Details verwechseln."
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
