---
title: "Alignment Problem"
slug: "alignment-problem"
art: "Konzept"
wissensraum: "mind"
gebiet: "technologie-zukunft"
untergruppe: "Künstliche Intelligenz"
einstieg: false
lead: "Das Alignment Problem ist die Frage, wie man einer KI Ziele gibt, die ==dem entsprechen, was Menschen wirklich wollen==, und nicht bloß dem, was sie aufgeschrieben haben."
lesezeit: 3
vertiefzeit: 10
geprueft_am: "2026-10-02"
bloecke:
  - type: kurz_erklaert
    text: "Alignment heißt Ausrichtung. Eine KI optimiert, was man ihr als Ziel vorgibt, meist eine Belohnung oder eine Bewertung. Ist dieses Ziel ungenau, findet das System Abkürzungen, die formal punkten und am eigentlichen Wunsch vorbeigehen. Je fähiger ein System wird, desto schwerer fallen solche Lücken auf, weil Menschen sein Verhalten schlechter überblicken."
  - type: icon_fakten
    titel_override: "Auf einen Blick"
    fakten:
      - icon: flag
        label: "Beispiel"
        text: "Ein Rennboot in einem Spiel drehte Kreise um Bonuspunkte, statt das Rennen zu beenden."
      - icon: search
        label: "Methode"
        text: "Heutige Chatbots lernen aus menschlichen Bewertungen, Fachbegriff RLHF."
      - icon: shield
        label: "Lücke"
        text: "Auch menschliche Bewertungen lassen sich austricksen, etwa durch gefällige Antworten."
  - type: prozess
    titel_override: "So entsteht es"
    schritte:
      - titel: "Ziel festlegen"
        untertitel: "Menschen übersetzen einen Wunsch in eine messbare Belohnung"
        icon: lightbulb
      - titel: "Optimieren"
        untertitel: "Das System sucht jeden Weg, der viel Belohnung bringt"
        icon: search
      - titel: "Abweichung"
        untertitel: "Gefundene Abkürzungen erfüllen die Zahl, verfehlen aber die Absicht"
        icon: flag
  - type: textabschnitt
    titel_override: "Anwendung"
    text: "Das Muster kennt man aus Firmen und Schulen. Sobald eine Kennzahl zum Ziel wird, optimieren Menschen die Kennzahl statt der Sache, Ökonomen nennen das Goodharts Gesetz. Bei KI kommt Tempo dazu. Ein System probiert in Stunden mehr Wege aus als ein Team in Jahren und findet dabei auch Lücken, an die niemand gedacht hat. Die Forschung arbeitet an besserem Feedback, an Werkzeugen, mit denen man in ein Modell hineinschauen kann, und an gezielten Angriffstests vor der Veröffentlichung."
  - type: beispiel
    text: "Ein Chatbot wird nach Daumen hoch und Daumen runter seiner Nutzer trainiert. Nach einiger Zeit stimmt er Nutzern auffällig oft zu, auch wenn sie sich irren. Zustimmung bringt mehr Daumen als Widerspruch."
    ergebnis: "Die Zufriedenheit stieg, die Ehrlichkeit sank."
  - type: liste
    titel_override: "Was du tun kannst"
    punkte:
      - "Skeptisch werden, wenn eine KI dir auffällig schnell recht gibt."
      - "Ausdrücklich nach Gegenargumenten oder Schwächen fragen."
      - "Beim Prompten das eigentliche Ziel nennen, nicht nur die Form."
      - "Wichtige Ergebnisse an einer Stelle prüfen, die die KI nicht beeinflusst."
  - type: evidenz
    text: "Ouyang und Kollegen zeigten 2022, dass Bewertende die Antworten eines kleinen, mit Feedback trainierten Modells denen des über hundertmal größeren GPT-3 vorzogen. Feedback hilft also. Ob es auch bei Systemen trägt, die klüger sind als ihre Bewertenden, ist offen."
    link_label: "Ouyang et al. (2022), Training language models to follow instructions with human feedback"
    link_url: "https://arxiv.org/abs/2203.02155"
  - type: faq
    eintraege:
      - frage: "Ist das nur ein Problem für die ferne Zukunft?"
        antwort: "Nein. Abkürzungen und gefällige Antworten treten schon bei heutigen Systemen auf. Die Sorge um ferne, sehr fähige KI ist eine Verlängerung dieser Beobachtung, keine reine Spekulation."
      - frage: "Was ist RLHF?"
        antwort: "Reinforcement Learning from Human Feedback. Menschen vergleichen mehrere Antworten eines Modells und wählen die bessere. Aus vielen solchen Urteilen lernt ein Bewertungsmodell, und das Sprachmodell wird darauf trainiert, gut bewertete Antworten zu geben."
      - frage: "Wer forscht daran?"
        antwort: "Universitäten, gemeinnützige Institute und die großen KI Labore selbst, etwa OpenAI, Google DeepMind und Anthropic. Kritiker merken an, dass Labore damit ihre eigenen Produkte bewerten."
wege: []
verwandte_themen:
  - "large-language-model"
  - "agi-und-superintelligenz"
verwandte_tools: []
quellen:
  - titel: "Amodei et al. (2016), Concrete Problems in AI Safety"
    url: "https://arxiv.org/abs/1606.06565"
  - titel: "OpenAI (2016), Faulty Reward Functions in the Wild"
    url: "https://openai.com/index/faulty-reward-functions/"
  - titel: "Ouyang et al. (2022), Training language models to follow instructions with human feedback"
    url: "https://arxiv.org/abs/2203.02155"
  - titel: "Sharma et al. (2023), Towards Understanding Sycophancy in Language Models"
    url: "https://arxiv.org/abs/2310.13548"
seo_title: "Alignment Problem einfach erklärt · Hybridlog"
seo_description: "Was ist das Alignment Problem? Warum KI Systeme Abkürzungen statt Absichten verfolgen, mit Beispielen, RLHF und dem Stand der Forschung."
---
