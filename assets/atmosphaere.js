/* ==========================================================================
   Beanwatch · Atmosphäre
   Ruhige Hintergrundbewegung für die dunklen Sektionen. Jede Welt bekommt
   ihr eigenes Motiv, aber alle drei folgen demselben Prinzip: wenige
   Elemente, langsam, zufällig gestaffelt, nie aufdringlich.

     sterne   Nachtthema aus der bisherigen Website, heute im Prozessweg
     dampf    Espresso, aufsteigende Schwaden über der Tasse
     tropfen  Filterkaffee, was aus dem Filter in die Karaffe fällt

   Alle drei driften beim Scrollen leicht mit, damit die Fläche Tiefe bekommt.
   ========================================================================== */

window.BWAtmo = (function () {
  'use strict';

  const ruhig = window.BW && window.BW.wenigerBewegung;

  function zufall(min, max) { return min + Math.random() * (max - min); }

  /** Feld beim Scrollen leicht mitziehen. */
  function drift(feld, sektion, weite) {
    if (!sektion) return;
    gsap.to(feld, {
      yPercent: weite,
      ease: 'none',
      scrollTrigger: { trigger: sektion, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  }

  /* ------------------------------------------------------------------
     Sterne
     Es kann mehrere Felder je Seite geben: auf der Startseite der
     Prozessweg, im Archiv die Decaf-Sektion und die Rückseite der
     Decaf-Box. Deshalb alle bedienen, nicht nur das erste.

     Zwei Masse steuern, wie ruhig ein Feld wirkt: data-anzahl und
     data-gross, der grösste Punkt. Der kleinste ist 40 Prozent davon. Auf
     der kleinen Box müssen beide deutlich kleiner sein als in der Sektion,
     sonst stehen dort gleich grosse Punkte dreizehnmal so dicht und lesen
     sich als Flecken statt als Staub.

     data-dichte ersetzt die feste Anzahl durch Sterne je 100 px Höhe. Die
     Felder reichen immer über die ganze Fensterbreite, deshalb zählt die
     Höhe und nicht die Fläche: Die Decaf-Sektion trägt 46 Sterne bei jeder
     Breite, auf 1440 px verteilt auf rund 807 px Höhe, also 5.7. Mit
     diesem Wert wirkt ein Feld auf dem Desktop wie auf dem Handy so dicht
     wie dort, auch wenn es dreimal so hoch ist.
     ------------------------------------------------------------------ */
  function sterne(auswahl) {
    document.querySelectorAll(auswahl).forEach((feld) => {
      const dichte = parseFloat(feld.dataset.dichte);
      const anzahl = dichte
        ? Math.round(Math.min(220, Math.max(24, feld.offsetHeight / 100 * dichte)))
        : parseInt(feld.dataset.anzahl, 10) || 46;
      const gross = parseFloat(feld.dataset.gross) || 5;

      const stueck = document.createDocumentFragment();
      for (let i = 0; i < anzahl; i++) {
        const s = document.createElement('span');
        s.className = 'atmo-stern';
        s.style.left = zufall(2, 98) + '%';
        s.style.top = zufall(4, 96) + '%';
        const g = zufall(gross * 0.4, gross);
        s.style.width = g + 'px';
        s.style.height = g + 'px';
        stueck.appendChild(s);
      }
      feld.appendChild(stueck);
      if (ruhig) return;

      gsap.to(feld.children, {
        opacity: gsap.utils.random(0.15, 0.85, 0.01, true),
        scale: gsap.utils.random(0.6, 1.5, 0.01, true),
        duration: gsap.utils.random(1.6, 3.8, 0.1, true),
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        stagger: { each: 0.05, from: 'random' }
      });
      // Die Box hängt in einer nav, dort findet closest() nichts und der
      // Drift entfällt. Genau richtig: Sie soll ruhig bleiben.
      drift(feld, feld.closest('section'), -14);
    });
  }

  /* ------------------------------------------------------------------
     Dampf, für Espresso
     Schwaden steigen auf, werden breiter und lösen sich oben auf.
     ------------------------------------------------------------------ */
  function dampf(auswahl) {
    const feld = document.querySelector(auswahl);
    if (!feld) return;

    const anzahl = 14;
    const stueck = document.createDocumentFragment();
    for (let i = 0; i < anzahl; i++) {
      const s = document.createElement('span');
      s.className = 'atmo-dampf';
      s.style.left = zufall(3, 97) + '%';
      const b = zufall(40, 110);
      s.style.width = b + 'px';
      s.style.height = b * zufall(1.4, 2.2) + 'px';
      stueck.appendChild(s);
    }
    feld.appendChild(stueck);
    if (ruhig) return;

    gsap.utils.toArray('.atmo-dampf', feld).forEach((s) => {
      const dauer = zufall(9, 16);
      gsap.set(s, { yPercent: 20, opacity: 0, scale: 0.7 });
      gsap.timeline({ repeat: -1, delay: zufall(0, dauer) })
        .to(s, { opacity: zufall(0.05, 0.14), duration: dauer * 0.3, ease: 'sine.out' }, 0)
        .to(s, { yPercent: -130, scale: 1.5, duration: dauer, ease: 'none' }, 0)
        .to(s, { opacity: 0, duration: dauer * 0.45, ease: 'sine.in' }, dauer * 0.55);
    });
    drift(feld, feld.closest('section'), -10);
  }

  /* ------------------------------------------------------------------
     Tropfen, für Filterkaffee
     Fallen, werden beim Fallen länger und verschwinden unten.
     ------------------------------------------------------------------ */
  function tropfen(auswahl) {
    const feld = document.querySelector(auswahl);
    if (!feld) return;

    const anzahl = 20;
    const stueck = document.createDocumentFragment();
    for (let i = 0; i < anzahl; i++) {
      const s = document.createElement('span');
      s.className = 'atmo-tropfen';
      s.style.left = zufall(3, 97) + '%';
      s.style.height = zufall(14, 34) + 'px';
      stueck.appendChild(s);
    }
    feld.appendChild(stueck);
    if (ruhig) return;

    gsap.utils.toArray('.atmo-tropfen', feld).forEach((s) => {
      const dauer = zufall(2.6, 5.2);
      gsap.set(s, { yPercent: -60, opacity: 0, scaleY: 0.5 });
      gsap.timeline({ repeat: -1, delay: zufall(0, dauer) })
        .to(s, { opacity: zufall(0.18, 0.4), scaleY: 1, duration: dauer * 0.25, ease: 'sine.out' }, 0)
        .to(s, { yPercent: 620, duration: dauer, ease: 'power1.in' }, 0)
        .to(s, { opacity: 0, duration: dauer * 0.3, ease: 'sine.in' }, dauer * 0.7);
    });
    drift(feld, feld.closest('section'), -8);
  }

  /* Automatisch starten, was auf der Seite vorhanden ist. */
  function start() {
    sterne('[data-atmo="sterne"]');
    dampf('[data-atmo="dampf"]');
    tropfen('[data-atmo="tropfen"]');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  return { sterne, dampf, tropfen };
})();
