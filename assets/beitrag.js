/* ==========================================================================
   Beanwatch · Artikel- und Rezeptseiten
   Zwei Helfer, die auf beiden Seitentypen gebraucht werden:
   ein mitlaufendes Inhaltsverzeichnis und verwandte Beiträge.
   ========================================================================== */

window.BWBeitrag = (function () {
  'use strict';

  const ruhig = window.BW && window.BW.wenigerBewegung;

  /* ------------------------------------------------------------------
     Das Verzeichnis auf schmalen Fenstern
     Ohne Seitenspalte stand es bisher unter dem ganzen Artikel — dort
     sucht es niemand mehr. Es wandert deshalb nach oben, direkt hinter
     die Kurzübersicht, und steht dort eingeklappt: für die Suche voll
     lesbar, ohne den Anfang des Artikels zuzustellen.
     ------------------------------------------------------------------ */
  function verzeichnisUmhaengen() {
    const nav = document.getElementById('inhalt');
    if (!nav) return;

    const seite = nav.closest('.beitragsseite');
    const text = document.querySelector('.beitragstext');
    if (!seite || !text) return;

    // Merkt sich den Platz in der Seitenspalte für den Weg zurück.
    const platz = document.createComment('inhalt');
    seite.insertBefore(platz, nav);

    const huelle = document.createElement('details');
    huelle.className = 'inhalt-klapp';
    const knopf = document.createElement('summary');
    knopf.textContent = 'Inhaltsverzeichnis';
    huelle.appendChild(knopf);

    const schmal = window.matchMedia('(max-width:1080px)');

    function stellen() {
      if (schmal.matches) {
        if (huelle.contains(nav)) return;
        huelle.appendChild(nav);
        const kurz = text.querySelector('.kurzuebersicht');
        if (kurz) kurz.after(huelle); else text.prepend(huelle);
      } else {
        if (!huelle.contains(nav)) return;
        platz.after(nav);
        huelle.remove();
      }
    }

    stellen();
    // Beim Drehen des Geräts und bei jeder Grössenänderung. Beides, weil
    // change nicht überall zuverlässig kommt und stellen() nichts tut,
    // solange das Verzeichnis schon richtig steht.
    schmal.addEventListener('change', stellen);
    window.addEventListener('resize', stellen);
  }

  /* ------------------------------------------------------------------
     Inhaltsverzeichnis
     Markiert beim Scrollen den Abschnitt, in dem man gerade steht.
     ------------------------------------------------------------------ */
  function inhaltsverzeichnis(zielAuswahl, ueberschriften) {
    const nav = document.querySelector(zielAuswahl);
    if (!nav) return;

    verzeichnisUmhaengen();

    const titel = gsap.utils.toArray(ueberschriften).filter(h => h.id);
    if (!titel.length) return;

    const links = titel.map(h => nav.querySelector(`a[href="#${h.id}"]`)).filter(Boolean);

    // Das sanfte Springen macht ankersprung() in basis.js, seitenweit und
    // mitsamt Adresszeile und Tastaturfokus.

    if (ruhig) return;

    titel.forEach((h) => {
      const link = nav.querySelector(`a[href="#${h.id}"]`);
      if (!link) return;

      ScrollTrigger.create({
        trigger: h,
        start: 'top 130',
        end: () => {
          const naechster = titel[titel.indexOf(h) + 1];
          return naechster ? naechster.getBoundingClientRect().top + window.scrollY - 130 : 'max';
        },
        onToggle: (self) => {
          if (!self.isActive) return;
          links.forEach(l => l.classList.remove('ist-aktiv'));
          link.classList.add('ist-aktiv');
        }
      });
    });

    // Absätze treten beim Lesen ruhig herein. Bilder, Tabellen und die
    // Kurzübersicht gehören dazu, sonst stehen sie ohne Übergang da.
    const bausteine = [
      'h2', 'h3', 'h4', 'p', 'ul', 'ol',
      '.merksatz', '.kurzuebersicht', '.artikelbild', '.tabellenrahmen', '.autorbox'
    ].map((teil) => `.beitragstext > ${teil}`).join(', ');

    gsap.utils.toArray(bausteine)
      .forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 22, duration: 0.8,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
  }

  /* ------------------------------------------------------------------
     Verwandte Beiträge aus dem Wissensbestand
     ------------------------------------------------------------------ */
  /**
   * @param {string} zielAuswahl Container für die Karten
   * @param {Array}  themen      Themen, zu denen passende Beiträge gesucht werden
   * @param {number} anzahl      Wie viele Karten
   * @param {string} ausser      Titel des aktuellen Beitrags, wird ausgelassen.
   *                             Über den Titel und nicht über das Ziel, weil
   *                             Wissensartikel und Brew Guides noch auf eine
   *                             gemeinsame Mustervorlage zeigen.
   * @param {string} [art]       Optional auf eine Art einschränken, etwa
   *                             'rezept'. Ohne Angabe zählen alle Arten. Die
   *                             Rezeptseiten brauchen das, weil sie unter
   *                             "Noch mehr Rezepte" sonst Wissensartikel zeigen.
   */
  function verwandte(zielAuswahl, themen, anzahl, ausser, art) {
    const raster = document.querySelector(zielAuswahl);
    if (!raster || !window.BWWissen) return;

    const naehe = b => (b.themen || []).filter(t => themen.includes(t)).length;

    const treffer = BWWissen.BEITRAEGE
      .filter(b => b.stand === 'live')
      // Zum Start Ausgeblendetes (start.js) nicht vorschlagen. In der
      // Entwurfsansicht erscheint es wie vor dem Start-Modus.
      .filter(b => !window.BWStart || BWStart.zeigen(b.ziel))
      .filter(b => !art || b.art === art)
      .filter(b => naehe(b) > 0)
      .filter(b => !ausser || b.titel !== ausser)
      // Je mehr Themen sich decken, desto weiter vorn. Sonst schlüge der
      // Cold Brew immer Espresso-Rezepte vor, statt den Cold Brew Tonic.
      // Bei Gleichstand bleibt die Reihenfolge des Bestands, also neuste zuerst.
      .sort((a, b) => naehe(b) - naehe(a))
      .slice(0, anzahl || 3);

    raster.innerHTML = treffer.map(BWWissen.karte).join('');

    if (ruhig) return;
    gsap.from(raster.children, {
      opacity: 0, y: 34, duration: 0.9, stagger: 0.09,
      scrollTrigger: { trigger: raster, start: 'top 88%', once: true }
    });
  }

  /* ------------------------------------------------------------------
     Verweis auf die Anleitung
     Der Artikel erklärt Herkunft und Unterschiede, die Zubereitung steht
     auf einer eigenen Seite. Der Kasten dazwischen zeigt das Getränk im
     Schnitt und füllt sich beim Hereinscrollen von unten.

     Die Schichten kommen aus BWHub.GETRAENKE, damit Hub und Artikel
     dasselbe Glas zeichnen und niemand zwei Datensätze pflegen muss.
     ------------------------------------------------------------------ */
  function verweiskasten(auswahl) {
    const kaesten = gsap.utils.toArray(auswahl || '.verweiskasten[data-getraenk]');
    if (!kaesten.length || !window.BWHub || !window.bwGlas) return;

    kaesten.forEach((kasten, i) => {
      const name = kasten.dataset.getraenk;
      const g = BWHub.GETRAENKE.find(x => x.name === name);
      const buehne = kasten.querySelector('.verweis-glas');
      if (!g || !buehne) return;

      buehne.innerHTML = bwGlas({
        gefaess: g.gefaess,
        schichten: g.schichten,
        eis: g.eis,
        id: 'vk' + i,
        alt: g.name + ' im Schnitt'
      });

      if (ruhig) return;

      const schichten = buehne.querySelectorAll('.schicht');
      const eis = buehne.querySelectorAll('.eis rect');
      gsap.set(schichten, { scaleY: 0 });
      gsap.set(eis, { scale: 0, transformOrigin: '50% 50%' });

      gsap.timeline({ scrollTrigger: { trigger: kasten, start: 'top 84%', once: true } })
        // immediateRender:false, damit der Text sichtbar bleibt, falls der
        // Trigger nie feuert. Sonst stünde der Kasten leer da.
        .from(kasten.querySelectorAll('.verweis-text > *'), {
          opacity: 0, y: 18, duration: 0.6, stagger: 0.08, immediateRender: false
        })
        .to(schichten, { scaleY: 1, duration: 0.72, stagger: 0.14, ease: 'power2.out' }, 0.1)
        .to(eis, { scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(2.4)' }, '-=0.35');

      // Beim Hover füllt es sich nach, wie auf dem Hub.
      kasten.addEventListener('mouseenter', () => {
        gsap.fromTo(schichten,
          { scaleY: 0.9 },
          { scaleY: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(2)', overwrite: true });
      });
    });
  }

  return { inhaltsverzeichnis, verwandte, verweiskasten };
})();
