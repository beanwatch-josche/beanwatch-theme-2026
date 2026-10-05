/* ==========================================================================
   Beanwatch · Kaffeewissen
   Ein Bestand für alle Wissensinhalte: Artikel, Rezepte, Brew Guides und
   Tools. Kaffeewissen ist hier bewusst weit gefasst, so wie Joscha es meint.

   Die Daten spiegeln den Shopify-Stand vom 5. September 2026. Beim Übertrag
   ins Theme werden daraus Liquid-Schleifen über beide Blogs plus die
   statischen Guide- und Tool-Seiten.
   ========================================================================== */

window.BWWissen = (function () {
  'use strict';

  const CDN = 'https://cdn.shopify.com/s/files/1/0936/9409/9833/articles/';

  // Start-Modus (start.js): Geplantes und Ausgeblendetes erscheint nur in
  // der Entwurfsansicht. Ohne start.js steht alles wie bisher.
  const eintrag = (b) => !window.BWStart || BWStart.eintrag(b);

  /* art:    wissen | rezept | guide | tool
     themen: für die Filterleiste
     stand:  live | geplant                                                */
  const BEITRAEGE = [

    /* ---------- Brew Guides (neu, gibt es bisher nicht) ---------- */
    {
      art: 'guide', titel: 'Hario V60: Der Einstieg in den Handfilter',
      text: 'Rezept, Mahlgrad und Zeitplan für die klarste Tasse. Mit Timer, der Dich durch den Aufguss führt.',
      themen: ['filter', 'zubereitung'], datum: '', dauer: '5 Min.',
      ziel: '/blogs/brew-guides/hario-v60.html', geraet: 'v60', stand: 'live'
    },
    {
      art: 'guide', titel: 'Chemex: Für zwei und mehr',
      text: 'Dickeres Papier, längere Kontaktzeit, sehr saubere Tasse. Der Guide für die grosse Runde.',
      themen: ['filter', 'zubereitung'], datum: '', dauer: '6 Min.',
      ziel: '/blogs/brew-guides/hario-v60.html', geraet: 'chemex', stand: 'geplant'
    },
    {
      art: 'guide', titel: 'French Press ohne Satz in der Tasse',
      text: 'Die einfachste Methode überhaupt, und ein Trick, mit dem kein Kaffeesatz mehr mitkommt.',
      themen: ['filter', 'zubereitung'], datum: '', dauer: '4 Min.',
      ziel: '/blogs/brew-guides/hario-v60.html', geraet: 'frenchpress', stand: 'geplant'
    },
    {
      art: 'guide', titel: 'AeroPress: Schnell, robust, reisetauglich',
      text: 'Zwei Rezepte, klassisch und invertiert. Funktioniert mit fast jeder Bohne.',
      themen: ['filter', 'zubereitung'], datum: '', dauer: '5 Min.',
      ziel: '/blogs/brew-guides/hario-v60.html', geraet: 'aeropress', stand: 'geplant'
    },
    {
      art: 'guide', titel: 'Cold Brew ansetzen',
      text: 'Kalt angesetzt, über Nacht gezogen. Die Basis für jeden Sommerdrink.',
      themen: ['filter', 'kalt'], datum: '', dauer: '3 Min.',
      ziel: '/blogs/brew-guides/hario-v60.html', geraet: 'coldbrew', stand: 'geplant'
    },

    /* ---------- Barista Guides: Espresso je Maschinentyp ----------
       Die Brew Guides oben sind nach Filtergerät sortiert, diese hier nach
       Espressomaschine. Beide erklären zusätzlich das Milchaufschäumen.
       Seit 30.09.2026 mit Foto, dieselben wie in BARISTA_GUIDES (hubs.js).
       Der Zweikreiser hat noch keins und zeigt den Platzhalter. */
    {
      art: 'baristaguide', titel: 'Einkreiser: Espresso und Milch nacheinander',
      text: 'Ein Kessel für beides. Erst brühen, dann umschalten und warten, bis der Dampf da ist.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: '6 Min.',
      ziel: '/blogs/barista-guides/einkreiser.html', maschine: 'einkreiser', stand: 'live',
      bild: 'https://cdn.shopify.com/s/files/1/0936/9409/9833/files/beanwatch-espressomaschine.webp?v=1766938882'
    },
    {
      art: 'baristaguide', titel: 'Zweikreiser: Brühen und Schäumen gleichzeitig',
      text: 'Wärmetauscher im Dampfkessel. Dafür braucht es vor jedem Bezug den Cooling Flush.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: '7 Min.',
      ziel: '/blogs/barista-guides/zweikreiser.html', maschine: 'zweikreiser', stand: 'live'
    },
    {
      art: 'baristaguide', titel: 'Thermoblock: schnell bereit, heikel bei der Temperatur',
      text: 'Kein Kessel, nur eine beheizte Leitung. In zwei Minuten startklar, dafür schwankt es.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: '6 Min.',
      ziel: '/blogs/barista-guides/thermoblock.html', maschine: 'thermoblock', stand: 'live',
      bild: 'https://cdn.shopify.com/s/files/1/0936/9409/9833/files/beanwatch-espresso-in-milk-pitcher.webp?v=1778863887'
    },
    {
      art: 'baristaguide', titel: 'Kaffeevollautomat richtig einstellen',
      text: 'Mahlgrad, Menge und Reinigung. Drei Stellschrauben, die die meisten nie anfassen.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: '6 Min.',
      ziel: '/blogs/barista-guides/kaffeevollautomat.html', maschine: 'vollautomat', stand: 'live',
      bild: 'https://cdn.shopify.com/s/files/1/0936/9409/9833/files/beanwatch-kaffeevollautomat.webp?v=1766918668'
    },
    {
      art: 'baristaguide', titel: 'Kapselmaschine: mehr herausholen, als drinsteht',
      text: 'Wenig einzustellen, aber Wassermenge, Tasse und Kalk machen hörbar den Unterschied.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: '5 Min.',
      ziel: '/blogs/barista-guides/kapselmaschine.html', maschine: 'kapsel', stand: 'live',
      bild: 'https://cdn.shopify.com/s/files/1/0936/9409/9833/files/beanwatch-kapselmaschine.webp?v=1766927627'
    },
    {
      art: 'baristaguide', titel: 'Bialetti: der Klassiker am Herd',
      text: 'Kein Espresso im engeren Sinn, aber mit kleiner Hitze und heissem Wasser richtig gut.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: '5 Min.',
      ziel: '/blogs/barista-guides/bialetti.html', maschine: 'bialetti', stand: 'live',
      bild: 'https://cdn.shopify.com/s/files/1/0936/9409/9833/files/beanwatch-mokkakanne.webp?v=1767000228'
    },

    /* ---------- Tools ---------- */
    {
      art: 'tool', titel: 'Maschinenfinder',
      text: 'Vier Fragen zu Deinem Alltag, dann weisst Du, welche Espressomaschine zu Dir passt.',
      themen: ['espresso', 'zubereitung'], datum: '', dauer: 'Fragebogen',
      ziel: '/welche-espressomaschine.html', stand: 'live', maschine: 'zweikreiser'
    },
    {
      art: 'tool', titel: 'Kaffeefinder',
      text: 'Drei Fragen zu Maschine und Geschmack, dann steht da, welcher Kaffee zu Dir passt.',
      themen: ['grundlagen'], datum: '', dauer: 'Fragebogen',
      ziel: '/welcher-kaffee.html', stand: 'live'
    },
    {
      art: 'tool', titel: 'Methodenfinder',
      text: 'Höchstens drei Fragen zu Deinem Alltag, dann weisst Du, welche Filtermethode zu Dir passt.',
      themen: ['filter', 'zubereitung'], datum: '', dauer: 'Fragebogen',
      ziel: '/welche-filtermethode.html', stand: 'live', geraet: 'v60'
    },
    {
      art: 'tool', titel: 'Koffeinrechner',
      text: 'Wie viel Koffein steckt in Deinem Tag und wie viel davon ist beim Schlafengehen noch übrig?',
      themen: ['koffein'], datum: '', dauer: 'Rechner',
      ziel: '/tool-koffeinrechner.html', stand: 'live'
    },
    {
      art: 'tool', titel: 'Wasserhärte-Rechner',
      text: 'Aus der Härte Deines Leitungswassers die passende Empfehlung für Filter und Maschine.',
      themen: ['wasser', 'zubereitung'], datum: '', dauer: 'Rechner',
      ziel: '/tool-wasserhaerte.html', stand: 'live'
    },
    {
      art: 'tool', titel: 'Brew-Ratio-Rechner',
      text: 'Kaffeemenge, Wassermenge und Verhältnis ineinander umrechnen, für jede Methode.',
      themen: ['zubereitung', 'filter'], datum: '', dauer: 'Rechner',
      ziel: '/tools.html', stand: 'geplant'
    },
    {
      art: 'tool', titel: 'Röstgrad-Vergleich',
      text: 'Was hell, mittel und dunkel geröstet für Geschmack, Säure und Körper bedeuten.',
      themen: ['grundlagen'], datum: '', dauer: 'Vergleich',
      ziel: '/tools.html', stand: 'geplant'
    },

    /* ---------- Kaffeewissen im engeren Sinn ---------- */
    {
      art: 'wissen', titel: 'Wie Kaffee die Schweiz eroberte: 400 Jahre Kaffeegeschichte',
      text: 'Kaffeeverbote, Milchkaffee und Nespresso: 400 Jahre Schweizer Kaffeegeschichte auf einen Blick.',
      themen: ['grundlagen'], datum: '5. Juni 2026', dauer: '20 Min.',
      bild: CDN + 'kaffee-erlebnis-schweiz-kaffeegeschichte_1f0b13d3-5143-4a09-8a3e-b0c6394613ef.webp?v=1780678694',
      ziel: '/blogs/kaffeewissen/kaffee-schweiz-geschichte.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'So gelingt Dir der Café Crème an der Siebträgermaschine',
      text: 'Vom Klassiker zum Geheimtipp: Warum der Café Crème besser ist als Du denkst.',
      themen: ['espresso', 'zubereitung'], datum: '29. März 2026', dauer: '7 Min.',
      bild: CDN + 'cafe-creme-hero_ea9bf178-137e-48d1-b939-fc8f31c7a591.webp?v=1782500241',
      ziel: '/blogs/kaffeewissen/cafe-creme-siebtrager-rezept.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Latte Macchiato: Das Kaffeegetränk für Einsteiger',
      text: 'Ein milder Klassiker im Glas mit sichtbarer Dreischichtung. Rezept, Kalorien und Koffein.',
      themen: ['espresso', 'milch', 'koffein'], datum: '27. Februar 2026', dauer: '8 Min.',
      bild: CDN + 'latte-macchiato_557f207b-5555-4543-a0ea-b89a957f33f4.webp?v=1780174563',
      ziel: '/blogs/kaffeewissen/latte-macchiato.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Cortado Kaffee Guide: Alles zum Espresso Klassiker',
      text: 'Ein spanischer Klassiker erobert die Welt, mit Specialty Coffee in frischem Gewand.',
      themen: ['espresso', 'milch'], datum: '17. Februar 2026', dauer: '8 Min.',
      bild: CDN + 'cortado-kaffee_45c4d103-b8af-4217-b036-282d926f4b2f.webp?v=1782500338',
      ziel: '/blogs/kaffeewissen/cortado-kaffee-guide-alles-zum-espresso-klassiker.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Koffein im Kaffee: Wirkung, Gehalt und Dauer im Körper',
      text: 'Wie viel Koffein in Deiner Tasse steckt, wie lange es wirkt und was vor dem Schlafen übrig ist.',
      themen: ['koffein', 'grundlagen'], datum: '7. Februar 2026', dauer: '23 Min.',
      bild: CDN + 'koffein-wirkung-dauer_9aac1834-fb5e-4202-9d8b-fea2c5cd958f.webp?v=1776616350',
      ziel: '/blogs/kaffeewissen/koffein-im-kaffee-wie-viel-steckt-drin-wie-wirkt-es-und-wie-lange-halt-es-an.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Flat White: Herkunft, Zubereitung und Unterschiede erklärt',
      text: 'Was ein Flat White ist, was er nicht ist und wie Du ihn zuhause hinbekommst.',
      themen: ['espresso', 'milch'], datum: '24. Januar 2026', dauer: '6 Min.',
      bild: CDN + 'beanwatch-flat-white_eacfffa5-4ebd-4b95-868e-3fe139f0a1f2.webp?v=1775977830',
      ziel: '/blogs/kaffeewissen/flat-white-guide-und-rezept.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Cappuccino: Der italienische Kaffeeklassiker einfach erklärt',
      text: 'Was ein Cappuccino wirklich ist und wovon Koffein und Kalorien abhängen.',
      themen: ['espresso', 'milch', 'koffein'], datum: '21. Januar 2026', dauer: '8 Min.',
      bild: CDN + 'der-cappuccino_f565c958-39e8-41ba-93b0-76392d27a7a2.webp?v=1782497203',
      ziel: '/blogs/kaffeewissen/wie-macht-man-cappuccino.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Espresso Macchiato: Ein kleiner Milchtupfer bitte',
      text: 'Wie aus einem kleinen Milchfleck ein eigener Klassiker der Kaffeekultur wurde.',
      themen: ['espresso', 'milch'], datum: '14. Januar 2026', dauer: '6 Min.',
      bild: CDN + 'espresso-macchiato-milchtropfen_5374dda7-1363-4bef-8111-e53391fb6e2c.webp?v=1780170172',
      ziel: '/blogs/kaffeewissen/espresso-macchiato-ein-kleiner-milchtupfer-fur-den-espresso-bitte.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Welche Milch schäumt am besten?',
      text: 'Tierisch oder pflanzlich, und worauf es für stabilen, feinporigen Milchschaum ankommt.',
      themen: ['milch', 'espresso'], datum: '12. Dezember 2025', dauer: '6 Min.',
      bild: CDN + 'welche-milch-schaeumt-am-besten_c3f81acb-3df2-49ae-a14b-5812c0b99f63.webp?v=1782715510',
      ziel: '/blogs/kaffeewissen/welche-milch-schaeumt-am-besten.html', stand: 'live'
    },
    {
      art: 'wissen', titel: 'Was ist Specialty Coffee?',
      text: 'Ein Blick hinter den Begriff: warum Herkunft, Qualität und Handwerk dabei zentral sind.',
      themen: ['grundlagen'], datum: '29. November 2025', dauer: '16 Min.',
      bild: CDN + 'jusqa-latte-art.webp?v=1782716163',
      ziel: '/blogs/kaffeewissen/was-ist-specialty-coffee.html', stand: 'live'
    },

    /* ---------- Rezepte ---------- */
    {
      art: 'rezept', titel: 'Espresso Tonic', text: 'Fruchtiger Espresso auf spritzigem Tonic. Der Sommerhit im Glas.',
      themen: ['kalt', 'espresso'], datum: '3. Juli 2026', dauer: '5 Minuten', bewertung: '4,7',
      bild: CDN + 'espresso-tonic-hero-beanwatch_281d4fe9-6ef4-40ba-8ac5-f9bc24149b76.webp?v=1783272356',
      ziel: '/blogs/kaffeerezepte/espresso-tonic-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Freddo Cappuccino', text: 'Geshakter Espresso mit kaltem Milchschaum, der griechische Klassiker.',
      themen: ['kalt', 'espresso', 'milch'], datum: '26. Juni 2026', dauer: '10 Minuten', bewertung: '5,0',
      bild: CDN + 'beanwatch-freddo-cappuccino-trinken_d3747f17-28c3-41c1-aa63-74933e02e8f0.webp?v=1783272424',
      ziel: '/blogs/kaffeerezepte/freddo-cappuccino-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Dirty Matcha Latte', text: 'Japanische Teekultur trifft moderne Kaffeekultur, mit markanter Optik.',
      themen: ['kalt', 'milch'], datum: '19. Juni 2026', dauer: '15 Minuten', bewertung: '5,0',
      bild: CDN + 'bw-dirty-matcha-latte-hero-japan_77ceec89-5439-4024-b56e-c4d8b4cfd5cc.webp?v=1783160740',
      ziel: '/blogs/kaffeerezepte/dirty-matcha-latte-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Iced Latte', text: 'Espresso, Milch und Eiswürfel. Schnell gemacht, perfekt für warme Tage.',
      themen: ['kalt', 'milch', 'espresso'], datum: '12. Juni 2026', dauer: '5 Minuten', bewertung: '5,0',
      bild: CDN + 'bw-iced-latte-rezept-hero_98a03c07-05a8-4920-8081-3fed61981011.webp?v=1783160546',
      ziel: '/blogs/kaffeerezepte/iced-latte-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Affogato al caffè', text: 'Vanilleeis mit fruchtigem Espresso, mit unserem Glace-Rezept ohne Ei.',
      themen: ['kalt', 'espresso'], datum: '29. Mai 2026', dauer: '1 Std. 45 Min.', bewertung: '5,0',
      bild: CDN + 'beanwatch-affogato-hero_c888c77f-238c-485f-a728-ca036d02eb90.webp?v=1781537293',
      ziel: '/blogs/kaffeerezepte/affogato-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Café Frappé mit Espresso', text: 'Cremig, kalt und schnell: Espresso, Milch und Eis in einem Glas Sommergefühl.',
      themen: ['kalt', 'espresso', 'milch'], datum: '16. Mai 2026', dauer: '5 Minuten', bewertung: '4,3',
      bild: CDN + 'beanwatch-cafe-frappe-hero_8a30ab9e-c5a1-4216-8aec-f21f6ee2ed79.webp?v=1783272573',
      ziel: '/blogs/kaffeerezepte/cafe-frappe-rezept-mit-espresso.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Cold Brew Tonic', text: 'Spritziger Cold Brew mit Tonic Water und Orange.',
      themen: ['kalt', 'filter'], datum: '1. Mai 2026', dauer: '18 Stunden', bewertung: '5,0',
      bild: CDN + 'cold-brew-tonic-hero-julia-sup-board_ece80b4f-877c-4ef7-83ef-7c304f122c7e.webp?v=1780162527',
      ziel: '/blogs/kaffeerezepte/cold-brew-tonic-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Cold Brew Grundrezept', text: 'Mild, rund und die Basis für alle kalten Kaffeegetränke.',
      themen: ['kalt', 'filter'], datum: '24. April 2026', dauer: '18 Stunden', bewertung: '5,0',
      bild: CDN + 'coldbrew-zuhause_af7fb6c1-bfc2-4b3b-9571-41151fa0890c.webp?v=1780128700',
      ziel: '/blogs/kaffeerezepte/cold-brew.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Espresso Martini', text: 'Espresso, Kaffeelikör und Vodka mit stabiler Schaumkrone.',
      themen: ['espresso'], datum: '10. Januar 2026', dauer: '5 Minuten',
      bild: CDN + 'espresso-martini_767145cf-3f9e-453e-b4cc-5b4b1db75e7a.webp?v=1781634685',
      ziel: '/blogs/kaffeerezepte/espresso-martini-rezept.html', stand: 'live'
    },

    /* Die Klassiker aus Espresso und Milch. Sie stehen als Anleitung hier,
       ihre Hintergründe im jeweiligen Wissensartikel. */
    {
      art: 'rezept', titel: 'Flat White Rezept', text: 'Doppelter Espresso, feinporiger Mikroschaum, kleine Tasse.',
      themen: ['espresso', 'milch'], datum: '24. Januar 2026', dauer: '5 Minuten',
      bild: CDN + 'beanwatch-flat-white_eacfffa5-4ebd-4b95-868e-3fe139f0a1f2.webp?v=1775977830',
      ziel: '/blogs/kaffeerezepte/flat-white-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Cappuccino Rezept', text: 'Espresso, Milch und Schaum zu gleichen Teilen. Der Klassiker.',
      themen: ['espresso', 'milch'], datum: '21. Januar 2026', dauer: '5 Minuten',
      bild: CDN + 'der-cappuccino_f565c958-39e8-41ba-93b0-76392d27a7a2.webp?v=1782497203',
      ziel: '/blogs/kaffeerezepte/cappuccino-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Latte Macchiato Rezept', text: 'Milch zuerst, Espresso danach. So entsteht die Dreischichtung.',
      themen: ['espresso', 'milch'], datum: '27. Februar 2026', dauer: '6 Minuten',
      bild: CDN + 'latte-macchiato_557f207b-5555-4543-a0ea-b89a957f33f4.webp?v=1780174563',
      ziel: '/blogs/kaffeerezepte/latte-macchiato-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Cortado Rezept', text: 'Eins zu eins, Espresso und Milch. Klein, kräftig, spanisch.',
      themen: ['espresso', 'milch'], datum: '17. Februar 2026', dauer: '5 Minuten',
      bild: CDN + 'cortado-kaffee_45c4d103-b8af-4217-b036-282d926f4b2f.webp?v=1782500338',
      ziel: '/blogs/kaffeerezepte/cortado-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Espresso Macchiato Rezept', text: 'Ein Espresso mit einem Fleck Milch. Klassisch oder mit Latte Art.',
      themen: ['espresso', 'milch'], datum: '14. Januar 2026', dauer: '4 Minuten',
      bild: CDN + 'espresso-macchiato-milchtropfen_5374dda7-1363-4bef-8111-e53391fb6e2c.webp?v=1780170172',
      ziel: '/blogs/kaffeerezepte/espresso-macchiato-rezept.html', stand: 'live'
    },
    {
      art: 'rezept', titel: 'Café Crème Rezept', text: 'Der lange Bezug aus der Siebträgermaschine, mit gröberem Mahlgrad.',
      themen: ['espresso', 'zubereitung'], datum: '29. März 2026', dauer: '5 Minuten',
      bild: CDN + 'cafe-creme-hero_ea9bf178-137e-48d1-b939-fc8f31c7a591.webp?v=1782500241',
      ziel: '/blogs/kaffeerezepte/cafe-creme-rezept.html', stand: 'live'
    }
  ];

  const ARTEN = {
    wissen: { label: 'Wissen', klasse: 'beitrag-art--wissen' },
    rezept: { label: 'Rezept', klasse: 'beitrag-art--rezept' },
    guide:  { label: 'Brew Guide', klasse: 'beitrag-art--guide' },
    baristaguide: { label: 'Barista Guide', klasse: 'beitrag-art--guide' },
    tool:   { label: 'Tool', klasse: 'beitrag-art--tool' }
  };

  const FILTER = [
    { schluessel: 'alle',        titel: 'Alles' },
    { schluessel: 'art:wissen',  titel: 'Artikel' },
    { schluessel: 'art:rezept',  titel: 'Rezepte' },
    { schluessel: 'art:guide',   titel: 'Brew Guides' },
    { schluessel: 'art:baristaguide', titel: 'Barista Guides' },
    { schluessel: 'art:tool',    titel: 'Tools' },
    { schluessel: 'espresso',    titel: 'Espresso' },
    { schluessel: 'filter',      titel: 'Filterkaffee' },
    { schluessel: 'milch',       titel: 'Milch' },
    { schluessel: 'kalt',        titel: 'Kalte Drinks' },
    { schluessel: 'koffein',     titel: 'Koffein' },
    { schluessel: 'grundlagen',  titel: 'Grundlagen' }
  ];

  /* ------------------------------------------------------------------
     Eine Karte bauen
     ------------------------------------------------------------------ */
  function karte(b) {
    const art = ARTEN[b.art];

    // Brew Guides und Tools haben kein Foto, dafür die eigene Illustration.
    // Barista Guides haben seit 30.09.2026 eins. Fehlt es noch, steht der
    // Platzhalter wie auf den Karten des Espresso-Hubs, nicht das Schnittbild.
    let bild;
    if (b.bild) {
      bild = `<span class="beitrag-bild"><img src="${b.bild}" alt="" loading="lazy"></span>`;
    } else if (b.art === 'baristaguide') {
      bild = `<span class="beitrag-bild ist-leer"><span class="foto-folgt">Foto folgt</span></span>`;
    } else if (b.geraet && window.bwGeraet) {
      bild = `<span class="beitrag-bild ist-leer">${bwGeraet(b.geraet)}</span>`;
    } else if (b.maschine && window.bwMaschine) {
      bild = `<span class="beitrag-bild ist-leer">${bwMaschine(b.maschine)}</span>`;
    } else {
      bild = `<span class="beitrag-bild ist-leer">
        <svg viewBox="0 0 24 24" fill="none" stroke="#004B5C" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
        </svg></span>`;
    }

    const rechts = b.bewertung
      ? `<span>★ ${b.bewertung}</span>`
      : (b.stand === 'geplant' ? '<span>In Arbeit</span>' : `<span>${b.dauer}</span>`);

    return `
      <a class="beitrag" href="${b.ziel}" data-art="${b.art}" data-themen="${(b.themen || []).join(' ')}">
        ${bild}
        <span class="beitrag-koerper">
          <span class="beitrag-art ${art.klasse}"><i class="punkt"></i>${art.label}</span>
          <h3>${b.titel}</h3>
          <p>${b.text}</p>
          <span class="fusszeile"><span>${b.datum || b.dauer}</span>${rechts}</span>
        </span>
      </a>`;
  }

  /* ------------------------------------------------------------------
     Raster mit Filterleiste
     ------------------------------------------------------------------ */
  function raster(zielRaster, zielFilter, vorauswahl) {
    const rasterEl = document.querySelector(zielRaster);
    if (!rasterEl) return;

    // Ein Filter ohne einen einzigen sichtbaren Treffer fällt weg, etwa
    // «Brew Guides», solange alle Guides ausgeblendet sind.
    const filter = FILTER.filter(f => f.schluessel === 'alle' || BEITRAEGE.some(b => eintrag(b) && passt(b, f.schluessel)));
    let aktiv = filter.some(f => f.schluessel === vorauswahl) ? vorauswahl : 'alle';

    if (zielFilter) {
      const filterEl = document.querySelector(zielFilter);
      if (filterEl) {
        filterEl.innerHTML = filter.map(f =>
          `<button class="filter-knopf${f.schluessel === aktiv ? ' ist-aktiv' : ''}"
                   data-filter="${f.schluessel}">${f.titel}</button>`).join('');

        filterEl.addEventListener('click', (e) => {
          const knopf = e.target.closest('.filter-knopf');
          if (!knopf) return;
          aktiv = knopf.dataset.filter;
          filterEl.querySelectorAll('.filter-knopf')
            .forEach(k => k.classList.toggle('ist-aktiv', k === knopf));
          zeichnen(rasterEl, aktiv);
        });
      }
    }

    zeichnen(rasterEl, aktiv, true);
  }

  function passt(b, f) {
    if (f === 'alle') return true;
    if (f.startsWith('art:')) return b.art === f.slice(4);
    return (b.themen || []).includes(f);
  }

  function zeichnen(rasterEl, f, erstesMal) {
    const treffer = BEITRAEGE.filter(b => eintrag(b) && passt(b, f));
    const ruhig = window.BW && window.BW.wenigerBewegung;

    const einsetzen = () => {
      rasterEl.innerHTML = treffer.length
        ? treffer.map(karte).join('')
        : '<p style="opacity:.7">Zu diesem Filter gibt es noch nichts. Kommt aber.</p>';

      if (ruhig) return;
      gsap.fromTo(rasterEl.children,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.045, ease: 'bw-aus', overwrite: true });
    };

    if (erstesMal || ruhig) {
      einsetzen();
    } else {
      // Alte Karten weg, dann die neuen herein.
      gsap.to(rasterEl.children, {
        opacity: 0, y: -16, duration: 0.26, stagger: 0.02, ease: 'power2.in',
        onComplete: einsetzen
      });
    }
  }

  return { BEITRAEGE, FILTER, raster, karte };
})();
