# UTM-Schema für Pinterest-Kampagnen

Feste Struktur für alle Pinterest-Links (Pins, Boards, Ads), damit sie in Umami sauber
nach Kampagne/Thema/Format ausgewertet werden können.

## Schema

```
?utm_source=pinterest&utm_medium=social&utm_campaign=<thema>&utm_content=<pinformat>
```

| Parameter       | Bedeutung                          | Wert (fest)  |
|-----------------|-------------------------------------|--------------|
| `utm_source`    | Plattform                          | `pinterest`  |
| `utm_medium`    | Kanal-Typ                          | `social`     |
| `utm_campaign`  | Thema/Content-Cluster des Pins     | frei, kebab-case, z. B. `active-recall` |
| `utm_content`   | Pin-Format/Variante                | frei, kebab-case, z. B. `duell`, `karussell`, `zitat` |

## Beispiel

```
https://hybridlog.de/blog-artikel.html?slug=active-recall...&utm_source=pinterest&utm_medium=social&utm_campaign=active-recall&utm_content=duell
```

## Konventionen
- Immer alle 4 Parameter setzen, auch wenn `utm_content` optional wirkt (sonst fehlt die Formatunterscheidung in Umami).
- `utm_campaign` = Slug des Blogthemas/Fachgebiets (kebab-case, ohne Umlaute/Sonderzeichen).
- `utm_content` = Pin-Format, z. B. `duell` (Vergleich/Battle-Pin), `karussell`, `zitat`, `checkliste`, `infografik`.
- Keine Leerzeichen, keine Großbuchstaben, keine Umlaute in Parameterwerten.
