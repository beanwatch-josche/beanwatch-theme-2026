# Beanwatch Shopify-Theme 2026

Das neue, selbst gebaute Theme von **beanwatch.ch**. Es löst das gekaufte Theme «Local» von KrownThemes ab (Repo `beanwatch-theme`), geplant vor dem Swiss Coffee Festival am 31.10.2026.

Das Konzept zum Umzug steht in der Werkstatt: `beanwatch-website-2026/MIGRATION-SHOPIFY.md`.

---

## Wichtigste Regeln

- **Live bleibt bis zum Start das alte Theme.** Dieses hier ist in Shopify ein unveröffentlichtes Vorschau-Theme, verbunden mit dem Zweig `main`. Veröffentlicht wird es erst nach dem Entscheid «Go» (geplant Mo 26.10.).
- **Design und Verhalten kommen aus der Werkstatt.** Alle Dateien in `assets/`, die **nicht** mit `bw-` beginnen, kopiert `werkzeug/theme-export.rb` aus `beanwatch-website-2026`, zum Beispiel `seiten.css`, `hubs.js` und die Logos. Sie werden beim nächsten Export überschrieben. Ändern also immer in der Werkstatt, dann neu exportieren.
- **Was mit `bw-` beginnt, gehört diesem Theme:** Liquid-Vorlagen, Sektionen, Snippets und `assets/bw-theme.css` / `assets/bw-theme.js` (Menü, Warenkorb).
- **Shopify schreibt zurück.** Was im Theme-Editor gespeichert wird, landet als Commit auf `main` (Autor: Shopify). Vor jeder eigenen Änderung zuerst `git pull`.

---

## Was wo steht

| Ordner / Datei | Inhalt |
|---|---|
| `layout/theme.liquid` | Grundgerüst jeder Seite: Kopfdaten, Stile, Skripte, Kopf, Inhalt, Fuss, Warenkorb |
| `sections/bw-kopf.liquid`, `bw-fuss.liquid` | Kopfleiste und Fuss, übertragen aus `shell.js` der Werkstatt. Navigation fest im Code (Entscheid 05.10.2026) |
| `sections/header-group.json`, `footer-group.json` | Die Gruppen, in denen Kopf und Fuss stehen |
| `sections/bw-rezept.liquid` | **Rezeptseite** (Vorlage `article.rezept`, seit 0.2.0), übertragen aus `werkzeug/rezepte-bauen.rb` der Werkstatt. Liest Metafelder und Metaobjekte der Rezepte, siehe Kommentar oben in der Datei |
| `snippets/bw-rezept-*.liquid`, `bw-zahl`, `bw-datum` | Teile der Rezeptseite: strukturierte Daten (Recipe, Breadcrumb, FAQ), Nährwerte, Symbole, Zahlen und Daten in der Sprache der Seite |
| `sections/bw-rezepte.liquid` | **Rezeptübersicht** (Vorlage `blog.rezept-template`, seit 0.3.0), übertragen aus `rezepte.html` der Werkstatt. Kopf, Filterleiste und Raster aus `wissen.js`, Band zum Shop, Schema BreadcrumbList und ItemList |
| `snippets/bw-beitrag.liquid` | Ein Beitrag als Karte (wie `BWWissen.karte`) oder als JSON-Eintrag. Kurztitel, Teaser und Themen aus den Metafeldern `custom.kurztitel`, `custom.teaser`, `custom.themen` (seit 06.10.2026), sonst Titel und Auszug |
| `snippets/bw-beitraege-daten.liquid` | Der Bestand für `wissen.js` als JSON-Block `#bw-beitraege`: alle veröffentlichten Artikel der Blogs mit übersetzten Labels. Ohne den Block nimmt `wissen.js` seine feste Liste wie im Prototyp |
| `sections/bw-produkt-kaffee.liquid` | **Kaffeeseite** (seit 0.4.0) für alle drei Kaffee-Vorlagen `product.kaffee-mit-geschichte`, `product.kaffee-decaf-mit-geschich` und `product.kaffee-fermentation-gesch` (Namen wie im alten Theme, weil die Produkte darauf zeigen), übertragen aus `products/*.html` der Werkstatt. Bestehende Shop-Texte bleiben, neue Felder seit 06.10.2026 für das, was nur der Prototyp kannte; siehe Kommentar oben in der Datei. Fehlt ein Feld, fällt sein Teil weg. Seit 0.4.1 in der Reihenfolge des Prototyps: Farm-Bilder aus `custom.farm_bilder`, Zubereitungswerte mit Kommastellen (`zubereitungswert.wert`), ohne Schwesterprodukt die Karte zum Kombi-Partner («Passt gut dazu», Jaguara Summer) |
| `snippets/bw-kaufwahl.liquid` | Preis und Kauf: nur der Knopf, solange es keine Abo-Pläne gibt; mit Plänen (App «Shopify Subscriptions») «Einmal kaufen» oder «Im Abo» mit Intervall. `produkt.js` schreibt den Plan ins Feld `selling_plan` |
| `snippets/bw-produkt-schema.liquid` | Product und BreadcrumbList der Kaffeeseite, übertragen aus dem alten `microdata-schema.liquid` (Versand CHF 3.40, Lieferzeit, Rückgabe 14 Tage stehen dort zum Pflegen) |
| `snippets/bw-verwandte.liquid` | «Passt dazu» in Liquid, gleiche Auswahl wie `BWBeitrag.verwandte` |
| `snippets/bw-grundpreis`, `bw-gramm`, `bw-absaetze`, `bw-produkt-bild`, `bw-produkt-merkmale` | Kleine Teile der Kaffeeseite: Grundpreis je 100 g, Menge in Gramm, mehrzeiliger Shop-Text als Absätze, Bild und Merkmale eines Bildblocks |
| `snippets/bw-shop.liquid` | **Shop-Seite** (seit 0.5.0), übertragen aus `shop.html` der Werkstatt. Gerendert für `/collections` (Vorlage `list-collections`, im Menü «Shop» wie im bisherigen Shop, kanonische Adresse) und für `/collections/all`. Abschnitte Espresso, Filterkaffee (beide ohne Decaf), Decaf mit Sternen und Zubehör, je aus der gleichnamigen Kollektion in deren Reihenfolge im Shop. Leere Abschnitte und ihre Sprungknöpfe fallen weg. Die Überschrift zählt die Kaffee- und Buchkarten der Seite in Zahlwörtern («Zehn Kaffees, ein Buch.»). «Koffein ausrechnen» erscheint, sobald es eine Seite mit dem Handle `koffeinrechner` gibt |
| `sections/bw-kollektion.liquid`, `bw-kollektionen.liquid` | Kollektionen (seit 0.5.0): `/collections` und `/collections/all` zeigen die Shop-Seite, jede andere Kollektion Kopf mit Titel und Beschreibung aus dem Shop (bei Espresso und Filterkaffee mit Knopf zur Hub-Seite), Raster mit 24 Karten je Seite und das Band zum Shop |
| `snippets/bw-produkt-karte.liquid` | Produktkarte wie `article.produkt` im Prototyp. Fahne, Herkunft und Pillen aus `custom.karte_fahne`, `karte_herkunft`, `karte_noten` (seit 07.10.2026), sonst Herkunftsland · Region und die ersten zwei Geschmacksnoten. «Neu» in Pink, Decaf und alles ausser Kaffee mit Pillen in Cyan. Beim Buch «Nur noch N Stück» ab höchstens 10 an Lager. «+» als Formular auf `/cart/add` |
| `snippets/bw-sonne-wellen.liquid`, `bw-zahlwort.liquid` | Sonne und Wellen des hellen Seitenkopfs (Shop, Kollektionen, Rezeptübersicht); eine Zahl als Wort bis zwölf |
| `snippets/bw-dauer.liquid` | Dauer eines Rezepts für Karten aus der ISO-Zeit, Regeln wie `teaser-abgleichen.rb` |
| `sections/bw-*.liquid` (übrige) | Die Vorlagen der übrigen Seitentypen. Heute noch **Rohbau**: echte Inhalte, Preise und Warenkorb, aber noch ohne das Design aus dem Prototyp. Erkennbar an der gelben Marke «Rohbau» |
| `sections/bw-warenkorb-seite.liquid` | Warenkorbseite `/cart`, funktioniert auch ohne JavaScript |
| `snippets/bw-warenkorb.liquid` | Die Warenkorb-Schublade, gefüllt von `bw-theme.js` |
| `snippets/bw-kopfdaten.liquid` | Titel, Beschreibung, Canonical, Vorschaukarten. Die Shop-Seite trägt den Titel des Prototyps und die Meta-Beschreibung aus dem Shop-Metafeld `seo.collections_description` wie im alten Theme; `/collections/all` und getaggte Kollektionen zeigen kanonisch auf `/collections` bzw. die Kollektion |
| `snippets/bw-seitendaten.liquid` | Was die Skripte über die Seite wissen: `BW_SEITE`, der Start-Modus `BW_PLAN`, Adressen und Texte |
| `snippets/bw-navschluessel.liquid` | Welcher Navigationspunkt aktiv ist |
| `templates/*.json` | Welche Sektion auf welchem Seitentyp steht |
| `locales/de.default.json`, `en.json`, `fr.json` | **Alle festen Texte** in drei Sprachen (Entscheid 05.10.2026) |
| `config/settings_schema.json` | Einstellungen im Theme-Editor: Favicon und Autorenbild (gilt, wenn ein Artikel im Metafeld `custom.bild_des_autoren` keins hat) |

### Texte ändern ohne Code

Shopify-Admin → Onlineshop → Themes → bei diesem Theme «…» → **Standard-Theme-Inhalte bearbeiten**. Dort stehen alle Texte aus `locales/`, je Sprache. Gespeichert wird wieder als Commit auf `main`.

### Übersetzte Texte in Liquid

Shopify gibt Texte aus `| t` schon maskiert aus, ausser der Schlüssel endet auf `_html` (etwa `rezept.aktualisiert_html` mit dem `<time>`-Element). Nach `| t` deshalb nie `| escape`, sonst steht `&amp;#39;` im Text. Texte für Skripte (Portionen, Bewertung) stehen als `data-text-*` am Element; ohne sie fallen die Skripte auf Deutsch zurück. Für `wissen.js` stehen sie unter `texte` im Datenblock.

### Start-Modus im Theme

Im Prototyp legt der `PLAN` in `start.js` fest, welche Guides sichtbar sind. Im Theme rendert Liquid denselben Plan aus den **veröffentlichten** Artikeln der Blogs `brew-guides` und `barista-guides` (`snippets/bw-seitendaten.liquid`). Einen Guide sichtbar machen heisst hier also: ihn in Shopify veröffentlichen. Links auf Ausgeblendetes baut Liquid gar nicht erst (`{% if blogs['brew-guides'].articles_count > 0 %}`).

---

## Neu exportieren aus der Werkstatt

Im Ordner der Werkstatt `beanwatch-website-2026`:

```bash
LANG=en_US.UTF-8 ruby werkzeug/theme-export.rb /Pfad/zu/beanwatch-theme-2026
```

Ohne Pfad sucht das Skript `../beanwatch-theme-2026` neben der Werkstatt (oder die Umgebungsvariable `BW_THEME`). Es meldet, was neu oder geändert ist (ein zweiter Lauf ohne Änderung in der Werkstatt meldet 0), und alles, was es nicht übersetzen kann (heute: `beutel.js` baut Logo-Pfade zur Laufzeit). Danach hier committen und pushen; Shopify übernimmt es ins Vorschau-Theme.

---

## Prüfen

Vor jedem Push:

- **Theme Check** von Shopify, mit der Shopify CLI im Theme-Ordner: `shopify theme check`. Erwartet sind nur die 7 Warnungen `RemoteAsset` in `layout/theme.liquid` (GSAP von jsDelivr, wie im Prototyp). Fehler darf es keine geben.
- **Vorschau in Shopify:** Onlineshop → Themes → dieses Theme → «Vorschau». Englisch und Französisch über den Sprachwähler oder `/en`, `/fr` in der Adresse.

Das Gerüst 0.1.0 wurde vor dem ersten Push so geprüft (05.10.2026): Theme Check wie oben; alle Seitentypen mit Testdaten gerendert und im Browser bei 1440 und 375 px angesehen (Deutsch, Englisch, Französisch), ohne Skriptfehler; Warenkorb-Schublade gegen eine nachgebildete Cart-API (hinzufügen, plus, minus, entfernen, Fehlerfall, Escape, Französisch mit `/fr`). In echtem Shopify noch nicht geprüft.

Die Rezeptvorlage 0.2.0 wurde so geprüft (06.10.2026): echte Daten von Iced Latte, Espresso Tonic und dem Entwurf Flat White aus der Admin API, gerendert mit einer Nachbildung von Shopify-Liquid (Metafelder mit `.value`, maskierte Übersetzungen, strenge Vergleiche) in Deutsch, Englisch und Französisch, dazu ein Rezept ohne Nährwerte, Equipment, FAQ und Bewertung. JSON-LD Feld für Feld gegen den Prototyp verglichen. Im Browser bei 1440 und 375 px: Portionen, Bewertung gegen ein nachgebildetes Supabase (keine Teststimme in der echten Tabelle), Schema-Nachführung, Anker `#schritt-N` und `#step-N`, verwandte Rezepte.

Die Kaffeeseite 0.4.0 wurde so geprüft (06.10.2026): alle 10 Kaffees mit echten Daten aus einem Bulk-Export der Admin API gerendert, dazu Englisch, Französisch, ausverkauft, ein Kaffee mit vielen leeren Feldern und zwei Fälle mit nachgebildeten Abo-Plänen (10 %, alle 2, 4 und 6 Wochen). Im Browser bei 1440 und 375 px: keine Skriptfehler, kein Querscrollen, Noten, Meter, Zähler, Galerie, Inhaltsverzeichnis nur mit vorhandenen Ankern, JSON-LD lesbar, keine verzerrten Bilder; Kauf gegen eine nachgebildete Cart-API: ohne Abo nur `id`, mit Abo `selling_plan` des gewählten Intervalls, zurück auf «Einmal» ohne `selling_plan`. «Passt dazu» ohne JavaScript gleich wie mit. Mit echten Abo-Plänen noch nicht geprüft: Sie gibt es erst mit der App. Seit 0.4.1 vergleicht ein Skript jede Kaffeeseite Element für Element mit dem Prototyp (Abschnitte, Kaufbereich, Fakten, Noten, Galerie, Inhaltsverzeichnis, Bildblöcke, Merkmale, Farm-Bilder, Karten, Zubereitung); gewollt anders sind nur die Kaufwahl ohne Abo-Pläne, der Shop-Wortlaut von Story und Farm und das vierte Galeriebild bei Jaguara Summer.

Shop und Kollektionen 0.5.0 wurden so geprüft (07.10.2026): alle 11 Produkte und alle 11 Kollektionen (Reihenfolge wie im Shop) aus der Admin API, gerendert für `/collections`, `/collections/all`, Espresso, Filterkaffee, Decaf, Zubehör, eine leere Kollektion, eine mit 30 Produkten auf zwei Seiten und eine getaggte, in Deutsch, Englisch und Französisch, dazu eine Variante ohne Zubehör, mit Koffeinrechner, einem ausverkauften Kaffee und einem Kaffee ohne Kartenfelder. Im Browser bei 1440 und 375 px: keine Skriptfehler, kein Querscrollen, JSON-LD lesbar, keine verzerrten Bilder, Kartenzahl und Spalten je Abschnitt wie im Prototyp, Sterne im Decaf, «+» schickt die Variante an die nachgebildete Cart-API und öffnet die Schublade, ein Klick aufs Kartenbild führt zur Produktseite. Screenshot neben `shop.html`: gleich bis auf den fünften Espresso (Apas), die Reihenfolge der Decafs («Bestseller» im Shop) und die gezählte Überschrift.

**Galerie (seit 0.4.2):** `image_tag` setzt ohne `widths` von sich aus ein `srcset`. Beim Hauptbild der Galerie steht deshalb `srcset: nil`, denn `produkt.js` tauscht beim Klick auf ein Vorschaubild nur `src`; mit `srcset` bliebe das alte Bild stehen. Die Nachbildung zum Prüfen setzt das Standard-`srcset` seither genauso. In der Vorschau bestätigt (07.10.2026).

**Bilder:** Shopify schreibt mit `image_tag` immer `width` und `height` ans Bild. Wo das CSS nur Breite und Seitenverhältnis vorgibt, braucht es `height:auto` (steht seit 06.10.2026 im Grundstil `img` in `beanwatch.css`), sonst wird das Bild verzerrt oder zum Streifen. Die Nachbildung zum Prüfen setzt die Attribute seither genauso und misst jedes Bild gegen den Prototyp.

### Beim ersten Vorschau-Theme in Shopify prüfen

- Zählt `blogs['brew-guides'].articles_count` nur veröffentlichte Artikel, und fehlen unveröffentlichte in `blogs[…].articles`? Davon hängt der Start-Modus ab (im Quelltext der Seite muss `window.BW_PLAN` je Blog `{}` zeigen, solange kein Guide veröffentlicht ist).
- Stimmen die Navigationspunkte auf Espresso-, Filterkaffee- und Decaf-Produkten (aktiver Punkt)?
- Warenkorb mit einem echten Produkt: hinzufügen, Menge ändern, zur Kasse.
- Kaffeeseite (seit 0.4.0), etwa `/products/guji-megadu-espresso`: Brotkrumen und aktiver Navigationspunkt, «Zur Rezeptur» auf die Hub-Seite, Preis und Grundpreis im Format des Shops.
- Shop (seit 0.5.0), `/collections`: Überschrift «Zehn Kaffees, ein Buch.», Preise im Format des Shops, «+» legt in den Warenkorb und öffnet die Schublade, «Nur noch 7 Stück» beim Buch. `/collections/all` zeigt dieselbe Seite mit Canonical auf `/collections`.
- Nach der Installation von «Shopify Subscriptions»: Wie heissen die Pläne? Die Intervall-Auswahl zeigt die erste Option des Plans (etwa «4 Wochen») hinter «Lieferung alle», sonst den Plannamen. Vorgewählt ist der Plan, dessen Name «4 » enthält.

---

## Shopify verbinden (einmalig, Joscha)

1. Shopify-Admin → **Onlineshop → Themes** → bei der Theme-Bibliothek **Theme hinzufügen** → **Über GitHub verbinden**.
2. Konto `beanwatch-josche`, Repository `beanwatch-theme-2026`, Zweig **`main`** → **Verbinden**.
3. Es erscheint ein unveröffentlichtes Theme «beanwatch-theme-2026/main». **Nicht veröffentlichen.**

Ein einmal getrennter Zweig lässt sich nicht wieder mit demselben Theme verbinden, er wird dann ein neues Theme. Also verbinden und verbunden lassen.
