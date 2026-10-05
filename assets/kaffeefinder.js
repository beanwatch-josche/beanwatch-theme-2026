/* ==========================================================================
   Beanwatch · Kaffeefinder
   Höchstens drei Fragen, dann ein Ergebnis: klassisch, fruchtig oder
   Filterkaffee. Die Fragen stehen hier als Daten, die drei Ergebnisse fest
   im Markup von welcher-kaffee.html.

     Direktlinks    #klassisch, #fruchtig und #filter öffnen das Ergebnis
                    sofort, so wie die Boxen 1 und 2 der Startseite es tun.
                    Darunter steht dann der Weg zurück in den Fragebogen.
     Adresse        Ein Ergebnis schreibt seinen Hash per replaceState in die
                    Adresse, ohne hashchange auszulösen. Damit lässt sich ein
                    Ergebnis teilen und neu laden.
     Fokus          Nach jedem Wechsel springt der Fokus auf die neue
                    Überschrift, damit Tastatur und Screenreader folgen.
     Reduzierte Bewegung  Wechsel ohne Überblenden.
   ========================================================================== */

(function () {
  'use strict';

  const finder = document.getElementById('finder');
  if (!finder) return;

  const frageEl = document.getElementById('finder-frage');
  const schrittEl = document.getElementById('finder-schritt');
  const titelEl = document.getElementById('finder-titel');
  const antwortenEl = document.getElementById('finder-antworten');
  const zurueckEl = document.getElementById('finder-zurueck');
  const ergebnisEl = document.getElementById('finder-ergebnis');
  const trefferEls = Array.from(ergebnisEl.querySelectorAll('[data-ergebnis]'));
  const anleitungEl = document.getElementById('finder-anleitung');
  const anleitungLink = document.getElementById('finder-anleitung-link');
  const genauerEl = document.getElementById('finder-genauer');
  const neuEl = document.getElementById('finder-neu');
  const ruhig = window.BW && window.BW.wenigerBewegung;

  /* ------------------------------------------------------------------
     Die Fragen. Eine Antwort führt entweder zur nächsten Frage (weiter)
     oder zu einem Ergebnis, auf Wunsch mit passender Anleitung.
     ------------------------------------------------------------------ */
  const FRAGEN = {
    setup: {
      titel: 'Für welches Setup brauchst Du Kaffeebohnen?',
      antworten: [
        { text: 'Siebträgermaschine', weiter: 'getraenk' },
        { text: 'Kaffeevollautomat', ergebnis: 'klassisch', anleitung: 'vollautomat' },
        { text: 'Bialetti', ergebnis: 'klassisch', anleitung: 'bialetti' },
        { text: 'Filterkaffee', ergebnis: 'filter', anleitung: 'v60' },
        { text: 'Cold Brew', ergebnis: 'fruchtig', anleitung: 'coldbrew' }
      ]
    },
    getraenk: {
      titel: 'Wie trinkst Du Deinen Kaffee am liebsten?',
      antworten: [
        { text: 'Als Café Crème', ergebnis: 'klassisch', anleitung: 'creme' },
        { text: 'Mit Milchschaum', zusatz: 'Cappuccino, Flat White, Cortado', ergebnis: 'fruchtig', anleitung: 'cappuccino' },
        { text: 'Espresso pur', weiter: 'stil' }
      ]
    },
    stil: {
      titel: 'Magst Du es experimentierfreudig oder lieber italienisch?',
      antworten: [
        { text: 'Experimentierfreudig', zusatz: 'Frucht, Säure, jedes Mal etwas Neues', ergebnis: 'fruchtig' },
        { text: 'Lieber italienisch', zusatz: 'Schokolade, Nuss, kräftig', ergebnis: 'klassisch' }
      ]
    }
  };

  // ersatz: steht da, solange der Guide zum Start ausgeblendet ist
  // (start.js). Ohne ersatz entfällt die Zeile dann ganz.
  const ANLEITUNGEN = {
    vollautomat: { text: 'Barista Guide Kaffeevollautomat', href: '/blogs/barista-guides/kaffeevollautomat.html' },
    bialetti: { text: 'Barista Guide Bialetti', href: '/blogs/barista-guides/bialetti.html' },
    v60: { text: 'Brew Guide Hario V60', href: '/blogs/brew-guides/hario-v60.html',
           ersatz: { text: 'Grundrezept Filterkaffee', href: '/filterkaffee.html#rezeptur' } },
    coldbrew: { text: 'Rezept Cold Brew', href: '/blogs/kaffeerezepte/cold-brew.html' },
    creme: { text: 'Rezept Café Crème', href: '/blogs/kaffeerezepte/cafe-creme-rezept.html' },
    cappuccino: { text: 'Rezept Cappuccino', href: '/blogs/kaffeerezepte/cappuccino-rezept.html' }
  };

  const ERGEBNISSE = ['klassisch', 'fruchtig', 'filter'];

  // Die beantworteten Fragen in ihrer Reihenfolge, für «Zurück».
  let verlauf = [];

  /* ------------------------------------------------------------------
     Wechsel zwischen Frage und Ergebnis
     ------------------------------------------------------------------ */
  function sichtbar() {
    return [frageEl, ergebnisEl].find((el) => !el.hidden);
  }

  function wechseln(einsetzen, fokussieren) {
    const alt = sichtbar();
    const danach = () => {
      einsetzen();
      const neu = sichtbar();
      if (fokussieren) fokus();
      if (ruhig || !window.gsap || !neu) return;
      gsap.fromTo(neu, { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'bw-aus', overwrite: true });
    };
    if (ruhig || !window.gsap || !alt) { danach(); return; }
    gsap.to(alt, { opacity: 0, y: -12, duration: 0.22, ease: 'power2.in', overwrite: true, onComplete: danach });
  }

  function fokus() {
    const ziel = !frageEl.hidden
      ? titelEl
      : ergebnisEl.querySelector('[data-ergebnis]:not([hidden]) h2');
    if (ziel) ziel.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------
     Frage und Ergebnis
     ------------------------------------------------------------------ */
  function frage(schluessel) {
    const f = FRAGEN[schluessel];
    ergebnisEl.hidden = true;
    frageEl.hidden = false;
    schrittEl.textContent = 'Frage ' + (verlauf.length + 1);
    zurueckEl.hidden = verlauf.length === 0;
    titelEl.textContent = f.titel;
    antwortenEl.dataset.frage = schluessel;
    antwortenEl.innerHTML = f.antworten.map((a, i) =>
      '<button type="button" data-index="' + i + '">' + a.text +
      (a.zusatz ? '<span class="zusatz">' + a.zusatz + '</span>' : '') +
      '</button>').join('');
  }

  function ergebnis(art, anleitung, direkt) {
    frageEl.hidden = true;
    ergebnisEl.hidden = false;
    trefferEls.forEach((el) => { el.hidden = el.dataset.ergebnis !== art; });

    let hilfe = anleitung && ANLEITUNGEN[anleitung];
    if (hilfe && window.BWStart && !BWStart.zeigen(hilfe.href)) hilfe = hilfe.ersatz;
    anleitungEl.hidden = !hilfe;
    if (hilfe) {
      anleitungLink.textContent = hilfe.text;
      anleitungLink.href = hilfe.href;
    }
    genauerEl.hidden = !direkt;

    if (window.history && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search + '#' + art);
    }
  }

  function neuStarten() {
    verlauf = [];
    if (window.history && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    wechseln(() => frage('setup'), true);
  }

  /* ------------------------------------------------------------------
     Bedienung
     ------------------------------------------------------------------ */
  antwortenEl.addEventListener('click', (e) => {
    const knopf = e.target.closest('button');
    if (!knopf) return;
    const schluessel = antwortenEl.dataset.frage;
    const antwort = FRAGEN[schluessel].antworten[Number(knopf.dataset.index)];
    if (!antwort) return;

    knopf.classList.add('ist-aktiv');
    verlauf.push(schluessel);

    if (antwort.weiter) {
      wechseln(() => frage(antwort.weiter), true);
    } else {
      wechseln(() => ergebnis(antwort.ergebnis, antwort.anleitung, false), true);
    }
  });

  zurueckEl.addEventListener('click', () => {
    const vorher = verlauf.pop();
    if (vorher) wechseln(() => frage(vorher), true);
  });

  neuEl.addEventListener('click', neuStarten);
  genauerEl.addEventListener('click', (e) => {
    e.preventDefault();
    neuStarten();
  });

  /* ------------------------------------------------------------------
     Start und Direktlinks
     ------------------------------------------------------------------ */
  function ausHash() {
    const art = location.hash.slice(1);
    if (ERGEBNISSE.indexOf(art) === -1) return false;
    verlauf = [];
    ergebnis(art, null, true);
    return true;
  }

  if (!ausHash()) frage('setup');

  window.addEventListener('hashchange', () => {
    const art = location.hash.slice(1);
    verlauf = [];
    if (ERGEBNISSE.indexOf(art) !== -1) {
      wechseln(() => ergebnis(art, null, true), true);
    } else {
      wechseln(() => frage('setup'), true);
    }
  });
})();
