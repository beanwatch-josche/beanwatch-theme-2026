/* ==========================================================================
   Beanwatch · Animationsbasis
   Läuft auf jeder Seite und deckt alles ab, was überall gleich ist:
   Header, Fortschritt, Überschriften, Reveals, Sonne, Wellen, Laufband,
   Bilder-Parallax und magnetische Buttons.

   Seitenspezifisches steht in animationen.js (Startseite) und hubs.js.
   Stellt window.BW bereit, damit die anderen Skripte dieselben Easings und
   die Bewegungsreduktion mitbenutzen.
   ========================================================================== */

window.BW = (function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);

  CustomEase.create('bw-aus', '0.16, 1, 0.3, 1');
  CustomEase.create('bw-weich', '0.65, 0, 0.35, 1');
  gsap.defaults({ ease: 'bw-aus', duration: 1 });

  const wenigerBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Header und Fortschrittsbalken
     ------------------------------------------------------------------ */
  function kopfleiste() {
    const kopf = document.getElementById('kopf');
    if (!kopf) return;

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onToggle: (self) => kopf.classList.toggle('ist-geklebt', self.isActive)
    });

    // Beim Direkteinstieg mit Anker sitzt der Scroll schon unten.
    if (window.scrollY > 80) kopf.classList.add('ist-geklebt');

    const balken = document.getElementById('fortschritt');
    if (balken) {
      gsap.to(balken, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.35 } });
    }
  }

  /* ------------------------------------------------------------------
     Sanftes Springen zu Ankerzielen
     Gilt für die ganze Seite, nicht nur für Inhaltsverzeichnisse: Auch die
     Sprünge von den Hubs zu #bohnen oder #rezeptur laufen hierüber.

     Warum nicht scroll-behavior:smooth im Stylesheet? Auf der Startseite
     hängt ein gepinnter ScrollTrigger an der Reise-Sektion. ScrollTrigger
     setzt die Scrollposition beim Pinnen und beim Refresh selbst und
     erwartet, dass das sofort passiert. Mit smooth im CSS würde auch das
     animiert. window.scrollTo animiert nur diesen einen Sprung.
     ------------------------------------------------------------------ */
  function ankersprung() {
    const abstand = () => {
      const wert = getComputedStyle(document.documentElement)
        .getPropertyValue('--ankerabstand');
      return parseInt(wert, 10) || 110;
    };

    // Bilder mit loading="lazy" bekommen erst Höhe, während man an ihnen
    // vorbeiscrollt, und schieben alles darunter nach. Das Ziel landet dann
    // ein paar Dutzend Pixel neben der berechneten Stelle. Nach dem Scrollen
    // deshalb einmal nachmessen — ausser der Leser hat selbst weitergescrollt.
    function nachmessen(ziel, sanft) {
      let abbruch = false;
      const stop = () => { abbruch = true; };
      const eigene = ['wheel', 'touchstart', 'keydown'];
      eigene.forEach(t => window.addEventListener(t, stop, { once: true, passive: true }));

      const pruefen = () => {
        eigene.forEach(t => window.removeEventListener(t, stop));
        if (abbruch) return;

        const weg = Math.round(ziel.getBoundingClientRect().top - abstand());
        // Am Seitenende lässt sich nicht weiter scrollen, da bleibt ein Rest.
        if (Math.abs(weg) < 5) return;
        window.scrollTo({ top: window.scrollY + weg, behavior: sanft ? 'smooth' : 'auto' });
      };

      if ('onscrollend' in window) {
        window.addEventListener('scrollend', pruefen, { once: true });
      } else {
        setTimeout(pruefen, 800);
      }
    }

    function hin(id, sanft) {
      const ziel = document.getElementById(id);
      if (!ziel) return false;

      const oben = ziel.getBoundingClientRect().top + window.scrollY - abstand();
      window.scrollTo({ top: oben, behavior: sanft ? 'smooth' : 'auto' });
      nachmessen(ziel, sanft);

      // Ohne Fokus liefe die Tab-Taste danach wieder oben in der Navigation
      // weiter statt im Abschnitt, zu dem man gerade gesprungen ist.
      ziel.setAttribute('tabindex', '-1');
      ziel.focus({ preventScroll: true });
      return true;
    }

    document.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target.closest('a[href*="#"]');
      if (!a || a.target === '_blank') return;

      // Nur Ziele auf dieser Seite. /espresso.html#bohnen von anderswo bleibt
      // eine gewöhnliche Navigation.
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.search !== location.search) return;

      const id = decodeURIComponent(url.hash.slice(1));
      if (!id) return;

      // #warenkorb, #abo und die Links im Footer sind noch Platzhalter ohne
      // Ziel. Die bleiben unangetastet, sonst wäre der Klick tot.
      if (!hin(id, !wenigerBewegung)) return;

      e.preventDefault();
      history.pushState(null, '', url.hash);
    });

    // Damit die Zurück-Taste nicht nur die Adresse ändert.
    window.addEventListener('popstate', () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id) hin(id, !wenigerBewegung);
    });
  }

  /* ------------------------------------------------------------------
     Überschriften
     ------------------------------------------------------------------ */
  function ueberschriften() {
    gsap.utils.toArray('[data-split="zeilen"]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.05,
            stagger: 0.09,
            ease: 'bw-aus',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
        }
      });
    });

    gsap.utils.toArray('[data-split="woerter"]').forEach((el) => {
      SplitText.create(el, {
        type: 'words,lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.words, {
            opacity: 0.14,
            duration: 0.6,
            stagger: 0.035,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 62%', scrub: 0.5 }
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Reveals
     ------------------------------------------------------------------ */
  function reveals() {
    gsap.utils.toArray('[data-batch]').forEach((gruppe) => {
      const kinder = gsap.utils.toArray(':scope > *', gruppe);
      gsap.set(kinder, { opacity: 0, y: 46 });

      ScrollTrigger.batch(kinder, {
        start: 'top 88%',
        once: true,
        onEnter: (elemente) => gsap.to(elemente, {
          opacity: 1, y: 0, duration: 1.05, stagger: 0.1, ease: 'bw-aus', overwrite: true
        })
      });
    });

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      // Im Seitenkopf ist die Startbedingung beim Laden schon erfüllt. Dort
      // läuft das Bild deshalb mit der Überschrift zusammen statt als
      // eigener Scroll-Effekt — sonst starten beide unkoordiniert.
      const imKopf = el.closest('.beitragskopf, .seitenkopf');

      if (imKopf) {
        gsap.from(el, { opacity: 0, y: 30, duration: 1.1, delay: 0.25 });
        return;
      }

      gsap.from(el, {
        opacity: 0, y: 44, duration: 1.05,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ------------------------------------------------------------------
     Zahlen hochzählen
     ------------------------------------------------------------------ */
  function zaehler() {
    gsap.utils.toArray('[data-zaehler]').forEach((el) => {
      const ziel = parseFloat(el.dataset.zaehler);
      const dezimal = parseInt(el.dataset.dezimal || '0', 10);
      const suffix = el.dataset.suffix || '';
      const stand = { wert: 0 };

      gsap.to(stand, {
        wert: ziel,
        duration: 1.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate() {
          const zahl = stand.wert.toFixed(dezimal).replace('.', ',');
          el.innerHTML = zahl + (suffix ? `<span class="einheit">${suffix}</span>` : '');
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Sonne und Wellen, die Signatur aus dem Hero
     ------------------------------------------------------------------ */
  function sonne(auswahl) {
    const el = typeof auswahl === 'string' ? document.querySelector(auswahl) : auswahl;
    if (!el) return;
    const strahlen = el.querySelector('[data-strahlen]') || el.querySelector('g');
    const kern = el.querySelector('[data-kern]') || el.querySelector('circle');

    if (strahlen) {
      gsap.to(strahlen, { rotate: 360, duration: 90, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    }
    if (kern) {
      gsap.to(kern, {
        scale: 1.09, opacity: 0.28, duration: 3.4,
        repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 50%'
      });
    }
  }

  /**
   * Endlos laufende Wellen. Jedes SVG ist doppelt so breit wie sein
   * Container und wandert um genau die halbe Breite, dadurch ist die
   * Schleife nahtlos.
   */
  function wellen(auswahl, tempi) {
    const behaelter = typeof auswahl === 'string' ? document.querySelector(auswahl) : auswahl;
    if (!behaelter) return;
    /* :scope > svg, nicht einfach svg. Seit im Filterkaffee-Kopf eine Figur
       zwischen den Wellen steht, liegt deren Zeichnung im selben Behaelter.
       Ohne :scope fand die Suche sie mit, der Arm bekam den dritten Tempowert
       als linearen Schub um eine halbe Bildbreite und sprang alle 12 Sekunden
       zurueck. Die vorderste Welle rutschte dabei auf den Rueckfallwert 20 und
       lief zu langsam. Belebt werden nur die direkten Kinder des Bands. */
    const bahnen = behaelter.querySelectorAll(':scope > svg');
    const dauern = tempi || [26, 18, 12];

    bahnen.forEach((bahn, i) => {
      gsap.fromTo(bahn, { xPercent: 0 }, {
        xPercent: -50, duration: dauern[i] || 20, repeat: -1, ease: 'none'
      });
      gsap.to(bahn, {
        y: gsap.utils.random(-9, -4),
        duration: gsap.utils.random(3, 5),
        repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
    });
  }

  /* ------------------------------------------------------------------
     Laufband, angetrieben von der Scroll-Geschwindigkeit
     ------------------------------------------------------------------ */
  function laufband(auswahl) {
    const spur = typeof auswahl === 'string' ? document.querySelector(auswahl) : auswahl;
    if (!spur) return;

    const band = gsap.to(spur, { xPercent: -50, duration: 26, repeat: -1, ease: 'none' });

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const v = self.getVelocity();
        const richtung = v < 0 ? -1 : 1;
        const schub = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 480);
        gsap.to(band, { timeScale: richtung * schub, duration: 0.3, overwrite: true });
        gsap.to(band, { timeScale: richtung, duration: 1.1, delay: 0.32, overwrite: false });
      }
    });
  }

  /* ------------------------------------------------------------------
     Pfeile fuer eine waagrechte Spur
     Zwei Baender teilen sich das: die Kaffee-Reihe auf der Startseite und
     das Schritteband auf dem Espresso-Hub. Gescrollt wird nativ, die
     Pfeile springen nur um ganze Karten weiter und schalten sich an den
     Enden ab. Die Spur selbst bleibt bedienbar, auch wenn es gar keine
     Pfeile gibt: Sie ist im Markup fokussierbar und erbt damit die
     Pfeiltasten des Browsers.
     ------------------------------------------------------------------ */
  function spurPfeile(spur, pfeilLeiste, optionen) {
    if (!spur) return null;
    const o = optionen || {};
    const pfeile = pfeilLeiste ? Array.from(pfeilLeiste.querySelectorAll('.reihe-knopf')) : [];
    // erste(): welche Karte die Schrittweite vorgibt. Die Kaffee-Reihe
    // filtert, dort ist das die erste noch sichtbare. Sonst das erste Kind.
    const erste = o.erste || (() => spur.firstElementChild);

    // Breite einer Karte samt Abstand. Die Karten rasten links an der
    // Innenkante der Reihe ein, deshalb sitzt Karte i bei i mal dieser Breite.
    function kartenschritt() {
      const karte = erste();
      if (!karte) return spur.clientWidth;
      const abstand = parseFloat(getComputedStyle(spur).columnGap) || 0;
      return karte.offsetWidth + abstand;
    }

    function nachfuehren() {
      if (!pfeilLeiste) return;
      const ende = spur.scrollWidth - spur.clientWidth;
      pfeilLeiste.hidden = ende <= 2;
      pfeile.forEach((pfeil) => {
        const zurueck = Number(pfeil.dataset.richtung) < 0;
        pfeil.disabled = zurueck ? spur.scrollLeft <= 2 : spur.scrollLeft >= ende - 2;
      });
    }

    pfeile.forEach((pfeil) => {
      pfeil.addEventListener('click', () => {
        const schritt = kartenschritt();
        const innen = spur.clientWidth - parseFloat(getComputedStyle(spur).paddingLeft);
        const ganze = Math.max(1, Math.floor(innen / schritt));
        const jetzt = Math.round(spur.scrollLeft / schritt);
        const ziel = (jetzt + Number(pfeil.dataset.richtung) * ganze) * schritt;
        spur.scrollTo({ left: Math.max(0, ziel), behavior: wenigerBewegung ? 'auto' : 'smooth' });
      });
    });

    /* Ziehen mit gedrueckter Maustaste.
       Trackpad und Touch wischen laengst von selbst, eine Maus mit nur
       vertikalem Rad kommt aber nur ueber die Pfeile weiter. Diese Geste
       schliesst die Luecke. Drei Dinge machen sie vertraeglich:
       die Schwelle, damit ein Klick ein Klick bleibt; das Verschlucken des
       folgenden Klicks, damit das Loslassen ueber einer Karte nicht ihren
       Link oeffnet; und das Aussetzen der Rastung, die sonst bei jeder
       Zwischenposition einhakt und das Ziehen ruckeln laesst. */
    const SCHWELLE = 6;
    let zieht = false, gezogen = false, startX = 0, startScroll = 0, rastungAn = 0;

    function klickSchlucken(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    spur.addEventListener('pointerdown', (e) => {
      // Nur die linke Maustaste. Touch und Stift wischen nativ, ein eigener
      // Handler wuerde ihnen die Traegheit nehmen.
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      zieht = true;
      gezogen = false;
      startX = e.clientX;
      startScroll = spur.scrollLeft;
    });

    spur.addEventListener('pointermove', (e) => {
      if (!zieht) return;
      const weg = e.clientX - startX;
      if (!gezogen) {
        if (Math.abs(weg) < SCHWELLE) return;
        gezogen = true;
        spur.setPointerCapture(e.pointerId);
        clearTimeout(rastungAn);
        spur.style.scrollSnapType = 'none';
        spur.style.userSelect = 'none';
        spur.style.cursor = 'grabbing';
      }
      spur.scrollLeft = startScroll - weg;
    });

    function loslassen(e) {
      if (!zieht) return;
      zieht = false;
      if (!gezogen) return;
      gezogen = false;
      if (e.pointerId !== undefined && spur.hasPointerCapture(e.pointerId)) {
        spur.releasePointerCapture(e.pointerId);
      }
      // Die Rastung kommt sofort zurueck. Wo sie im CSS steht, sucht sich der
      // Browser danach selbst die naechste Kante; wo nicht, bleibt das Band
      // stehen, wo man losgelassen hat.
      // Ein eigenes Ausrichten stand hier zwischenzeitlich und ist wieder
      // raus: Zusammen mit dem Aus- und Einschalten der Rastung brauchte es
      // gemessene 1000 ms, bis das Band zur Ruhe kam.
      spur.style.scrollSnapType = '';
      spur.style.userSelect = '';
      spur.style.cursor = '';
      // Der Klick kommt erst nach pointerup. Einmal abfangen, dann abmelden.
      spur.addEventListener('click', klickSchlucken, { capture: true, once: true });
      // Falls gar kein Klick folgt, weil der Zeiger ausserhalb losgelassen
      // wurde, raeumt dieser Nachlauf den Horcher wieder weg.
      setTimeout(() => spur.removeEventListener('click', klickSchlucken, true), 0);
    }

    spur.addEventListener('pointerup', loslassen);
    spur.addEventListener('pointercancel', loslassen);

    spur.addEventListener('scroll', nachfuehren, { passive: true });
    window.addEventListener('resize', nachfuehren);
    nachfuehren();
    return { nachfuehren };
  }

  /* ------------------------------------------------------------------
     Feinschliff
     ------------------------------------------------------------------ */
  function feinschliff() {
    gsap.utils.toArray('.produkt-bild img, .rezept-bild img, .wissen-bild img, .beitrag-bild img, .brewguide-bild--foto img')
      .forEach((bild) => {
        gsap.fromTo(bild, { scale: 1.16 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: bild, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });

    gsap.utils.toArray('.produkt, .rezept, .wissen-karte, .beitrag, .einstieg, .brewguide, .tool-karte')
      .forEach((karte) => {
        const hoch = gsap.quickTo(karte, 'y', { duration: 0.45, ease: 'bw-aus' });
        karte.addEventListener('mouseenter', () => hoch(-8));
        karte.addEventListener('mouseleave', () => hoch(0));
      });

    gsap.utils.toArray('.btn, .reverse-schalter, .produkt-kaufen, .filter-knopf')
      .forEach((btn) => {
        const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'bw-aus' });
        const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'bw-aus' });
        btn.addEventListener('mousemove', (e) => {
          const feld = btn.getBoundingClientRect();
          x((e.clientX - feld.left - feld.width / 2) * 0.32);
          y((e.clientY - feld.top - feld.height / 2) * 0.42);
        });
        btn.addEventListener('mouseleave', () => { x(0); y(0); });
      });

    gsap.utils.toArray('.fuss-oben').forEach((fuss) => {
      gsap.from(fuss.children, {
        opacity: 0, y: 34, duration: 0.9, stagger: 0.09,
        scrollTrigger: { trigger: fuss, start: 'top 92%', once: true }
      });
    });
  }

  /* ------------------------------------------------------------------
     Seitenkopf einer Unterseite
     ------------------------------------------------------------------ */
  function seitenkopf() {
    const kopf = document.querySelector('.seitenkopf');
    if (!kopf) return;

    const tl = gsap.timeline({ delay: 0.1 });
    const krumen = kopf.querySelector('.brotkrumen');
    const eyebrow = kopf.querySelector('.eyebrow');
    const lead = kopf.querySelector('.lead');
    const aktionen = kopf.querySelector('.kopf-aktionen-reihe');

    if (krumen) tl.from(krumen, { opacity: 0, y: 14, duration: 0.7 }, 0);
    if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.7 }, 0.08);
    if (lead) tl.from(lead, { opacity: 0, y: 22, duration: 0.9 }, 0.5);
    if (aktionen) tl.from(aktionen.children, { opacity: 0, y: 20, duration: 0.8, stagger: 0.08 }, 0.62);

    // Der Kopf schiebt sich beim Weiterscrollen weg.
    gsap.to(kopf.querySelector('.wrap'), {
      yPercent: -14, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: kopf, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    return tl;
  }

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  function start() {
    ankersprung();

    if (wenigerBewegung) {
      gsap.set('[data-reveal], [data-batch] > *', { opacity: 1, y: 0 });
      // Zahlen trotzdem korrekt anzeigen, nur ohne Zählanimation.
      document.querySelectorAll('[data-zaehler]').forEach((el) => {
        const dez = parseInt(el.dataset.dezimal || '0', 10);
        const zahl = parseFloat(el.dataset.zaehler).toFixed(dez).replace('.', ',');
        el.innerHTML = zahl + (el.dataset.suffix ? `<span class="einheit">${el.dataset.suffix}</span>` : '');
      });
      kopfleiste();
      return;
    }

    kopfleiste();
    ueberschriften();
    reveals();
    zaehler();
    feinschliff();
    seitenkopf();
    sonne('[data-sonne]');
    wellen('[data-wellen]', [26, 18, 12]);
    laufband('[data-laufband]');

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  // Erst laufen lassen, wenn die Shell im DOM steht.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  return { wenigerBewegung, sonne, wellen, laufband, seitenkopf, spurPfeile };
})();
