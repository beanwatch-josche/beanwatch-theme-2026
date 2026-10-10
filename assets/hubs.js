/* ==========================================================================
   Beanwatch · Hub-Seiten
   Die Illustrations-Timelines für Espresso und Filterkaffee sowie die
   Getränke- und Geräte-Raster, die daraus aufgebaut werden.

   Setzt auf basis.js auf und nutzt dieselben Easings.
   ========================================================================== */

window.BWHub = (function () {
  'use strict';

  const ruhig = window.BW && window.BW.wenigerBewegung;
  const F = window.BW_FARBEN;

  // Start-Modus (start.js). Ohne ihn, etwa im Labor, steht alles wie bisher.
  const S = window.BWStart;
  const zeigen = (ziel) => !S || S.zeigen(ziel);
  const eintrag = (e) => !S || S.eintrag(e);
  const vorschau = !S || S.vorschau;

  // Wortlaut aus data-text-<name> am Element, im Theme aus den
  // Sprachdateien; ohne Attribut der deutsche wie im Prototyp. Platzhalter
  // in geschweiften Klammern ({n}, {v}) werden ersetzt.
  function wortlaut(el, name, deutsch, werte) {
    const s = (el && el.dataset['text' + name]) || deutsch;
    return werte ? s.replace(/\{(\w+)\}/g, (m, k) => (k in werte ? werte[k] : m)) : s;
  }
  const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ======================================================================
     Getränkedaten
     Anteile beziehen sich auf die Innenhöhe des Gefässes, von unten nach oben.
     ====================================================================== */
  const GETRAENKE = [
    {
      name: 'Espresso', gefaess: 'espressotasse',
      verhaeltnis: '18 g → 36 g',
      text: 'Die Basis für alles. Süss und sirupartig, mit einer Crema, die den Löffel trägt.',
      schichten: [
        { anteil: .70, farbe: F.espresso, name: 'Espresso' },
        { anteil: .18, farbe: F.crema, name: 'Crema' }
      ],
      ziel: '/espresso.html#getraenke'
    },
    {
      name: 'Espresso Macchiato', gefaess: 'espressotasse',
      verhaeltnis: 'Espresso + Tupfer',
      text: 'Ein Löffel Schaum nimmt dem Espresso die Spitze, ohne ihn zu verstecken.',
      schichten: [
        { anteil: .58, farbe: F.espresso, name: 'Espresso' },
        { anteil: .12, farbe: F.crema, name: 'Crema' },
        { anteil: .18, farbe: F.schaum, name: 'Milchschaum' }
      ],
      ziel: '/blogs/kaffeewissen/espresso-macchiato-ein-kleiner-milchtupfer-fur-den-espresso-bitte.html'
    },
    {
      name: 'Cortado', gefaess: 'tumbler',
      verhaeltnis: '1 : 1',
      text: 'Gleich viel Espresso wie Milch. Der spanische Weg, die Säure zu zähmen.',
      schichten: [
        { anteil: .42, farbe: F.espresso, name: 'Espresso' },
        { anteil: .40, farbe: F.milch, name: 'Milch' },
        { anteil: .10, farbe: F.schaum, name: 'Schaum' }
      ],
      ziel: '/blogs/kaffeewissen/cortado-kaffee-guide-alles-zum-espresso-klassiker.html'
    },
    {
      name: 'Cappuccino', gefaess: 'tasse',
      verhaeltnis: '1 : 1 : 1',
      text: 'Zu gleichen Teilen Espresso, Milch und Schaum. Der italienische Klassiker.',
      schichten: [
        { anteil: .32, farbe: F.espresso, name: 'Espresso' },
        { anteil: .33, farbe: F.milch, name: 'Milch' },
        { anteil: .30, farbe: F.schaum, name: 'Milchschaum' }
      ],
      ziel: '/blogs/kaffeewissen/wie-macht-man-cappuccino.html'
    },
    {
      name: 'Flat White', gefaess: 'tasse',
      verhaeltnis: '1 : 3',
      text: 'Mehr Milch, kaum Schaum, dafür samtiger Mikroschaum bis zum Rand.',
      schichten: [
        { anteil: .30, farbe: F.espresso, name: 'Doppelter Espresso' },
        { anteil: .56, farbe: F.milch, name: 'Milch' },
        { anteil: .09, farbe: F.schaum, name: 'Mikroschaum' }
      ],
      ziel: '/blogs/kaffeewissen/flat-white-guide-und-rezept.html'
    },
    {
      name: 'Latte Macchiato', gefaess: 'glas',
      verhaeltnis: 'Drei Schichten',
      text: 'Milch zuerst, Espresso danach. Die Schichtung entsteht durch die Dichte.',
      schichten: [
        { anteil: .48, farbe: F.milch, name: 'Milch' },
        { anteil: .22, farbe: F.espresso, name: 'Espresso' },
        { anteil: .26, farbe: F.schaum, name: 'Milchschaum' }
      ],
      ziel: '/blogs/kaffeewissen/latte-macchiato.html'
    },
    {
      name: 'Café Crème', gefaess: 'tasse',
      verhaeltnis: 'Langer Bezug',
      text: 'In der Schweiz einfach «ein Kaffee». Länger bezogen, milder, aber nicht dünn.',
      schichten: [
        { anteil: .76, farbe: F.espresso, name: 'Kaffee' },
        { anteil: .13, farbe: F.crema, name: 'Crema' }
      ],
      ziel: '/blogs/kaffeewissen/cafe-creme-siebtrager-rezept.html'
    },
    {
      name: 'Espresso Tonic', gefaess: 'glas', eis: true,
      verhaeltnis: 'Espresso auf Tonic',
      text: 'Fruchtiger Espresso trifft auf bitteres Tonic. Der Sommerhit im Glas.',
      schichten: [
        { anteil: .54, farbe: '#CBEBF4', name: 'Tonic' },
        { anteil: .30, farbe: F.espresso, name: 'Espresso' }
      ],
      ziel: '/blogs/kaffeerezepte/espresso-tonic-rezept.html'
    }
  ];

  /* ======================================================================
     Brew Guides für den Filter-Hub
     Geschrieben ist bisher nur der V60 (stand 'live'). Die anderen führen
     zu einem Ersatz, bis ihr Guide steht: meist zum V60, beim Cold Brew
     zum Rezept. Der Stand wird parallel in wissen.js gepflegt.

     Zum Start sind alle Guides ausgeblendet (start.js). Wohin eine Karte
     dann führt, entscheidet weg(): zum ersten sichtbaren Ersatz, zuletzt
     zum Grundrezept. Steht ein Guide im PLAN auf "sichtbar", führt alles
     wieder zu ihm, ohne Änderung hier.
     ====================================================================== */
  const ERSATZ_V60 = { datei: '/blogs/brew-guides/hario-v60.html', knopf: 'V60 ansehen', wort: 'der V60-Guide' };
  const ERSATZ_COLDBREW = { datei: '/blogs/kaffeerezepte/cold-brew.html', knopf: 'Zum Rezept', wort: 'das Cold-Brew-Rezept' };
  const GRUNDREZEPT_FILTER = { datei: '/filterkaffee.html#rezeptur', knopf: 'Zum Grundrezept', wort: 'das Grundrezept' };
  const GRUNDREZEPT_ESPRESSO = { datei: '/espresso.html#rezeptur', knopf: 'Zum Grundrezept', wort: 'das Grundrezept' };
  const BOHNEN_KLASSISCH = { datei: '/welcher-kaffee.html#klassisch', knopf: 'Passende Bohnen', wort: 'die passenden Bohnen' };
  const ESPRESSO_REZEPTE = { datei: '/espresso.html#getraenke', knopf: 'Zu den Rezepten', wort: 'die Espresso-Rezepte' };

  // Wohin eine Guide-Karte führt: zum Guide, wenn er steht und sichtbar
  // ist, sonst zum ersten sichtbaren Ersatz, zuletzt zum Grundrezept.
  function weg(g, grund) {
    if (g.stand !== 'geplant' && zeigen(g.datei)) {
      return { datei: g.datei, knopf: (FT && FT.zum_guide) || 'Zum Guide', guide: true };
    }
    return [g.ersatz, grund].find(e => e && zeigen(e.datei)) || grund;
  }

  const GUIDES = [
    {
      geraet: 'v60', name: 'Hario V60', stand: 'live',
      datei: '/blogs/brew-guides/hario-v60.html',
      werte: ['15 g', '250 ml', '2:30 min', '94 °C'],
      text: 'Der Klassiker unter den Handfiltern. Klar, sauber und der beste Weg, eine Bohne kennenzulernen.'
    },
    {
      geraet: 'chemex', name: 'Chemex', stand: 'geplant',
      ersatz: ERSATZ_V60,
      werte: ['30 g', '500 ml', '4:00 min', '94 °C'],
      text: 'Dickeres Filterpapier, längere Zeit. Ergibt die klarste Tasse und reicht für zwei.'
    },
    {
      geraet: 'frenchpress', name: 'French Press', stand: 'geplant',
      ersatz: ERSATZ_V60,
      werte: ['30 g', '500 ml', '4:00 min', '95 °C'],
      text: 'Ganz ohne Papier. Mehr Körper, mehr Öle, und praktisch nichts falsch zu machen.'
    },
    {
      geraet: 'aeropress', name: 'AeroPress', stand: 'geplant',
      ersatz: ERSATZ_V60,
      werte: ['15 g', '220 ml', '1:30 min', '85 °C'],
      text: 'Schnell, robust und reisetauglich. Der Druck holt Süsse aus fast jeder Bohne.'
    },
    {
      geraet: 'coldbrew', name: 'Cold Brew', stand: 'geplant',
      ersatz: ERSATZ_COLDBREW,
      werte: ['80 g', '1 l', '14 Std.', 'kalt'],
      text: 'Kalt angesetzt, über Nacht gezogen. Mild, süss und die Basis für jeden Sommerdrink.'
    }
  ];

  /* ======================================================================
     Barista Guides für den Espresso-Hub

     Wie die Brew Guides nach Gerät sortiert, nur eben nach Maschinentyp.
     Jeder Guide erklärt zusätzlich, wie das Milchaufschäumen mit genau
     diesem Gerät läuft — beim Einkreiser mit Wartezeit, beim Zweikreiser
     gleichzeitig zum Bezug.

     bild, alt, fokus: das Foto der Karte (30.09.2026). Das Schnittbild aus
     bwMaschine() steht seither nur noch im Artikel, in der Sektion #aufbau.
     Dieselben Bilder stehen ein zweites Mal im Kopf der Artikel
     (werkzeug/baristaguides-bauen.rb), auf der Wissensseite (wissen.js) und
     beim Einkreiser auf der Startseite (index.html). Ein neues Foto gehört
     an alle vier Stellen. Ohne bild zeigt die Karte den Platzhalter
     «Foto folgt». fokus setzt den Bildausschnitt, siehe --fokus in
     seiten.css.
     ====================================================================== */
  const CDN = 'https://cdn.shopify.com/s/files/1/0936/9409/9833/files/';

  const BARISTA_GUIDES = [
    {
      maschine: 'einkreiser', name: 'Einkreiser',
      ersatz: GRUNDREZEPT_ESPRESSO,
      datei: '/blogs/barista-guides/einkreiser.html',
      bild: CDN + 'beanwatch-espressomaschine.webp?v=1766938882',
      alt: 'Espressomaschine bezieht zwei Espressi gleichzeitig in zwei Tassen',
      werte: ['18 g', '36 g', '25–30 s', '93 °C'],
      text: 'Ein Kessel für beides. Erst brühen, dann umschalten und warten, bis der Dampf da ist.'
    },
    {
      // Noch kein Foto. Die La Marzocco von der alten Espresso-Seite ist ein
      // Dualboiler und zeigt deshalb keinen Zweikreiser.
      maschine: 'zweikreiser', name: 'Zweikreiser',
      ersatz: GRUNDREZEPT_ESPRESSO,
      datei: '/blogs/barista-guides/zweikreiser.html',
      bild: '', alt: '',
      werte: ['18 g', '36 g', '25–30 s', 'Cooling Flush'],
      text: 'Wärmetauscher im Dampfkessel: Brühen und Aufschäumen gehen gleichzeitig.'
    },
    {
      // Die Zuriga arbeitet mit einem Thermoblock. Das Foto steht hochkant
      // und wird in der Karte oben und unten beschnitten.
      maschine: 'thermoblock', name: 'Thermoblock',
      ersatz: GRUNDREZEPT_ESPRESSO,
      datei: '/blogs/barista-guides/thermoblock.html',
      bild: CDN + 'beanwatch-espresso-in-milk-pitcher.webp?v=1778863887',
      alt: 'Zuriga Espressomaschine mit eingespanntem Siebträger, der Espresso läuft in zwei kleine Milchkännchen',
      fokus: '50% 40%',
      werte: ['16 g', '32 g', '25–30 s', 'kurz vorheizen'],
      text: 'Kein Kessel, nur eine beheizte Leitung. Schnell bereit, dafür schwankt die Temperatur.'
    },
    {
      maschine: 'vollautomat', name: 'Kaffeevollautomat',
      ersatz: BOHNEN_KLASSISCH,
      datei: '/blogs/barista-guides/kaffeevollautomat.html',
      bild: CDN + 'beanwatch-kaffeevollautomat.webp?v=1766918668',
      alt: 'Kaffeevollautomat in einem Regal im Midcentury-Stil',
      werte: ['Mahlgrad', 'Menge', 'Temperatur', 'Milchsystem'],
      text: 'Zwei Stellschrauben und ein Milchsystem. Mehr Kontrolle, als die meisten nutzen.'
    },
    {
      maschine: 'kapsel', name: 'Kapselmaschine',
      ersatz: ESPRESSO_REZEPTE,
      datei: '/blogs/barista-guides/kapselmaschine.html',
      bild: CDN + 'beanwatch-kapselmaschine.webp?v=1766927627',
      alt: 'Kapselmaschine am Fenster mit Blick auf den Zürichsee',
      werte: ['Kapsel', 'Wassermenge', 'Tasse', 'Aufschäumer'],
      text: 'Wenig einzustellen, aber Wassermenge und Tasse machen mehr aus als gedacht.'
    },
    {
      maschine: 'bialetti', name: 'Bialetti',
      ersatz: BOHNEN_KLASSISCH,
      datei: '/blogs/barista-guides/bialetti.html',
      bild: CDN + 'beanwatch-mokkakanne.webp?v=1767000228',
      alt: 'Moka-Kanne auf der Flamme eines Gasherds',
      werte: ['15 g', 'mittel', 'kleine Hitze', 'ohne Druck'],
      text: 'Kein Espresso im engeren Sinn, aber der Klassiker am Herd — und gar nicht so heikel.'
    }
  ];

  // Das Bildfeld einer Barista-Guide-Karte, gebraucht vom Raster und vom
  // Maschinenfinder. Fehlt das Foto noch, steht im selben Feld der
  // Platzhalter, die Karte behält also ihre Höhe.
  function maschinenFoto(g) {
    if (!g.bild) {
      return `<span class="brewguide-bild brewguide-bild--foto ist-leer"><span class="foto-folgt">Foto folgt</span></span>`;
    }
    const fokus = g.fokus ? ` style="--fokus:${g.fokus}"` : '';
    return `<span class="brewguide-bild brewguide-bild--foto"><img src="${g.bild}" alt="${g.alt}" loading="lazy"${fokus}></span>`;
  }

  /* ======================================================================
     Getränke-Raster aufbauen
     ====================================================================== */
  function getraenkeRaster(ziel) {
    const behaelter = document.querySelector(ziel);
    if (!behaelter) return;

    behaelter.innerHTML = GETRAENKE.map((g, i) => `
      <a class="getraenk" href="${g.ziel}">
        <span class="getraenk-glas">${bwGlas({
          gefaess: g.gefaess,
          schichten: g.schichten,
          eis: g.eis,
          id: 'g' + i,
          alt: g.name + ' im Schnitt'
        })}</span>
        <span class="verhaeltnis">${g.verhaeltnis}</span>
        <h3>${g.name}</h3>
        <p>${g.text}</p>
        <span class="zumartikel">Mehr dazu
          <svg class="pfeil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </a>`).join('');

    if (ruhig) return;

    // Die Schichten wachsen von unten hoch, sobald die Karte sichtbar wird.
    gsap.utils.toArray('.getraenk', behaelter).forEach((karte) => {
      const schichten = karte.querySelectorAll('.schicht');
      const eis = karte.querySelectorAll('.eis rect');

      gsap.set(schichten, { scaleY: 0 });
      gsap.set(eis, { scale: 0, transformOrigin: '50% 50%' });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: karte, start: 'top 86%', once: true }
      });

      tl.to(schichten, { scaleY: 1, duration: 0.72, stagger: 0.14, ease: 'power2.out' })
        .to(eis, { scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(2.4)' }, '-=0.35');

      // Beim Hover füllt sich das Glas noch einmal nach.
      karte.addEventListener('mouseenter', () => {
        gsap.fromTo(schichten,
          { scaleY: 0.9 },
          { scaleY: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(2)', overwrite: true });
      });
    });
  }

  /* ======================================================================
     Brew-Guide-Raster
     ====================================================================== */
  // Eine Karte, gebraucht vom Raster und vom Methodenfinder. Ein geplanter
  // Guide sagt das auf der Karte (nur in der Entwurfsansicht) und führt zu
  // seinem Ersatz, siehe weg().
  function guideKarte(g) {
    const w = weg(g, GRUNDREZEPT_FILTER);
    const knopf = w.guide ? w.knopf : (g.stand === 'geplant' && vorschau ? 'Guide folgt · ' : '') + w.knopf;
    return `
      <a class="brewguide" href="${w.datei}">
        <span class="brewguide-bild brewguide-bild--geraet">${bwGeraet(g.geraet)}</span>
        <span class="brewguide-koerper">
          <span class="brewguide-meta">
            ${g.werte.map(w => `<span class="wert">${w}</span>`).join('')}
          </span>
          <h3>${g.name}</h3>
          <p>${g.text}</p>
          <span class="mehr">${knopf}
            <svg class="pfeil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </span>
      </a>`;
  }

  function guideRaster(ziel) {
    const behaelter = document.querySelector(ziel);
    if (!behaelter) return;

    // Anhaengen statt zuweisen, wie baristaRaster(): Auf dem Filter-Hub steht
    // die Verweisbox zum Methodenfinder als erste Zelle im Markup. Die
    // uebrigen Container sind leer. Ein zweiter Aufruf wuerde verdoppeln.
    behaelter.insertAdjacentHTML('beforeend', GUIDES.filter(eintrag).map(guideKarte).join(''));

    if (ruhig) return;

    gsap.utils.toArray('.brewguide', behaelter).forEach((karte) => {
      const stand = karte.querySelectorAll('.kaffeestand');
      const bett = karte.querySelectorAll('.kaffeebett');
      const strahl = karte.querySelector('.wasserstrahl');
      const eis = karte.querySelectorAll('.eis rect');

      gsap.set(stand, { scaleY: 0 });
      gsap.set(bett, { scaleY: 0 });
      gsap.set(eis, { scale: 0, transformOrigin: '50% 50%' });
      if (strahl) gsap.set(strahl, { drawSVG: '0% 0%' });

      // Pausierte Timeline plus eigener Trigger, wie in schritteBand(). Ein
      // Trigger direkt an einer Timeline misst erst verzögert. Lädt die
      // Seite weit unten (wiederhergestellte Scrollposition), misst ihn der
      // nächste neue Trigger nach, und mit once beenden sich dann mehrere
      // Karten in einer Kette selbst. Das Trigger-Array schrumpft schneller,
      // als ScrollTrigger 3.13 den Index nachführt ("reading 'pin'"), und
      // der Seitenaufruf bricht ab. Ein Trigger ohne Animation misst sofort.
      const tl = gsap.timeline({ paused: true });
      ScrollTrigger.create({ trigger: karte, start: 'top 86%', once: true, onEnter: () => tl.play() });

      if (strahl) tl.to(strahl, { drawSVG: '0% 100%', duration: 0.7, ease: 'power1.in' }, 0);
      tl.to(bett, { scaleY: 1, duration: 0.5, ease: 'power2.out' }, 0.25)
        .to(stand, { scaleY: 1, duration: 1, ease: 'power1.inOut' }, 0.4)
        .to(eis, { scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(2.4)' }, 0.7);
      if (strahl) tl.to(strahl, { drawSVG: '100% 100%', duration: 0.5, ease: 'power1.out' }, 1.1);
    });
  }

  /* ======================================================================
     Barista-Guide-Raster
     Wie das Brew-Guide-Raster, nur mit Foto statt Zeichnung (30.09.2026).
     Die Animation, die hier früher den Weg des Wassers nachzeichnete,
     läuft jetzt im Artikel, siehe maschinenSchnitt().
     ====================================================================== */
  function baristaRaster(ziel, ausser) {
    const behaelter = document.querySelector(ziel);
    if (!behaelter) return;

    // Auf einer Guide-Seite steht die eigene Maschine nicht nochmal unten.
    // Anhaengen statt zuweisen: Auf dem Espresso-Hub steht die Verweisbox zum
    // Maschinenfinder als erste Zelle im Markup, ein innerHTML wuerde sie
    // loeschen. Alle acht Container im Projekt sind sonst leer, und die
    // Funktion laeuft nirgends zweimal. Ein zweiter Aufruf wuerde verdoppeln.
    behaelter.insertAdjacentHTML('beforeend', BARISTA_GUIDES.filter(g => g.maschine !== ausser && eintrag(g)).map((g) => `
      <a class="brewguide" href="${g.datei}">
        ${maschinenFoto(g)}
        <span class="brewguide-koerper">
          <span class="brewguide-meta">
            ${g.werte.map(w => `<span class="wert">${w}</span>`).join('')}
          </span>
          <h3>${g.name}</h3>
          <p>${g.text}</p>
          <span class="mehr">Zum Guide
            <svg class="pfeil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </span>
      </a>`).join(''));
  }

  /* ======================================================================
     Maschine im Schnitt
     Die Sektion #aufbau in jedem Barista Guide. Setzt das Schnittbild aus
     bwMaschine() ein und zeichnet beim Einscrollen den Weg des Wassers
     nach: erst füllt sich der Kessel, dann laufen die Wege, zuletzt steigt
     der Kaffee. Pausierte Timeline plus eigener Trigger wie in
     guideRaster(), nicht once direkt an der Timeline.
     ====================================================================== */
  function maschinenSchnitt(ziel, maschine) {
    const buehne = document.querySelector(ziel);
    if (!buehne || !window.bwMaschine) return;

    buehne.innerHTML = bwMaschine(maschine);
    if (ruhig) return;

    // DrawSVG arbeitet selbst mit stroke-dasharray und zöge gestrichelte
    // Wege durch. Die Legende nennt sie aber gestrichelt (Dampflanze am
    // Einkreiser, Milchschlauch am Vollautomaten), deshalb blenden sie ein.
    const alle = [...buehne.querySelectorAll('.wasserweg')];
    const wege = alle.filter(p => !p.hasAttribute('stroke-dasharray'));
    const gestrichelt = alle.filter(p => p.hasAttribute('stroke-dasharray'));
    const stand = buehne.querySelectorAll('.kaffeestand');
    const kessel = buehne.querySelectorAll('.kessel');
    const zeichnen = gsap.plugins && gsap.plugins.drawSVG;

    gsap.set(stand, { scaleY: 0 });
    gsap.set(kessel, { scaleY: 0 });
    gsap.set(gestrichelt, { opacity: 0 });
    if (zeichnen) gsap.set(wege, { drawSVG: '0% 0%' });

    const tl = gsap.timeline({ paused: true });
    ScrollTrigger.create({ trigger: buehne, start: 'top 80%', once: true, onEnter: () => tl.play() });

    tl.to(kessel, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 0);
    if (zeichnen) tl.to(wege, { drawSVG: '0% 100%', duration: 0.9, stagger: 0.08, ease: 'power1.inOut' }, 0.3);
    tl.to(gestrichelt, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.9);
    tl.to(stand, { scaleY: 1, duration: 0.8, ease: 'power1.inOut' }, 0.8);
  }

  /* ======================================================================
     Geführte Rezeptur: Röstgrad in Schritt eins, Menge in Schritt zwei,
     das Ergebnis läuft rechts mit. Standard ist der doppelte Espresso mit
     heller Röstung, 18 g auf 45 g.
     ====================================================================== */
  // wort trägt den Zusammenfassungssatz unter dem Grundrezept.
  const BEZUG = {
    einfach: { mengen: [8, 9, 12], standard: 1, wort: 'einen einfachen Espresso' },
    doppelt: { mengen: [15, 18, 20, 21], standard: 1, wort: 'einen doppelten Espresso' }
  };

  const ROESTUNG = {
    hell: {
      verhaeltnis: 2.5,
      anzeige: '1 : 2,5',
      temperatur: [93, 95],
      hinweis: '93 bis 95 °C',
      wort: 'heller Röstung'
    },
    dunkel: {
      verhaeltnis: 2,
      anzeige: '1 : 2',
      temperatur: [88, 92],
      hinweis: '88 bis 92 °C',
      wort: 'dunkler Röstung'
    }
  };

  function rezeptur() {
    const fluss = document.querySelector('.rezeptur-fluss');
    if (!fluss) return;

    const regler = document.getElementById('mehlmenge');
    const anzeige = document.getElementById('mehlmenge-anzeige');
    const stufenleiste = document.getElementById('mengen-stufen');
    const schalter = document.getElementById('roestung');
    const fuellung = document.getElementById('schalter-fuellung');
    const bezugGruppe = document.getElementById('bezug');
    const hinweisTemp = document.getElementById('hinweis-temperatur');
    const zielSatz = document.getElementById('ziel-satz');
    const satz = document.getElementById('rezeptur-satz');
    const verhaeltnisZahl = document.getElementById('verhaeltnis-zahl');
    const teilTasse = document.getElementById('teil-tasse');
    const wertMehl = document.getElementById('wert-mehl');
    const wertTasse = document.getElementById('wert-tasse');
    const wertZeit = document.getElementById('wert-zeit');
    const wertTemp = document.getElementById('wert-temperatur');
    if (!regler || !schalter || !bezugGruppe || !wertMehl) return;
    // Im Theme: Dezimalzeichen und Sätze der Sprache (data-text-* an .rezeptur-fluss).
    const dez = fluss.dataset.textDezimal || ',';

    let bezug = 'doppelt';
    let stufe = BEZUG[bezug].standard;
    let art = 'hell';
    let auftritt = null;
    const zeigt = { mehl: 18, tasse: 45, tempVon: 93, tempBis: 95 };

    const mengen = () => BEZUG[bezug].mengen;
    const gramm = () => mengen()[stufe];

    const zahl = (n) => {
      const g = Math.round(n * 2) / 2;
      return g % 1 === 0 ? g.toFixed(0) : g.toFixed(1).replace('.', dez);
    };
    const setze = (el, text, einheit) => {
      el.innerHTML = text + '<span class="einheit"> ' + einheit + '</span>';
    };

    function malen() {
      setze(wertMehl, zahl(zeigt.mehl), 'g');
      setze(wertTasse, zahl(zeigt.tasse), 'g');
      setze(wertZeit, '25–30', 's');
      setze(wertTemp, Math.round(zeigt.tempVon) + '–' + Math.round(zeigt.tempBis), '°C');
    }

    // Stufen unter dem Regler neu aufbauen, wenn der Bezug wechselt.
    function stufenBauen() {
      stufenleiste.innerHTML = mengen().map((m) => '<span>' + m + '</span>').join('');
      regler.max = String(mengen().length - 1);
    }

    function umfeld() {
      const r = ROESTUNG[art];
      anzeige.textContent = gramm() + ' g';
      regler.value = String(stufe);
      regler.setAttribute('aria-valuetext', wortlaut(fluss, 'Gramm', gramm() + ' Gramm', { n: gramm() }));
      verhaeltnisZahl.textContent = r.anzeige.replace(',', dez);
      hinweisTemp.textContent = wortlaut(fluss, 'Hinweis' + gross(art), r.hinweis);
      const tasse = zahl(gramm() * r.verhaeltnis);
      zielSatz.textContent = wortlaut(fluss, 'Ziel', tasse + ' g in der Tasse nach 25 bis 30 Sekunden.', { n: tasse });
      // Nur die beiden diskreten Entscheidungen, nicht die Grammzahl: Die
      // ändert sich beim Ziehen am Regler laufend und steht gross darüber.
      // Im Theme vier ganze Sätze, weil die Beugung je Sprache anders ist.
      if (satz) {
        satz.textContent = wortlaut(fluss, 'Satz' + gross(bezug) + gross(art),
          'Grundrezept für ' + BEZUG[bezug].wort + ' bei ' + r.wort + '.');
      }
      gsap.utils.toArray('span', stufenleiste)
        .forEach((s, i) => s.classList.toggle('ist-aktiv', i === stufe));
    }

    function aktualisieren(sofort) {
      const r = ROESTUNG[art];
      const ziel = {
        mehl: gramm(),
        tasse: gramm() * r.verhaeltnis,
        tempVon: r.temperatur[0],
        tempBis: r.temperatur[1]
      };
      umfeld();

      if (ruhig || sofort) {
        Object.assign(zeigt, ziel);
        malen();
        teilTasse.style.flexGrow = r.verhaeltnis;
        return;
      }

      gsap.to(zeigt, {
        mehl: ziel.mehl, tasse: ziel.tasse,
        tempVon: ziel.tempVon, tempBis: ziel.tempBis,
        duration: 0.45, ease: 'power2.out', overwrite: true,
        onUpdate: malen
      });
      gsap.to(teilTasse, { flexGrow: r.verhaeltnis, duration: 0.5, ease: 'bw-aus', overwrite: true });
    }

    // Sobald jemand selbst verstellt, hat der Auftrittszähler nichts mehr zu
    // suchen. Sonst überschreibt er die Eingabe, wenn die Sektion erst danach
    // ins Bild kommt.
    function eingriff() {
      if (auftritt) { auftritt.kill(); auftritt = null; }
    }

    regler.addEventListener('input', () => {
      const neueStufe = parseInt(regler.value, 10);
      if (neueStufe === stufe) return;
      eingriff();
      stufe = neueStufe;
      aktualisieren();
      if (!ruhig) gsap.fromTo(anzeige, { scale: 0.86 }, { scale: 1, duration: 0.3, ease: 'back.out(2.4)' });
    });

    bezugGruppe.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf || knopf.dataset.bezug === bezug) return;
      eingriff();
      bezug = knopf.dataset.bezug;
      stufe = BEZUG[bezug].standard;
      bezugGruppe.querySelectorAll('button').forEach((b) => {
        const aktiv = b === knopf;
        b.classList.toggle('ist-aktiv', aktiv);
        b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
      });
      stufenBauen();
      aktualisieren();
      if (!ruhig) gsap.fromTo(knopf, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: 'back.out(2.4)' });
    });

    schalter.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf || knopf.dataset.roestung === art) return;
      eingriff();
      art = knopf.dataset.roestung;

      const vorher = ruhig ? null : Flip.getState(fuellung);
      schalter.querySelectorAll('button').forEach((b) => {
        const aktiv = b === knopf;
        b.classList.toggle('ist-aktiv', aktiv);
        b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
      });
      fuellung.style.left = art === 'dunkel' ? 'calc(50% + 2px)' : '4px';
      if (vorher) Flip.from(vorher, { duration: 0.45, ease: 'bw-aus' });

      aktualisieren();
    });

    stufenBauen();
    aktualisieren(true);
    if (ruhig) return;

    // Eigener Auftrittszähler statt data-zaehler: basis.js liest den Zielwert
    // einmal beim Start und würde eine frühe Eingabe später überschreiben.
    const start = { anteil: 0 };
    const ziel = { mehl: zeigt.mehl, tasse: zeigt.tasse, tempVon: zeigt.tempVon, tempBis: zeigt.tempBis };
    auftritt = gsap.to(start, {
      anteil: 1,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: fluss.querySelector('.rezeptur-ergebnis'), start: 'top 88%', once: true },
      onUpdate() {
        zeigt.mehl = ziel.mehl * start.anteil;
        zeigt.tasse = ziel.tasse * start.anteil;
        zeigt.tempVon = ziel.tempVon * start.anteil;
        zeigt.tempBis = ziel.tempBis * start.anteil;
        malen();
      },
      onComplete() { auftritt = null; aktualisieren(true); }
    });
  }

  /* ======================================================================
     Grundrezept für Filterkaffee
     Eigene Funktion statt einer zweiten Konfiguration für rezeptur(): Dort
     ist der Regler ein Index in eine Mengenliste und das Verhältnis hängt
     am Röstgrad. Hier ist die Grammzahl frei, das Verhältnis hat einen
     eigenen Regler mit sieben Stufen, der Röstgrad setzt nur die
     Temperatur. Das Markup benutzt dieselben Klassen wie auf
     espresso.html, die IDs tragen das Präfix filter-. Standard: 12 g bei
     1 : 16,7 (60 g pro Liter) und heller Röstung.
     Keine Methode: Das Rezept gilt für V60, Chemex, French Press und
     AeroPress, die Unterschiede stehen in den Brew Guides.
     ====================================================================== */
  const FILTER_MENGE = { min: 12, max: 24, standard: 12 };

  // Die sieben Stufen des Brühverhältnisses, von kräftig nach leicht.
  // Anzeige, Liter-Wert und Charakter wörtlich aus Joschas Tabelle vom
  // 26.09.2026. faktor rechnet Wasser aus Kaffee; 1 : 16,7 ist genau
  // 60 g pro Liter, damit 12 g weiterhin 200 g Wasser ergeben.
  const FILTER_VERHAELTNIS = [
    { faktor: 14,        anzeige: '1 : 14',   proLiter: '71 g',   charakter: 'Sehr kräftig, viel Körper' },
    { faktor: 15,        anzeige: '1 : 15',   proLiter: '67 g',   charakter: 'Kräftig, süss, körperreich' },
    { faktor: 16,        anzeige: '1 : 16',   proLiter: '62,5 g', charakter: 'Ausgewogen, sehr verbreitet' },
    { faktor: 1000 / 60, anzeige: '1 : 16,7', proLiter: '60 g',   charakter: 'Ausgewogen, guter Ausgangspunkt' },
    { faktor: 17,        anzeige: '1 : 17',   proLiter: '59 g',   charakter: 'Leichter, klarer, aromatischer' },
    { faktor: 18,        anzeige: '1 : 18',   proLiter: '55,5 g', charakter: 'Leichter, transparenter' },
    { faktor: 20,        anzeige: '1 : 20',   proLiter: '50 g',   charakter: 'Sehr leicht, teeartig' }
  ];
  const FILTER_VERHAELTNIS_START = 3;

  const FILTER_ROESTUNG = {
    hell:   { temperatur: [93, 96], hinweis: '93 bis 96 °C', wort: 'helle Röstung' },
    dunkel: { temperatur: [88, 92], hinweis: '88 bis 92 °C', wort: 'dunkle Röstung' }
  };

  const filterWasser = (gramm, faktor) => Math.round(gramm * faktor);
  // Joschas Mass: 60 g Blooming auf 18 g Kaffee, also gut das Dreifache,
  // auf Zehner gerundet. 12 g ergeben 40 g, 15 g ergeben 50 g.
  const filterBloom = (gramm) => Math.round(gramm * 10 / 3 / 10) * 10;

  function filterRezeptur() {
    const fluss = document.getElementById('filter-rezeptur');
    if (!fluss) return;
    const el = (name) => document.getElementById('filter-' + name);

    const regler = el('mehl');
    const anzeige = el('mehl-anzeige');
    const stufenleiste = el('mengen-stufen');
    const schalter = el('roestung');
    const fuellung = el('fuellung');
    const verhRegler = el('verhaeltnis');
    const verhAnzeige = el('verhaeltnis-anzeige');
    const verhStufen = el('verhaeltnis-stufen');
    const verhLiter = el('verhaeltnis-liter');
    const verhCharakter = el('verhaeltnis-charakter');
    const hinweisTemp = el('hinweis-temperatur');
    const bloomSatz = el('bloom-satz');
    const gussSatz = el('guss-satz');
    const satz = el('rezeptur-satz');
    const verhaeltnisZahl = el('verhaeltnis-zahl');
    const teilWasser = el('teil-wasser');
    const wertMehl = el('wert-mehl');
    const wertWasser = el('wert-wasser');
    const wertTemp = el('wert-temperatur');
    const wertBloom = el('wert-bloom');
    if (!regler || !schalter || !verhRegler || !wertMehl) return;
    // Im Theme: Dezimalzeichen und Sätze der Sprache (data-text-* an
    // #filter-rezeptur), die Charaktere als data-charakter an den Stufen.
    const dez = fluss.dataset.textDezimal || ',';
    const dz = (t) => t.replace(',', dez);

    let gramm = FILTER_MENGE.standard;
    let stufe = FILTER_VERHAELTNIS_START;
    let art = 'hell';
    let auftritt = null;
    const zeigt = { mehl: 0, wasser: 0, bloom: 0, tempVon: 0, tempBis: 0 };

    const setze = (knoten, text, einheit) => {
      knoten.innerHTML = text + '<span class="einheit"> ' + einheit + '</span>';
    };

    function ziel() {
      const t = FILTER_ROESTUNG[art].temperatur;
      return {
        mehl: gramm,
        wasser: filterWasser(gramm, FILTER_VERHAELTNIS[stufe].faktor),
        bloom: filterBloom(gramm),
        tempVon: t[0],
        tempBis: t[1]
      };
    }

    function malen() {
      setze(wertMehl, Math.round(zeigt.mehl), 'g');
      setze(wertWasser, Math.round(zeigt.wasser), 'g');
      setze(wertTemp, Math.round(zeigt.tempVon) + '–' + Math.round(zeigt.tempBis), '°C');
      setze(wertBloom, Math.round(zeigt.bloom), 'g');
    }

    function umfeld() {
      const v = FILTER_VERHAELTNIS[stufe];
      const r = FILTER_ROESTUNG[art];
      const z = ziel();
      anzeige.textContent = gramm + ' g';
      regler.value = String(gramm);
      const st = verhStufen && verhStufen.children[stufe];
      const charakter = (st && st.dataset.charakter) || v.charakter;
      regler.setAttribute('aria-valuetext', wortlaut(fluss, 'Gramm', gramm + ' Gramm', { n: gramm }));
      verhaeltnisZahl.textContent = dz(v.anzeige);
      if (verhLiter) verhLiter.textContent = wortlaut(fluss, 'Liter', v.proLiter + ' Kaffee pro Liter', { n: dz(v.proLiter) });
      if (verhCharakter) verhCharakter.textContent = charakter;
      if (verhAnzeige) verhAnzeige.textContent = dz(v.anzeige);
      verhRegler.value = String(stufe);
      verhRegler.setAttribute('aria-valuetext',
        dz(v.anzeige).replace(' : ', wortlaut(fluss, 'Zu', ' zu ')) + ', ' + charakter.charAt(0).toLowerCase() + charakter.slice(1));
      if (verhStufen) {
        gsap.utils.toArray('span', verhStufen).forEach((st, i) => st.classList.toggle('ist-aktiv', i === stufe));
      }
      hinweisTemp.textContent = wortlaut(fluss, 'Hinweis' + gross(art), r.hinweis);
      // Die beiden Sätze in den Schrittkarten 03 und 04. Sie laufen auch
      // mit, wenn die Karte unter 860 px gerade eingeklappt ist.
      if (bloomSatz) bloomSatz.textContent = wortlaut(fluss, 'Bloom', z.bloom + ' g Wasser angiessen, dann 30 bis 45 Sekunden warten.', { n: z.bloom });
      if (gussSatz) gussSatz.textContent = wortlaut(fluss, 'Guss', 'Auf insgesamt ' + z.wasser + ' g aufgiessen.', { n: z.wasser });
      // Wie auf espresso.html nur die Entscheidungen, nicht die Grammzahl:
      // Die ändert sich beim Ziehen laufend und steht gross darüber.
      if (satz) satz.textContent = wortlaut(fluss, 'Satz' + gross(art), 'Grundrezept für ' + r.wort + ' im Verhältnis ' + v.anzeige + '.', { v: dz(v.anzeige) });
      if (stufenleiste) {
        gsap.utils.toArray('span', stufenleiste)
          .forEach((st) => st.classList.toggle('ist-aktiv', Number(st.textContent) === gramm));
      }
    }

    function aktualisieren(sofort) {
      const z = ziel();
      // Der Balken folgt dem Verhältnis, nicht der Grammzahl. Beim Ziehen
      // am Gramm-Regler bleibt er stehen, er bewegt sich nur mit der Stufe.
      const anteil = FILTER_VERHAELTNIS[stufe].faktor;
      umfeld();

      if (ruhig || sofort) {
        Object.assign(zeigt, z);
        malen();
        teilWasser.style.flexGrow = anteil;
        return;
      }

      gsap.to(zeigt, Object.assign({}, z, {
        duration: 0.45, ease: 'power2.out', overwrite: true, onUpdate: malen
      }));
      gsap.to(teilWasser, { flexGrow: anteil, duration: 0.5, ease: 'bw-aus', overwrite: true });
    }

    // Wie in rezeptur(): Eine eigene Eingabe beendet den Auftrittszähler.
    function eingriff() {
      if (auftritt) { auftritt.kill(); auftritt = null; }
    }

    function aktivSetzen(gruppe, knopf) {
      gruppe.querySelectorAll('button').forEach((b) => {
        const aktiv = b === knopf;
        b.classList.toggle('ist-aktiv', aktiv);
        b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
      });
    }

    regler.addEventListener('input', () => {
      const neu = parseInt(regler.value, 10);
      if (neu === gramm) return;
      eingriff();
      gramm = neu;
      aktualisieren();
      if (!ruhig) gsap.fromTo(anzeige, { scale: 0.86 }, { scale: 1, duration: 0.3, ease: 'back.out(2.4)' });
    });

    verhRegler.addEventListener('input', () => {
      const neu = parseInt(verhRegler.value, 10);
      if (neu === stufe) return;
      eingriff();
      stufe = neu;
      aktualisieren();
      if (!ruhig) {
        gsap.fromTo([verhaeltnisZahl, verhAnzeige].filter(Boolean), { scale: 0.86 },
          { scale: 1, duration: 0.3, ease: 'back.out(2.4)' });
      }
    });

    schalter.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf || knopf.dataset.roestung === art) return;
      eingriff();
      art = knopf.dataset.roestung;

      const vorher = ruhig ? null : Flip.getState(fuellung);
      aktivSetzen(schalter, knopf);
      fuellung.style.left = art === 'dunkel' ? 'calc(50% + 2px)' : '4px';
      if (vorher) Flip.from(vorher, { duration: 0.45, ease: 'bw-aus' });

      aktualisieren();
    });

    aktualisieren(true);
    if (ruhig) return;

    // Eigener Auftrittszähler wie in rezeptur(), aus demselben Grund.
    const start = { anteil: 0 };
    const endwerte = Object.assign({}, zeigt);
    auftritt = gsap.to(start, {
      anteil: 1,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: fluss.querySelector('.rezeptur-ergebnis'), start: 'top 88%', once: true },
      onUpdate() {
        Object.keys(endwerte).forEach((k) => { zeigt[k] = endwerte[k] * start.anteil; });
        malen();
      },
      onComplete() { auftritt = null; aktualisieren(true); }
    });
  }

  /* ======================================================================
     Das Schritteband der Routine
     Ab 860 px ein waagrechtes Wischband, darunter Karten untereinander mit
     Klappknopf. Die Umschaltung macht das CSS, hier haengt nur, was sich
     nicht in CSS sagen laesst: die Pfeile und der Auftritt.
     Der Auftritt ersetzt data-batch. Das blendet mit y ein, also von unten,
     was nebeneinander stehende Karten seltsam aussehen laesst. Waagrecht
     kommt x, wie bei der Kaffee-Reihe (kaffees.js).
     ====================================================================== */
  function schritteBand(zielBand, zielPfeile) {
    const band = document.querySelector(zielBand);
    if (!band) return;
    const karten = gsap.utils.toArray(":scope > *", band);
    if (!karten.length) return;

    if (window.BW && window.BW.spurPfeile) {
      window.BW.spurPfeile(band, document.querySelector(zielPfeile));
    }

    if (ruhig || !window.gsap || !window.ScrollTrigger) return;

    // Waagrecht oder untereinander? Die Frage entscheidet nur die Richtung
    // des Auftritts, gemessen am tatsaechlichen Layout statt an einer
    // Breitenzahl: So stimmt es auch, wenn jemand die Stufe im CSS
    // verschiebt.
    const waagrecht = getComputedStyle(band).display === "flex";
    gsap.set(karten, waagrecht ? { opacity: 0, x: 60 } : { opacity: 0, y: 46 });
    ScrollTrigger.create({
      trigger: band,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(karten, {
        opacity: 1, x: 0, y: 0, duration: 1, stagger: 0.08, ease: "bw-aus", overwrite: "auto"
      })
    });
  }

  /* ======================================================================
     Aufklappbares Raster
     Eine Reihe steht voll, die naechste halb hoch und nach unten
     ausblendend, der Rest liegt per display:none gar nicht erst im Layout.
     Bewusst ausserhalb des Filters: Der Getraenke-Hub hat einen, das
     Maschinenraster nicht, und die Mechanik ist in beiden dieselbe.
     Geklappt wird ueber eine Klasse am Raster, nie ueber das
     hidden-Attribut. Das gehoert dem Filter, und eine Karte, die der Filter
     fuer verborgen haelt, bekaeme ihr opacity:1 nie.
     ====================================================================== */
  function klappRaster(zielRaster, zielMehr, optionen) {
    const raster = document.querySelector(zielRaster);
    const mehr = zielMehr ? document.querySelector(zielMehr) : null;
    if (!raster || !mehr) return null;

    const o = optionen || {};
    // :scope > * statt einer Klasse: Im Maschinenraster stehen die Verweisbox
    // und die Guide-Karten nebeneinander und teilen keine Klasse. basis.js
    // waehlt die Kinder von data-batch genauso aus.
    const zellen = gsap.utils.toArray(":scope > *", raster);
    const animiert = !ruhig && !!window.gsap;
    const gilt = o.gilt || (() => true);
    // Ohne Option liest es die Wörter am Knopf (data-text-zu mit {n} für die
    // Zahl der Zellen, data-text-auf), im Theme aus den Sprachdateien.
    const wortZu = o.zu || wortlaut(mehr, "Zu", "Alles anzeigen", { n: zellen.length });
    const wortAuf = o.auf || wortlaut(mehr, "Auf", "Weniger anzeigen");
    // hart: Kein Anschnitt, sondern eine saubere Kante. Das CSS nimmt dann
    // Maske und max-height zurueck, display:none regelt die Hoehe allein.
    // Gemessen werden muss dafuer nichts, und vor allem darf es keine
    // angedeutete Reihe geben: Wer nichts andeutet, darf auch nichts
    // anbieten, sonst zeigte die letzte volle Karte einen Zeiger und
    // klappte beim Antippen auf.
    const hart = !!o.hart;
    let offen = false;

    /* Die Hoehen der Klappmaske, zur Laufzeit gemessen. Feste Werte gingen
       nicht: Zwei Reihen koennen verschieden hoch sein, weil ein Titel
       umbricht, und --gap waechst mit der Fensterbreite.
       Gemessen wird im eingeklappten Zustand. max-height verschiebt die
       Karten nicht, es beschneidet nur die Box, die Lagen stimmen also. */
    function klappMasse() {
      if (hart || !raster.classList.contains("ist-eingeklappt")) {
        zellen.forEach((z) => z.classList.remove("ist-angedeutet"));
        return;
      }
      // offsetTop und offsetHeight statt getBoundingClientRect: Die Karten
      // tragen waehrend der Filter- und Auftrittsanimation GSAP-Transforms,
      // und die rechnet getBoundingClientRect mit. Die Reihen wuerden dann
      // falsch gruppiert. Layout-Eigenschaften ignorieren Transforms.
      const kasten = zellen.filter((z) => z.getClientRects().length);
      if (kasten.length < 2) return;

      const oben = raster.offsetTop;
      const reihen = [];
      kasten.forEach((z) => {
        const y = z.offsetTop - oben;
        const reihe = reihen.find((x) => Math.abs(x.y - y) < 4);
        if (reihe) {
          reihe.hoehe = Math.max(reihe.hoehe, z.offsetHeight);
          reihe.zellen.push(z);
        } else {
          reihen.push({ y: y, hoehe: z.offsetHeight, zellen: [z] });
        }
      });
      if (reihen.length < 2) return;

      const vorletzte = reihen[reihen.length - 2];
      const letzte = reihen[reihen.length - 1];
      // 45 Prozent der letzten Reihe: die eine Zahl zum Drehen.
      const hoehe = letzte.y + letzte.hoehe * 0.45;

      raster.style.setProperty("--klapp-voll", Math.round(vorletzte.y + vorletzte.hoehe) + "px");
      raster.style.setProperty("--klapp-zwei", Math.round(letzte.y) + "px");
      raster.style.setProperty("--klapp-hoehe", Math.round(hoehe) + "px");

      // Die halb ausgeblendete Reihe ist eine Andeutung, kein Angebot. Wer
      // sie antippt, will mehr sehen und nicht eines davon oeffnen.
      zellen.forEach((z) => z.classList.remove("ist-angedeutet"));
      letzte.zellen.forEach((z) => z.classList.add("ist-angedeutet"));
    }

    function klappStand() {
      const klappbar = !!gilt();
      raster.classList.toggle("ist-eingeklappt", klappbar && !offen);
      mehr.hidden = !klappbar;
      mehr.setAttribute("aria-expanded", String(offen));
      mehr.querySelector(".wort").textContent = offen ? wortAuf : wortZu;
      klappMasse();
    }

    function umklappen() {
      // Welche Zellen liegen gerade gar nicht im Layout? Genau die blenden
      // wir ein. So stimmt es auf jeder Breite, ohne die Stufen aus dem CSS
      // im Skript zu wiederholen. Noetig ist es auch wegen data-batch:
      // basis.js setzt alle Kinder auf opacity:0, und fuer die verborgenen
      // feuert der ScrollTrigger mit once:true nie.
      const versteckt = zellen.filter((z) => z.getClientRects().length === 0);
      offen = !offen;
      klappStand();
      if (offen && animiert && versteckt.length) {
        gsap.fromTo(versteckt, { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "bw-aus", overwrite: true });
      }
      if (!offen) mehr.scrollIntoView({ block: "center", behavior: ruhig ? "auto" : "smooth" });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    mehr.addEventListener("click", umklappen);

    raster.addEventListener("click", (e) => {
      if (!raster.classList.contains("ist-eingeklappt")) return;
      // Cmd-, Ctrl-, Shift- und Mittelklick sollen weiterhin dem Link folgen.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const zelle = zellen.find((z) => z.contains(e.target));
      if (!zelle || !zelle.classList.contains("ist-angedeutet")) return;
      // Enter auf einem Anker erzeugt einen nativen click, die Tastatur
      // laeuft also ohne eigenen keydown-Zweig mit.
      e.preventDefault();
      umklappen();
    });

    if (window.ScrollTrigger) {
      // refreshInit feuert bei Fensteraenderung, nach dem Laden der Bilder
      // und bei jedem fremden refresh(). ScrollTrigger drosselt selbst.
      ScrollTrigger.addEventListener("refreshInit", klappMasse);
    }

    klappStand();
    return { neuBewerten: klappStand };
  }

  /* ======================================================================
     Rezeptraster mit Filter
     Die Karten stehen im Markup und werden nur aus- und eingeblendet, nicht
     neu gezeichnet. Zwei Gründe: werkzeug/teaser-abgleichen.rb pflegt sie im
     HTML, und feinschliff() in basis.js bindet Anheben und Bild-Parallax
     einmalig beim Start. Das Filterkennzeichen sitzt auf der Kachel, weil ein
     weiteres Attribut am Anker das Abgleichskript blind machen würde.
     ====================================================================== */
  function getraenkeFilter(zielRaster, zielLeiste, zielMehr) {
    const raster = document.querySelector(zielRaster);
    const leiste = document.querySelector(zielLeiste);
    if (!raster || !leiste) return;

    const kacheln = gsap.utils.toArray("[data-art]", raster);
    const knoepfe = gsap.utils.toArray(".filter-knopf", leiste);
    const animiert = !ruhig && !!window.gsap;
    const sichtbar = () => kacheln.filter((k) => !k.hidden);

    let aktiv = "alle";
    let ausblenden = null;

    // «Alle» und eine einzige Gruppe sind kein Filter: Im Theme stehen nur
    // Knöpfe für Gruppen mit Rezepten, vor dem Start nur die Signature Drinks.
    leiste.hidden = knoepfe.length < 3;

    /* Das Klappen sitzt in einer eigenen Funktion, weil das Maschinenraster
       ohne Filter dasselbe braucht. Die einzige Verbindung hierher ist
       gilt(): Nur bei "alle" gibt es ueberhaupt etwas zu klappen, die drei
       Gruppen haben sechs, sechs und eine Karte. */
    // Eingeklappt lässt das CSS 8 Karten stehen, bis 1080 px 6 (seiten.css,
    // .rezepte-raster--vier.ist-eingeklappt). Sind es nicht mehr, gibt es
    // nichts aufzuklappen, im Theme etwa vor dem Start mit 6 Rezepten.
    const schmal = window.matchMedia("(max-width:1080px)");
    const mehrKnopf = zielMehr ? document.querySelector(zielMehr) : null;
    const klapp = klappRaster(zielRaster, zielMehr, {
      gilt: () => aktiv === "alle" && kacheln.length > (schmal.matches ? 6 : 8),
      zu: wortlaut(mehrKnopf, "Zu", "Alle {n} Rezepte anzeigen", { n: kacheln.length })
    });
    if (klapp && schmal.addEventListener) schmal.addEventListener("change", klapp.neuBewerten);

    function umschalten() {
      kacheln.forEach((k) => {
        k.hidden = !(aktiv === "alle" || k.dataset.art === aktiv);
      });
      if (klapp) klapp.neuBewerten();
      // Anders als bei der waagrechten Kaffee-Reihe auf der Startseite ändert
      // sich hier die Seitenhöhe. Ohne refresh halten der Bild-Parallax und
      // alle Trigger weiter unten veraltete Start- und Endwerte.
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    function waehlen(filter) {
      if (filter === aktiv) return;
      aktiv = filter;

      knoepfe.forEach((knopf) => {
        const an = knopf.dataset.filter === filter;
        knopf.classList.toggle("ist-aktiv", an);
        knopf.setAttribute("aria-pressed", String(an));
      });

      if (!animiert) {
        umschalten();
        if (window.gsap) gsap.set(kacheln, { opacity: 1, y: 0 });
        return;
      }

      // Ein früherer Klick kann noch mitten im Aus- oder Einblenden stecken.
      if (ausblenden) ausblenden.kill();
      gsap.killTweensOf(kacheln, "opacity,y");

      ausblenden = gsap.to(sichtbar(), {
        opacity: 0, y: -14, duration: 0.18, ease: "power2.in",
        onComplete: () => {
          ausblenden = null;
          umschalten();
          gsap.set(kacheln, { y: 0 });
          gsap.fromTo(sichtbar(),
            { opacity: 0, y: 34 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "bw-aus" });
        }
      });
    }

    knoepfe.forEach((knopf) => {
      knopf.addEventListener("click", () => waehlen(knopf.dataset.filter));
    });

    if (animiert && window.ScrollTrigger) {
      gsap.set(kacheln, { opacity: 0, y: 46 });
      ScrollTrigger.create({
        trigger: raster,
        start: "top 88%",
        once: true,
        onEnter: () => {
          if (ausblenden) return;
          gsap.to(sichtbar(), {
            opacity: 1, y: 0, duration: 1, stagger: 0.06, ease: "bw-aus", overwrite: "auto"
          });
        }
      });
    }

    umschalten();
  }

  /* ======================================================================
     Maschinenfinder
     Derselbe Fragebogen wie auf welcher-kaffee.html, nur eine Ebene tiefer
     und mit anderen Daten. Ein Ergebnis ist immer ein maschine-Schlüssel
     aus BARISTA_GUIDES, deshalb braucht es keine zweite Zieltabelle.
     Bewusst ohne Hash in der Adresse: Die gehört auf dieser Seite den
     Sektionsankern, sonst kommt sich der Finder mit ankersprung() in die
     Quere.
     ====================================================================== */
  const MASCHINEN_FRAGEN = {
    aufwand: {
      titel: "Wie viel willst Du selbst in der Hand haben?",
      antworten: [
        { text: "Mahlen, tampern, Zeit stoppen", zusatz: "Ich will jeden Schritt selbst steuern", weiter: "bereit" },
        { text: "Knopf drücken, fertig", zusatz: "Guter Kaffee ohne Handgriffe", weiter: "bohnen" },
        { text: "Auf dem Herd, ohne Strom", zusatz: "Klein, günstig, überall dabei", ergebnis: "bialetti" }
      ]
    },
    bereit: {
      titel: "Wie lange darf sie morgens brauchen?",
      antworten: [
        { text: "Zwei, drei Minuten", zusatz: "Ich will nicht auf einen Kessel warten", ergebnis: "thermoblock" },
        { text: "Sie darf in Ruhe vorheizen", zusatz: "Stabile Temperatur ist mir wichtiger", weiter: "milch" }
      ]
    },
    milch: {
      titel: "Wie viel Milchschaum brauchst Du?",
      antworten: [
        { text: "Mehrere Cappuccini hintereinander", zusatz: "Brühen und schäumen am besten gleichzeitig", ergebnis: "zweikreiser" },
        { text: "Fast nur Espresso pur", zusatz: "Milch höchstens ab und zu", ergebnis: "einkreiser" }
      ]
    },
    bohnen: {
      titel: "Ganze Bohnen oder möglichst wenig Handgriffe?",
      antworten: [
        { text: "Ganze Bohnen, frisch gemahlen", zusatz: "Mahlwerk eingebaut, der Rest automatisch", ergebnis: "vollautomat" },
        { text: "So wenig Aufwand wie möglich", zusatz: "Kapsel rein, Knopf drücken", ergebnis: "kapsel" }
      ]
    }
  };

  // Ein Satz je Bauart, der die Empfehlung begründet.
  const MASCHINEN_GRUND = {
    einkreiser: "Ein Kessel für beides. Du ziehst erst den Espresso und schäumst danach. Für alle, die Milch eher ab und zu brauchen und dafür eine ruhige, stabile Maschine wollen.",
    zweikreiser: "Zwei Kreisläufe, also brühen und schäumen gleichzeitig. Wenn mehrere Cappuccini hintereinander herauskommen sollen, ist das der Weg.",
    thermoblock: "Keine Kesselaufheizzeit, in zwei bis drei Minuten bist Du bereit. Dafür schwankt die Temperatur stärker, das gleichst Du mit einem kurzen Leerbezug aus.",
    vollautomat: "Mahlwerk eingebaut, der Rest läuft auf Knopfdruck. Mahlgrad, Menge und Temperatur lassen sich trotzdem einstellen, und genau das nutzen die wenigsten.",
    kapsel: "Am wenigsten Aufwand. Wassermenge und Tasse machen mehr aus, als die meisten denken, damit holst Du spürbar mehr heraus.",
    bialetti: "Kein Espresso im engeren Sinn, aber der Klassiker am Herd. Klein, günstig, ohne Strom, und mit kleiner Hitze gar nicht heikel."
  };

  function maschinenfinder() {
    if (!document.getElementById("maschinenfinder")) return;
    finderTexte();

    // Die sechs Ergebnisse jetzt bauen, nicht erst beim Klick: So erwischt
    // feinschliff() aus basis.js die Karten beim Start und hängt Anheben
    // und Parallax an.
    fragebogen({
      praefix: "maschinen",
      start: "aufwand",
      fragen: MASCHINEN_FRAGEN,
      treffer: BARISTA_GUIDES.map((g) => { const w = weg(g, GRUNDREZEPT_ESPRESSO); return `
            <article class="finder-treffer maschinen-treffer" data-ergebnis="${g.maschine}" hidden>
              <div>
                <span class="eyebrow">${(FT && FT.deine_bauart) || "Deine Bauart"}</span>
                <h2 tabindex="-1">${g.name}</h2>
                <p>${MASCHINEN_GRUND[g.maschine]}</p>
              </div>
              <a class="brewguide" href="${w.datei}">
                ${maschinenFoto(g)}
                <span class="brewguide-koerper">
                  <span class="brewguide-meta">
                    ${g.werte.map(x => `<span class="wert">${x}</span>`).join("")}
                  </span>
                  <h3>${g.name}</h3>
                  <p>${g.text}</p>
                  <span class="mehr">${w.knopf}
                    <svg class="pfeil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </span>
                </span>
              </a>
            </article>`; }).join("")
    });
  }

  /* ======================================================================
     Fragebogen
     Der Ablauf, den Maschinen- und Methodenfinder teilen: eine Frage nach
     der anderen, Zurück, Neu starten, am Ende genau ein Treffer. Die
     Treffer baut die aufrufende Funktion, hier hängt nur die Mechanik.
       o.praefix  Vorsilbe der IDs, "maschinen" sucht #maschinen-frage usw.
       o.start    Schlüssel der ersten Frage
       o.fragen   je Schlüssel titel und antworten, eine Antwort führt mit
                  weiter zur nächsten Frage oder mit ergebnis zum Treffer
       o.treffer  HTML aller Treffer, je mit data-ergebnis und hidden
     ====================================================================== */
  /* Texte der Finder im Theme
     Steht ein Datenblock #bw-finder-texte in der Seite (Maschinen- und
     Methodenfinder im Shopify-Theme), legt finderTexte() dessen übersetzte
     Fragen, Antworten, Begründungen, Guide-Daten, Ersatzziele und Labels
     über die deutschen Daten hier. Guide-Adressen kommen nur für Guides, die
     im Shop veröffentlicht sind; Ersatzziele zeigen auf echte Seiten. Ohne
     Block bleibt alles wie im Prototyp. Shopify maskiert übersetzte Texte,
     deshalb werden sie einmal zurückgewandelt. */
  let FT = null;
  let finderTexteGelesen = false;
  function entschluesseln(w) {
    if (typeof w === "string") {
      const t = document.createElement("textarea");
      t.innerHTML = w;
      return t.value;
    }
    if (Array.isArray(w)) return w.map(entschluesseln);
    if (w && typeof w === "object") {
      const o = {};
      Object.keys(w).forEach((k) => { o[k] = entschluesseln(w[k]); });
      return o;
    }
    return w;
  }
  function finderTexte() {
    if (finderTexteGelesen) return FT;
    finderTexteGelesen = true;
    const el = document.getElementById("bw-finder-texte");
    if (!el) return null;
    try { FT = entschluesseln(JSON.parse(el.textContent)); } catch (e) { FT = null; return null; }
    const fragenSetzen = (fragen) => Object.keys(fragen).forEach((k) => {
      const t = FT.fragen && FT.fragen[k];
      if (!t) return;
      if (t.titel) fragen[k].titel = t.titel;
      (t.antworten || []).forEach((a, i) => {
        const ziel = fragen[k].antworten[i];
        if (!ziel || !a) return;
        if (a.text) ziel.text = a.text;
        if ("zusatz" in a) ziel.zusatz = a.zusatz;
      });
    });
    fragenSetzen(MASCHINEN_FRAGEN);
    fragenSetzen(METHODEN_FRAGEN);
    if (FT.grund) {
      Object.keys(MASCHINEN_GRUND).forEach((k) => { if (FT.grund[k]) MASCHINEN_GRUND[k] = FT.grund[k]; });
      Object.keys(METHODEN_GRUND).forEach((k) => { if (FT.grund[k]) METHODEN_GRUND[k] = FT.grund[k]; });
    }
    if (FT.guides) {
      BARISTA_GUIDES.concat(GUIDES).forEach((g) => {
        const t = FT.guides[g.maschine || g.geraet];
        if (t) Object.assign(g, t);
      });
    }
    if (FT.ziele) {
      const ziele = { ersatz_v60: ERSATZ_V60, ersatz_coldbrew: ERSATZ_COLDBREW,
        grundrezept_filter: GRUNDREZEPT_FILTER, grundrezept_espresso: GRUNDREZEPT_ESPRESSO,
        bohnen_klassisch: BOHNEN_KLASSISCH, espresso_rezepte: ESPRESSO_REZEPTE };
      Object.keys(ziele).forEach((k) => { if (FT.ziele[k]) Object.assign(ziele[k], FT.ziele[k]); });
    }
    return FT;
  }

  function fragebogen(o) {
    const id = (name) => document.getElementById(o.praefix + "-" + name);
    const frageEl = id("frage");
    const ergebnisEl = id("ergebnis");
    const schrittEl = id("schritt");
    const zurueckEl = id("zurueck");
    const titelEl = id("titel");
    const antwortenEl = id("antworten");
    const neuEl = id("neu");
    const trefferRaum = id("treffer");
    if (!frageEl || !ergebnisEl || !antwortenEl || !trefferRaum) return;

    trefferRaum.innerHTML = o.treffer;

    const treffer = gsap.utils.toArray("[data-ergebnis]", trefferRaum);
    let verlauf = [];

    function sichtbar() {
      return [frageEl, ergebnisEl].find((el) => !el.hidden);
    }

    function fokus() {
      const ziel = !frageEl.hidden
        ? titelEl
        : trefferRaum.querySelector("[data-ergebnis]:not([hidden]) h2");
      if (ziel) ziel.focus({ preventScroll: true });
    }

    function wechseln(einsetzen) {
      const alt = sichtbar();
      const danach = () => {
        einsetzen();
        const neu = sichtbar();
        fokus();
        if (ruhig || !window.gsap || !neu) return;
        gsap.fromTo(neu, { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: "bw-aus", overwrite: true });
      };
      if (ruhig || !window.gsap || !alt) { danach(); return; }
      gsap.to(alt, { opacity: 0, y: -12, duration: 0.22, ease: "power2.in", overwrite: true, onComplete: danach });
    }

    function frage(schluessel) {
      const fr = o.fragen[schluessel];
      ergebnisEl.hidden = true;
      frageEl.hidden = false;
      schrittEl.textContent = ((FT && FT.frage) || "Frage {n}").replace("{n}", verlauf.length + 1);
      zurueckEl.hidden = verlauf.length === 0;
      titelEl.textContent = fr.titel;
      antwortenEl.dataset.frage = schluessel;
      antwortenEl.innerHTML = fr.antworten.map((a, i) =>
        "<button type=\"button\" data-index=\"" + i + "\">" + a.text +
        (a.zusatz ? "<span class=\"zusatz\">" + a.zusatz + "</span>" : "") +
        "</button>").join("");
    }

    function ergebnis(art) {
      frageEl.hidden = true;
      ergebnisEl.hidden = false;
      treffer.forEach((el) => { el.hidden = el.dataset.ergebnis !== art; });
    }

    antwortenEl.addEventListener("click", (e) => {
      const knopf = e.target.closest("button");
      if (!knopf) return;
      const schluessel = antwortenEl.dataset.frage;
      const antwort = o.fragen[schluessel].antworten[Number(knopf.dataset.index)];
      if (!antwort) return;
      knopf.classList.add("ist-aktiv");
      verlauf.push(schluessel);
      if (antwort.weiter) wechseln(() => frage(antwort.weiter));
      else wechseln(() => ergebnis(antwort.ergebnis));
    });

    zurueckEl.addEventListener("click", () => {
      const vorher = verlauf.pop();
      if (vorher) wechseln(() => frage(vorher));
    });

    neuEl.addEventListener("click", () => {
      verlauf = [];
      wechseln(() => frage(o.start));
    });

    verlauf = [];
    frage(o.start);
  }

  /* ======================================================================
     Methodenfinder
     Das Gegenstück zum Maschinenfinder für den Filter-Hub, auf
     welche-filtermethode.html. Ein Ergebnis ist immer ein geraet-Schlüssel
     aus GUIDES. Höchstens drei Fragen, Cold Brew schon nach der ersten.
     Ist der Guide noch nicht geschrieben, sagt der Treffer das und nennt
     den Ersatz, zu dem auch die Karte führt.
     ====================================================================== */
  const METHODEN_FRAGEN = {
    temperatur: {
      titel: "Heiss oder kalt?",
      antworten: [
        { text: "Heiss, frisch aufgegossen", zusatz: "Die klassische Tasse am Morgen", weiter: "tassen" },
        { text: "Kalt, über Nacht angesetzt", zusatz: "Mild und süss, für heisse Tage", ergebnis: "coldbrew" }
      ]
    },
    tassen: {
      titel: "Für wie viele Tassen auf einmal?",
      antworten: [
        { text: "Eine, meistens für mich", zusatz: "Frisch gebrüht, Tasse für Tasse", weiter: "tempo" },
        { text: "Zwei oder mehr", zusatz: "Für den Frühstückstisch oder Besuch", weiter: "koerper" }
      ]
    },
    tempo: {
      titel: "In Ruhe aufgiessen oder schnell und überall?",
      antworten: [
        { text: "In Ruhe, Schritt für Schritt", zusatz: "Ich giesse gern selbst auf und schaue zu", ergebnis: "v60" },
        { text: "Schnell und robust", zusatz: "Auch im Büro oder auf Reisen", ergebnis: "aeropress" }
      ]
    },
    koerper: {
      titel: "Klar und leicht oder vollmundig?",
      antworten: [
        { text: "Klar und leicht", zusatz: "Möglichst sauber, jede Note für sich", ergebnis: "chemex" },
        { text: "Vollmundig", zusatz: "Mehr Körper, gern auch etwas Öl in der Tasse", ergebnis: "frenchpress" }
      ]
    }
  };

  // Ein Satz je Methode, der die Empfehlung begründet.
  const METHODEN_GRUND = {
    v60: "Der Klassiker unter den Handfiltern. Du giesst selbst auf und steuerst jeden Schritt, dafür bekommst Du eine klare, saubere Tasse. Der beste Weg, eine Bohne kennenzulernen.",
    chemex: "Dickeres Filterpapier und eine grosse Karaffe. Die Chemex ergibt die klarste Tasse von allen und reicht locker für zwei oder drei.",
    frenchpress: "Ganz ohne Papier, die Öle bleiben im Kaffee. Das gibt mehr Körper, und für mehrere Tassen gibt es kaum etwas Einfacheres.",
    aeropress: "Schnell, robust und fast unzerbrechlich. Der leichte Druck holt Süsse aus fast jeder Bohne, und sie passt in jede Tasche.",
    coldbrew: "Kalt angesetzt und über Nacht gezogen. Das ergibt einen milden, süssen Kaffee mit wenig Säure, pur auf Eis oder als Basis für Sommerdrinks."
  };

  function methodenfinder() {
    if (!document.getElementById("methodenfinder")) return;
    finderTexte();

    // Die Klasse maschinen-treffer bleibt bewusst: Das zweispaltige Layout
    // der Treffer hängt daran, und es passt hier genauso.
    fragebogen({
      praefix: "methoden",
      start: "temperatur",
      fragen: METHODEN_FRAGEN,
      treffer: GUIDES.map((g) => `
        <article class="finder-treffer maschinen-treffer" data-ergebnis="${g.geraet}" hidden>
          <div>
            <span class="eyebrow">${(FT && FT.deine_methode) || "Deine Methode"}</span>
            <h2 tabindex="-1">${g.name}</h2>
            <p>${METHODEN_GRUND[g.geraet]}</p>
            ${g.stand === "geplant" && vorschau ? `<p class="finder-anleitung"><strong>Der Guide folgt.</strong> Bis dahin ist ${weg(g, GRUNDREZEPT_FILTER).wort} Dein Startpunkt.</p>` : ""}
          </div>${guideKarte(g)}
        </article>`).join("")
    });
  }

  /* ======================================================================
     Espresso-Hub

     Im Seitenkopf haelt seit dem 30.09.2026 eine versteckte Hand einen
     Pappsticker mit dem SUP-Signet aus dem Wasser, gezeichnet von
     bwPappsticker() in illustrationen.js. Davor stand dort der Siebtraeger
     in der Bruehgruppe; er liegt jetzt auf archiv.html und wird dort als
     Standbild gezeigt. Seine Zeitleiste steht in der Git-Historie, zuletzt
     im Stand 6278938.
     ====================================================================== */
  function espresso() {
    // Die gezeichneten Getränkegläser stehen seit dem 26.09.2026 auf
    // archiv.html. Die Sektion #getraenke zeigt hier alle Rezepte als Fotos.
    rezeptur();
    pappsticker(STICKER);
  }

  /* Wissensseite: im Kopf seit dem 04.10.2026 die Frau auf dem Jetski als
     Pappsticker, sie faehrt beim Scrollen nach rechts. Entstanden im
     Wissenkopf-Labor. Der Rest der Seite laeuft ueber wissen.js. */
  function wissen() {
    pappsticker(JETSKI);
  }

  /* Seite nicht gefunden: nur der Sticker im Kopf. */
  function verloren() {
    pappsticker(VERLOREN);
  }

  /* Der Pappsticker im Seitenkopf
     Gebaut wie der Arm im Filterkaffee-Kopf: auftauchen, dann Heben und
     Neigen im Takt der Wellen, mit denselben Dauern 4,1 und 5,3 Sekunden.
     Sonne und Wellen belebt basis.js ueber data-sonne und data-wellen.

     Beim Scrollen reitet er ueber STICKER.wellen Kaemme nach links und
     denkt «Rettung naht, Espressotasse!». Die Fahrt baut auf den Faehren
     der Startseite auf (window.BWFaehren aus faehren.js, Stile in
     faehren.css): eine an den Scroll gebundene Zeitleiste der Laenge 1 mit
     Scrub, beim Hochscrollen laeuft sie von selbst zurueck.

     Jede Bewegung hat ihre eigene Ebene, damit sich keine Tweens in die
     Quere kommen:

       .sticker-spur    Auftritt (y, autoAlpha)
       .sticker-weg     Fahrt beim Scrollen (x, y), traegt die Blase
       .sticker-welle   Neigen beim Scrollen (rotation), ohne Blase, sonst
                        stuende der Text schief
       .sticker-dreh    Heben und Neigen im Leerlauf um die versteckte Hand

     Die Welle steckt in zwei eigenen Ease-Funktionen. kamm hebt ihn, 0 in
     Ruhe und 1 auf dem Kamm; tiefer als die Ruhehoehe geht er nie, denn
     dort liegt das Board keine 3 px ueber dem Wasser. hang ist die
     Steigung dazu: die Nase beim Steigen hoch, beim Fallen runter, auf dem
     Kamm gerade. Mit ganzzahligem STICKER.wellen steht er am Anfang und am
     Ende gerade und auf Hoehe 0.

     Die Blase haengt ueber dem Kopf des Mannes und nach rechts, nach links
     ragte sie in Lead und Knoepfe. Sie waechst nach 15 % der Fahrt und
     ploppt weg, wenn der Sticker wieder davor ist. Die Fahrt endet, wenn sie
     knapp unter der Kopfleiste steht (BWFaehren.fahrtEnde).

     Seit dem 04.10.2026 faehrt auch im Kopf der Wissensseite ein Sticker,
     die Frau auf dem Jetski (JETSKI). Ein Satz Werte je Kopf: kopf ist die
     id, motiv waehlt die Zeichnung in bwPappsticker(), richtung -1 faehrt
     nach links, 1 nach rechts. Die Richtung kehrt mit dem Weg auch jede
     Neigung um, damit die Nase in Fahrtrichtung zeigt: beim Steigen hoch,
     im Leerlauf und in Ruhe leicht angehoben. */
  const STICKER = {
    kopf: 'kopf-espresso',
    motiv: 'sup',
    richtung: -1,     // nach links
    gedanke: 'Rettung naht,\nEspressotasse!',
    drift: 0.2,       // Anteil der Kopfbreite, so weit faehrt er
    wellen: 2,        // Kaemme auf der Fahrt, ganzzahlig lassen
    hub: 0.06,        // Anteil der Stickerbreite, so hoch hebt ein Kamm
    neigung: 4,       // Grad, am steilsten Stueck des Hangs
    blaseAb: 0.15     // ab diesem Anteil der Fahrt denkt er laut
  };

  /* Die Jetski-Frau faehrt schneller als das SUP (Joscha, 04.10.2026: «die
     jetski frau darf ruhig etwas schneller unterwegs sein»). Die Fahrt
     haengt am Scroll, schneller heisst: auf demselben Scrollweg weiter.
     0,35 statt 0,2 der Kopfbreite, dazu drei Kaemme statt zwei, damit die
     Wellen so dicht bleiben wie beim SUP. Die Blase haengt nach rechts, in
     Fahrtrichtung und weg von Lead und Knoepfen links. */
  const JETSKI = {
    kopf: 'kopf-wissen',
    motiv: 'jetski',
    richtung: 1,      // nach rechts
    gedanke: 'Auf in die Kaffeewelt!',
    drift: 0.35,
    wellen: 3,
    hub: 0.06,
    neigung: 4,
    blaseAb: 0.15
  };

  /* Seite nicht gefunden (10.10.2026, Wunsch Joscha): der Mann mit dem
     Becher-Fernglas, Cyanblau auf Dunkelblau. Er faehrt nicht, er steht und
     schaut sich um (umschauen()). Die Blase steht gleich nach dem Auftritt,
     ohne Scrollen: Auf einer 404 scrollt kaum jemand. */
  const VERLOREN = {
    kopf: 'kopf-404',
    motiv: 'fernglas',
    richtung: -1,     // gespiegelt, er schaut nach links in die Seite
    seite: 'links',   // die Blase haengt in Blickrichtung ueber den Bechern
    gedanke: 'Upsi, 404-Fehler.\nIch kann die Seite nicht finden.',
    umschauen: true,
    winkel: 5,        // Grad, so weit neigt er sich nach links und rechts
    heben: 0.025,     // Anteil der Stickerbreite, so hoch reckt er sich dabei
    blaseNach: 1.3    // Sekunden nach dem Laden, dann denkt er laut
  };

  function pappsticker(o) {
    const kopf = document.getElementById(o.kopf);
    const spur = kopf && kopf.querySelector('.sticker-spur');
    const weg = spur && spur.querySelector('.sticker-weg');
    const welle = weg && weg.querySelector('.sticker-welle');
    if (!welle) return;

    // Positive Drehung hebt die linke Seite. Faehrt er nach links, ist das
    // die Nase, nach rechts muss es also umgekehrt sein.
    const nase = -o.richtung;
    welle.innerHTML = bwPappsticker({ motiv: o.motiv });
    const dreh = welle.querySelector('.sticker-dreh');
    const hand = bwPappsticker.haende[o.motiv];
    gsap.set(dreh, { svgOrigin: hand.punkt, rotation: 0, y: 0 });

    const B = window.BWFaehren;
    // Im Theme kommt der Gedanke übersetzt aus data-text-gedanke am Kopf;
    // ein Zeilenumbruch darin bleibt (white-space:pre-line).
    const gedanke = B ? B.gedankeAnhaengen(weg, o.seite || 'rechts', wortlaut(kopf, 'Gedanke', o.gedanke)) : null;

    if (ruhig) {
      // Keine Fahrt. Anders als bei den Faehren ist ueber dem Sticker Platz,
      // die Blase steht darum ruhig da. Wer sich umschaut, steht gerade,
      // sonst stuenden die Punkte der Blase neben seiner Stirn.
      gsap.set(dreh, { rotation: o.umschauen ? 0 : 2 * nase });
      if (gedanke) gsap.set(gedanke.children, { scale: 1, autoAlpha: 1 });
      return;
    }

    gsap.from(spur, { y: 40, autoAlpha: 0, duration: 1.2, ease: 'bw-aus', delay: 0.3 });
    gsap.to(dreh, { y: -5, duration: 4.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    if (o.umschauen) {
      umschauen(o, spur, welle, hand, gedanke);
      return;
    }
    gsap.to(dreh, { rotation: 2.5 * nase, duration: 5.3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.4 });

    // Ohne faehren.js keine Fahrt und kein Gedanke, der Sticker wiegt nur.
    if (!gedanke) return;

    const kamm = (p) => Math.pow(Math.sin(Math.PI * o.wellen * p), 2);
    const hang = (p) => Math.sin(2 * Math.PI * o.wellen * p);
    gsap.set(welle, { transformOrigin: hand.anteil });

    const fahrt = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: {
        trigger: kopf,
        // Ab dem ersten Pixel, wenn der Kopf das Fenster fuellt. clamp()
        // haelt den Start auf Scroll 0, wenn er niedriger ist.
        start: 'clamp(bottom bottom)',
        end: B.fahrtEnde(kopf, [gedanke]),
        scrub: 0.8,
        invalidateOnRefresh: true
      }
    })
      .fromTo(weg, { x: 0 }, { x: () => o.richtung * kopf.clientWidth * o.drift }, 0)
      .fromTo(weg, { y: 0 }, { y: () => -spur.clientWidth * o.hub, ease: kamm }, 0)
      // Positiv dreht im Uhrzeigersinn, die linke Seite geht hoch. Mit nase
      // geht beim Steigen immer die Seite in Fahrtrichtung hoch.
      .fromTo(welle, { rotation: 0 }, { rotation: o.neigung * nase, ease: hang }, 0);

    B.blasen(fahrt, [gedanke], o.blaseAb);
  }

  /* Umschauen statt fahren (die 404, seit dem 10.10.2026): Der Sticker
     bleibt stehen. Ueber die Zeit, nicht am Scroll, neigt er sich um die
     versteckte Hand nach links, haelt, nach rechts, haelt und kommt
     zurueck, dabei reckt er sich etwas, als suche er mit dem Fernglas den
     Horizont ab. Das Neigen liegt auf .sticker-welle, das Heben im
     Leerlauf weiter auf .sticker-dreh; die Blase haengt an .sticker-weg
     und bleibt gerade. Sie ploppt wie bei den Faehren auf, aber zur Zeit
     o.blaseNach statt ab einem Teil der Fahrt.
     Ihre Punkte steigen von der Stirn auf (der Anker steht dort, in
     seiten.css), damit kein anderer zu denken scheint. Beim Neigen wandert
     die Stirn um gut einen Zehntel der Stickerbreite zur Seite; folgen()
     fuehrt die Blase darum mit: dieselbe Drehung um die Hand und derselbe
     Hub, nur auf den Anker gerechnet, der Text bleibt gerade. */
  function umschauen(o, spur, welle, hand, gedanke) {
    gsap.set(welle, { transformOrigin: hand.anteil });
    const folgen = () => {
      if (!gedanke) return;
      const a = gsap.getProperty(welle, 'rotation') * Math.PI / 180;
      const [px, py] = hand.anteil.split(' ').map((v, i) => parseFloat(v) / 100 * (i ? welle.offsetHeight : welle.offsetWidth));
      const dx = gedanke.offsetLeft - px, dy = gedanke.offsetTop - py;
      gsap.set(gedanke, {
        x: dx * Math.cos(a) - dy * Math.sin(a) - dx,
        y: dx * Math.sin(a) + dy * Math.cos(a) - dy + gsap.getProperty(welle, 'y')
      });
    };
    if (gedanke) {
      const [klein, gross] = gedanke.querySelectorAll('.gedanke-punkt');
      const blase = gedanke.querySelector('.gedanke-blase');
      gsap.timeline({ delay: o.blaseNach })
        .fromTo(klein, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.4)' })
        .fromTo(gross, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.4)' }, '-=0.12')
        .fromTo(blase, { scale: 0.25, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.75, ease: 'back.out(1.6)' }, '-=0.1');
    }
    const hoch = () => -spur.clientWidth * o.heben;
    gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: o.blaseNach + 0.6, defaults: { ease: 'sine.inOut' }, onUpdate: folgen })
      .to(welle, { rotation: -o.winkel, y: hoch, duration: 1.2 })
      .to(welle, { rotation: o.winkel, duration: 1.8 }, '+=0.9')
      .to(welle, { rotation: 0, y: 0, duration: 1.2 }, '+=0.9');
  }

  /* ======================================================================
     Filterkaffee-Hub

     Im Seitenkopf ragt seit dem 30.09.2026 ein Arm aus dem Wasser und haelt
     den Hario-Buono-Kessel hoch, Element 98. Davor stand dort die
     Aufguss-Szene mit V60 und Karaffe; sie liegt jetzt auf archiv.html und
     wird dort als Standbild gezeigt.

     Seit dem 04.10.2026 schwimmt links ein V60 aus Keramik, bwV60() aus
     illustrationen.js, und faehrt beim Scrollen auf den Kessel zu, bis er
     unter der Tuelle steht. Beim Hochscrollen treibt er zurueck. Entstanden
     im Filterkopf-Labor, erst als Tasse, dann als V60. Die Laborfassung in
     filterkopf-labor.js bleibt zum Ausprobieren stehen, mit Messhelfer.

     Steht der V60 unter dem Schwanenhals, fliesst Wasser hinein, ebenfalls
     seit dem 04.10.2026 und nur hier, nicht im Labor. Siehe v60Giessen().
     ====================================================================== */

  /* Der V60 im Kopf. Alle Masse in Einheiten der gemeinsamen viewBox von
     Arm und V60, 228 mal 220. Herleitungen im Filterkopf-Labor.

     tuelleX    Mitte der Tuellenoeffnung als Anteil der Armbreite. Reine
                viewBox-Geometrie: Der Punkt (185.25, 86.15) der Kesselgruppe
                liegt ueber translate und rotate bei SVG (197.887, 141.989),
                das scaleX(-1) im CSS macht daraus 1 minus 197.887 / 228.
                Kein getScreenCTM() bei jedem Refresh: Die Matrix enthielte
                das Wippen des Arms, und das Ziel wanderte.
     zielLinks  so weit steht die Mitte am Ziel links der Tuelle, damit der
                Rand unter der Oeffnung steht und der Kessel frei bleibt
     randLinks  von der Mitte bis an den linkesten Punkt, den Griff (bei
                x 68,3 der gespiegelten Zeichnung)
     weg        Fahrtstrecke als Anteil der Bandbreite. Joscha wollte sie
                kurz und langsam: «lieber weniger, dafuer langsamer».
     ende       Die Fahrt endet, wenn die Kopfunterkante auf 40 Prozent der
                Fensterhoehe steht. Endete sie unter der Kopfleiste, waere
                die Ankunft schon aus dem Bild.
     tiefe      Die Scheibe schwimmt halb im Wasser. Gemessen ueber die Zeit:
                Sie ist in 58 bis 80 Prozent ganz frei, der Aufsatz taucht
                nur in tiefen Wellentaelern auf.
     takt       Halbe Periode des Wippens in Sekunden. Die Kaemme der
                vordersten Welle ziehen alle 6 Sekunden vorbei, dicht daran
                und mit Absicht nicht gleich.

     Der Strahl, alles in Einheiten des V60 und in Sekunden:
     strahlAn   So nah muss die Tuelle waagrecht an der Mitte des V60 sein,
                damit Wasser kommt. Am Ziel steht sie 4 bis 8 Einheiten
                daneben, das Wippen beider legt bis zu 7 dazu.
     strahlAus  Erst so weit daneben hoert er wieder auf. Der Abstand zu
                strahlAn verhindert, dass er an der Grenze flackert.
     drift      So weit treibt der Strahl auf dem Weg nach unten nach links,
                dorthin, wohin die Tuelle zeigt. Ein Schwanenhals giesst
                fast senkrecht.
     oeffnung   Halbe Breite der Oeffnung, in der der Strahl verschwinden
                kann: Rand 31,4, abzueglich Wand und Strahl.
     fallen     So lange braucht das erste Wasser bis in den Filter.
     abreissen  So lange faellt das letzte Stueck hinterher. */
  const V60 = {
    tuelleX: 0.132074, zielLinks: 10, randLinks: 46,
    weg: 0.2, ende: 'bottom 40%', tiefe: 3, takt: 3.1,
    strahlAn: 12, strahlAus: 20, drift: 3, oeffnung: 26, fallen: 0.35, abreissen: 0.3
  };

  /* Gerechnet wird mit der Mitte, bewegt wird die linke Kante, wie
     BWFaehren.kante(). Die Kastenmitte ist die Mitte des V60, er sitzt in
     seiner viewBox auf x 114. */
  const kanteBei = (spur, mitte) => mitte - spur.offsetWidth / 2;

  /* Die Fahrt am Scroll. scrub besorgt das Zuruecktreiben. Der Zielpunkt
     wird gemessen: offsetLeft und offsetWidth des Arms ignorieren transform,
     sein Wippen stoert also nicht, und invalidateOnRefresh liest beides bei
     jeder Breitenaenderung neu.

     Zwei Fallen aus dem Labor, beide nachgemessen:
     - immediateRender: false ist Pflicht. Sonst merkt sich GSAP den Start
       beim Anlegen, als der V60 noch auf x 0 stand, und bei Fortschritt 0
       springt er an den linken Bandrand.
     - Die Fahrt kommt VOR dem Auftritt. Ein gsap.from() merkt sich die
       ganze transform als Ziel, auch das x. Stand der V60 da noch auf 0,
       schrieb der Auftritt dieses x bei jedem Bild zurueck. */
  function v60Fahrt(kopf, spur, arm, band) {
    const einheit = () => spur.offsetWidth / 228;
    const ziel = () => arm.offsetLeft + arm.offsetWidth * V60.tuelleX - V60.zielLinks * einheit();
    const anfang = () => Math.max(V60.randLinks * einheit() + 8, ziel() - band.clientWidth * V60.weg);

    if (ruhig) {
      // Ohne Bewegung steht er gleich am Ziel, beim Kessel: das fertige Bild.
      const setzen = () => gsap.set(spur, { x: kanteBei(spur, ziel()) });
      setzen();
      window.addEventListener('resize', setzen);
      return;
    }

    gsap.set(spur, { x: kanteBei(spur, anfang()) });
    gsap.fromTo(spur,
      { x: () => kanteBei(spur, anfang()) },
      {
        x: () => kanteBei(spur, ziel()),
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: kopf,
          // Ist der Kopf niedriger als das Fenster, laege der Start vor dem
          // Seitenanfang; clamp() setzt ihn auf Scroll 0.
          start: 'clamp(bottom bottom)',
          end: V60.ende,
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });
  }

  /* Der V60 wippt in den Wellen, ueber die Zeit. Auf der Gruppe .v60-wippe
     im SVG, in Einheiten, getrennt vom x der Fahrt auf der Spur. fromTo mit
     yoyo schliesst die Schleife ohne Ruecksprung, und der Versatz zwischen
     Heben und Kippen kommt ueber progress(0.5), nicht ueber delay: Mit delay
     stuende das Kippen die erste halbe Runde still, und das liest sich wie
     ein Ruck. Gedreht wird um die mittlere Wasserlinie, x 114 und y 224. */
  function v60Wippen(spur) {
    const wippe = spur.querySelector('.v60-wippe');
    if (!wippe) return;
    gsap.set(wippe, { svgOrigin: '114 224', y: 0, rotation: 0 });
    if (ruhig) {
      gsap.set(wippe, { rotation: 2 });
      return;
    }
    gsap.fromTo(wippe, { y: 2 }, { y: -4, duration: V60.takt, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.fromTo(wippe, { rotation: -3 }, {
      rotation: 3, duration: V60.takt, repeat: -1, yoyo: true, ease: 'sine.inOut'
    }).progress(0.5);
  }

  /* Wasser in den V60. Fliesst von selbst, sobald er unter der Tuelle
     steht, und haengt nicht am Scroll. Das war der Fehler des ersten
     Strahls vom 30.09. im Labor (d0685cb): Er wuchs mit dem Scrollen im
     Bogen aus der Tuelle ins Leere, und Joscha fand ihn «zu billig».

     Arm und V60 wippen jeder fuer sich, und der V60 faehrt. Ein fest
     gezeichneter Strahl risse deshalb ab. Statt dessen rechnet ein Ticker
     in jedem Bild die Tuellenmitte, (185.25, 86.15) in der Kesselgruppe,
     ueber getScreenCTM() in die Koordinaten von .v60-wippe um und zieht
     den Strahl neu. Der Ticker laeuft nur, solange der Kopf im Bild ist.

     Ob Wasser kommt, entscheidet dieselbe Rechnung, nicht der Fortschritt
     der Fahrt. Der laeuft dem Bild wegen scrub um 0,8 s voraus.

     Die Bahn ist ein Wurf: waagrecht gleichmaessig, senkrecht schneller
     werdend. Sie haengt nur an der Tuelle, nicht am V60, denn Wasser faellt
     senkrecht, egal, wohin der Filter schwimmt. Sie endet 6 Einheiten unter
     der Oberkante, hinter dem weissen Koerper. Am Anfang faellt das Wasser
     von der Tuelle in den Filter (fuss), am Ende reisst es oben ab und
     faellt hinterher (kopf). Beides sind Anteile der Bahn, 0 an der Tuelle
     und 1 im Filter.

     Faehrt der V60 schneller weg, als der Rest hinterherfaellt, etwa bei
     einem Sprung im Scroll, laege dessen Ende frei in der Luft. Dann ist
     der Rest sofort weg. Im ersten Entwurf hing das Ende am Rand des V60,
     und der Rest zog sich schraeg hinter ihm her. */
  function v60Giessen(kopf, arm, spur) {
    const kessel = arm.querySelector('.arm-dreh > g[transform]');
    const wippe = spur.querySelector('.v60-wippe');
    const pfade = spur.querySelectorAll('.v60-strahl path');
    const licht = spur.querySelector('.v60-strahl-licht');
    if (!kessel || !wippe || !pfade.length) return;

    const punkt = kessel.ownerSVGElement.createSVGPoint();
    const oben = 174 + V60.tiefe;           // Oberkante des V60 in der Wippe
    const strahl = { fuss: 0, kopf: 0, an: false };

    function tuelle() {
      punkt.x = 185.25; punkt.y = 86.15;
      return punkt.matrixTransform(kessel.getScreenCTM())
                  .matrixTransform(wippe.getScreenCTM().inverse());
    }

    function zeichnen(t) {
      let d = '';
      if (strahl.fuss > strahl.kopf) {
        const breit = V60.drift, hoch = oben + 6 - t.y;
        const schritte = 10;
        for (let i = 0; i <= schritte; i++) {
          const s = strahl.kopf + (strahl.fuss - strahl.kopf) * i / schritte;
          const x = t.x - breit * s;
          const y = t.y + hoch * (0.35 * s + 0.65 * s * s);
          d += (i ? ' L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
        }
      }
      pfade.forEach(p => p.setAttribute('d', d));
    }

    function anfangen() {
      strahl.an = true;
      gsap.killTweensOf(strahl);
      strahl.kopf = 0;
      strahl.fuss = 0;
      gsap.to(strahl, { fuss: 1, duration: V60.fallen, ease: 'power2.in' });
    }

    function aufhoeren() {
      strahl.an = false;
      gsap.killTweensOf(strahl);
      // Beide Enden laufen in den Filter, das obere schneller: Der Abstand
      // schrumpft gleichmaessig, und ein Strahl, der eben erst begann,
      // faellt trotzdem ganz hinein statt in der Luft stehen zu bleiben.
      gsap.to(strahl, { kopf: 1, fuss: 1, duration: V60.abreissen, ease: 'power2.in' });
    }

    function bild() {
      const t = tuelle();
      const daneben = Math.abs(t.x - 114);
      if (!strahl.an && daneben < V60.strahlAn && t.y < oben) anfangen();
      else if (strahl.an && (daneben > V60.strahlAus || t.y >= oben)) aufhoeren();
      if (!strahl.an && strahl.fuss > strahl.kopf &&
          Math.abs(t.x - V60.drift - 114) > V60.oeffnung) {
        gsap.killTweensOf(strahl);
        strahl.kopf = strahl.fuss = 1;
      }
      zeichnen(t);
    }

    if (ruhig) {
      // Ohne Bewegung steht der V60 schon unter der Tuelle: Der Strahl ist
      // einfach da, ohne Fallen und ohne Fliessen. Das fertige Bild.
      const stehen = () => {
        const t = tuelle();
        strahl.fuss = Math.abs(t.x - 114) < V60.strahlAus ? 1 : 0;
        zeichnen(t);
      };
      requestAnimationFrame(stehen);
      window.addEventListener('resize', stehen);
      window.addEventListener('load', stehen);
      return;
    }

    // Die Strichelung wandert nach unten: ein Muster von 9 Einheiten in
    // 0,4 s, also gut 22 Einheiten je Sekunde.
    const fliessen = gsap.fromTo(licht, { attr: { 'stroke-dashoffset': 0 } },
      { attr: { 'stroke-dashoffset': -9 }, duration: 0.4, ease: 'none', repeat: -1, paused: true });

    ScrollTrigger.create({
      trigger: kopf,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => {
        if (self.isActive) { gsap.ticker.add(bild); fliessen.play(); }
        else { gsap.ticker.remove(bild); fliessen.pause(); }
      }
    });
  }

  function filter() {
    filterRezeptur();
    guideRaster('#guide-raster');

    const spur = document.querySelector('#kopf-filter .arm-spur');
    if (!spur) return;

    /* schaum: false, weil der Arm hinter der vordersten Welle steht. Das
       Wasser deckt ihn selbst ab, die weissen Halbkreise der Zeichnung
       braucht es dort nicht.

       armEnde: Der Unterarm endet in der Zeichnung bei y 206, die tiefste
       Kesselkante bei y 196. Das sind 10 von 220 Einheiten. Stuende der Arm
       so tief, dass die Welle sein Ende deckt, verschwaende auch der
       Kessel. Deshalb reicht der Unterarm bis y 310, gezeichnet wird auch
       unter der viewBox. Am sichtbaren Teil aendert das nichts, die
       Verlaengerung liegt immer unter Wasser: nachgemessen ueber die
       Pfadgeometrie der vordersten Welle bleibt das runde Ende bei 1440,
       1100, 820 und 375 px mindestens 52 px unter dem tiefsten Kamm. */
    spur.innerHTML = bwRettungsarm({ schaum: false, armEnde: 310 });

    /* Der V60 links davon. Griff nach links, weg vom Kessel, wie der Henkel
       der Tasse im Labor. Zuerst die Fahrt, unten dann der Auftritt. */
    const kopf = document.getElementById('kopf-filter');
    const v60 = kopf.querySelector('.tasse-spur');
    const band = kopf.querySelector('.kopf-wellen');
    if (v60 && band && window.bwV60) {
      v60.innerHTML = bwV60({ griff: 'links', tiefe: V60.tiefe, strahl: true });
      v60Fahrt(kopf, v60, spur, band);
      v60Wippen(v60);
    }

    const dreh = spur.querySelector('.arm-dreh');
    if (!dreh) return;

    // Der Drehpunkt sitzt auf der Wasserlinie der Zeichnung, in Anteilen
    // ihrer viewBox: x 72,5 von 228 und y 198 von 220.
    gsap.set(dreh, { transformOrigin: '31.8% 90%', rotation: 0, y: 0 });

    // Der Strahl braucht Arm und V60 an ihrem Platz, also zuletzt.
    const giessen = () => { if (v60 && v60.firstElementChild) v60Giessen(kopf, spur, v60); };

    if (ruhig) {
      gsap.set(dreh, { rotation: 2 });
      giessen();
      return;
    }

    // Auftritt: Der Arm taucht auf. Ein Zeichnen des Schwanenhalses ginge
    // nicht, er ist eine gefuellte Roehre mit eigener Kontur und kein
    // einzelner Pfad.
    // Der V60 schwimmt schon, der Arm taucht danach auf.
    if (v60 && v60.firstElementChild) {
      gsap.from(v60, { y: 34, autoAlpha: 0, duration: 1.2, ease: 'bw-aus', delay: 0.15 });
    }
    gsap.from(spur, { y: 40, autoAlpha: 0, duration: 1.2, ease: 'bw-aus', delay: 0.3 });

    /* Heben und Neigen, mehr nicht. Die Dauern liegen im selben Bereich wie
       die Eigenbewegung der Wellen, die basis.js wellen() mit random(3, 5)
       Sekunden setzt. Dadurch geht der Arm im Takt des Wassers, ohne dass
       etwas synchronisiert werden muss. Zwei verschiedene Dauern, sonst
       sieht die Bewegung mechanisch aus. */
    gsap.to(dreh, {
      y: -5, duration: 4.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1
    });
    gsap.to(dreh, {
      rotation: 2.5, duration: 5.3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.4
    });

    giessen();
  }

  return { espresso, filter, wissen, verloren, getraenkeRaster, getraenkeFilter, guideRaster, baristaRaster,
           maschinenSchnitt, maschinenfinder, methodenfinder, klappRaster, schritteBand,
           GETRAENKE, GUIDES, BARISTA_GUIDES };
})();
