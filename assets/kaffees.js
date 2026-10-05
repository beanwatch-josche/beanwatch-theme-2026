/* ==========================================================================
   Beanwatch · Unsere Kaffees
   Die neun Kaffees der Startseite stehen in einer wischbaren Reihe, darüber
   ein Filter: Alle, Espresso, Filterkaffee, Decaf. Die Karten stehen fest im
   Markup und tragen data-art; der Filter blendet sie nur über das
   hidden-Attribut aus. Dadurch bleiben Hover und Bild-Parallax aus basis.js
   erhalten, die beim Laden an die Elemente gehängt werden.

     Auftritt       Übernimmt dieses Skript selbst, nicht data-batch aus
                    basis.js. Ausgeblendete Karten haben keine Lage, ihr
                    Auftritt käme sonst zur falschen Zeit und liesse Lücken.
     Filtern        Sichtbare Karten kurz aus, umschalten, Reihe an den
                    Anfang, neue Karten gestaffelt herein. Kein Flip: In
                    einer scrollenden Reihe gibt es nichts, wohin eine Karte
                    gleiten müsste. Schnelles Mehrfachklicken endet immer im
                    Zustand des letzten Klicks.
     Pfeile         Schieben um so viele Karten weiter, wie ganz im Bild
                    stehen. Passt alles hinein, verschwinden sie.
     Ohne Skript    Filterleiste und Pfeile bleiben verborgen, die Reihe
                    lässt sich trotzdem wischen.
     Reduzierte Bewegung  Nur umschalten und springen.
   ========================================================================== */

(function () {
  'use strict';

  const sektion = document.getElementById('kaffees');
  if (!sektion) return;

  const leiste = sektion.querySelector('.filterleiste');
  const spur = sektion.querySelector('.kaffee-spur');
  const pfeilLeiste = sektion.querySelector('.reihe-knoepfe');
  if (!leiste || !spur) return;

  const karten = Array.from(spur.querySelectorAll('.produkt[data-art]'));
  const filterKnoepfe = Array.from(leiste.querySelectorAll('.filter-knopf'));
  const ruhig = window.BW && window.BW.wenigerBewegung;
  const animiert = !ruhig && !!window.gsap;

  leiste.hidden = false;

  let aktiv = 'alle';
  let ausblenden = null;

  const sichtbar = () => karten.filter((karte) => !karte.hidden);

  /* ------------------------------------------------------------------
     Pfeile
     Die Mechanik steht in basis.js, das Schritteband auf dem Espresso-Hub
     nutzt dieselbe. Hier zaehlt nur die erste noch sichtbare Karte als
     Schrittmass, weil der Filter die anderen ausblendet.
     ------------------------------------------------------------------ */
  const band = window.BW && window.BW.spurPfeile
    ? window.BW.spurPfeile(spur, pfeilLeiste, { erste: () => sichtbar()[0] })
    : null;
  const pfeileNachfuehren = band ? band.nachfuehren : () => {};

  /* ------------------------------------------------------------------
     Filter
     ------------------------------------------------------------------ */
  function umschalten() {
    karten.forEach((karte) => {
      karte.hidden = !(aktiv === 'alle' || karte.dataset.art === aktiv);
    });
    spur.scrollLeft = 0;
    pfeileNachfuehren();
  }

  function waehlen(filter) {
    if (filter === aktiv) return;
    aktiv = filter;

    filterKnoepfe.forEach((knopf) => {
      const an = knopf.dataset.filter === filter;
      knopf.classList.toggle('ist-aktiv', an);
      knopf.setAttribute('aria-pressed', String(an));
    });

    if (!animiert) {
      umschalten();
      if (window.gsap) gsap.set(karten, { opacity: 1, x: 0 });
      return;
    }

    // Ein früherer Klick kann noch mitten im Aus- oder Einblenden stecken.
    if (ausblenden) ausblenden.kill();
    gsap.killTweensOf(karten, 'opacity,x');

    ausblenden = gsap.to(sichtbar(), {
      opacity: 0, x: -14, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        ausblenden = null;
        umschalten();
        gsap.set(karten, { x: 0 });
        gsap.fromTo(sichtbar(),
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.55, stagger: 0.05, ease: 'bw-aus' });
      }
    });
  }

  filterKnoepfe.forEach((knopf) => {
    knopf.addEventListener('click', () => waehlen(knopf.dataset.filter));
  });

  /* ------------------------------------------------------------------
     Auftritt
     ------------------------------------------------------------------ */
  if (animiert && window.ScrollTrigger) {
    gsap.set(karten, { opacity: 0, x: 60 });
    ScrollTrigger.create({
      trigger: spur,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        // Hat jemand vorher schon gefiltert, läuft das Einblenden bereits.
        if (ausblenden) return;
        gsap.to(sichtbar(), {
          opacity: 1, x: 0, duration: 1, stagger: 0.08, ease: 'bw-aus', overwrite: 'auto'
        });
      }
    });
  }

  pfeileNachfuehren();
})();
