/* ==========================================================================
   Beanwatch · Hero mit Wellen
   Startseite und Über uns: Zeichen-Animation der Überschrift, Intro, Sonne,
   Wellen und Parallaxe beim Verlassen des Heros. Dazu das Reverse-Prinzip,
   das nur noch im Archiv steht. Alles Gemeinsame steht in basis.js.
   ========================================================================== */

(function () {
  'use strict';

  if (!document.getElementById('hero')) return;
  const ruhig = window.BW && window.BW.wenigerBewegung;
  if (ruhig) return;

  /* ------------------------------------------------------------------
     01 · Hero
     ------------------------------------------------------------------ */

  // Headline zeichenweise aus der Maske. mask:"lines" legt den
  // Überlauf-Container selbst an, autoSplit baut bei Fontload neu auf.
  SplitText.create('#hero h1 .inner-zeile', {
    type: 'chars,lines',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.chars, {
        yPercent: 118,
        rotate: 4,
        duration: 1.15,
        stagger: { each: 0.022, from: 'start' },
        ease: 'bw-aus'
      });
    }
  });

  const intro = gsap.timeline({ delay: 0.15 })
    .from('[data-hero="eyebrow"]', { opacity: 0, y: 18, duration: 0.75 }, 0)
    .from('[data-hero="sub"]', { opacity: 0, y: 24, duration: 0.9 }, 0.55)
    // Knöpfe und Pillen gibt es nicht in jedem Hero, auf Über uns fehlen sie.
    .from(document.querySelectorAll('[data-hero="aktionen"] > *'), { opacity: 0, y: 22, duration: 0.8, stagger: 0.09 }, 0.68)
    .from(document.querySelectorAll('[data-hero="belege"] .pill'), { opacity: 0, y: 16, scale: 0.9, duration: 0.7, stagger: 0.07 }, 0.8)
    .from('#scrollhinweis', { opacity: 0, y: -14, duration: 0.8 }, 1.15);

  // Die Produktbühne mit Medaillon, Bohnen und Notizen gibt es seit dem
  // Fähren-Hero nur noch auf archiv.html. Auf der Startseite fahren
  // stattdessen die Fähren, siehe faehren.js.
  const produktbuehne = document.querySelector('.hero-buehne');
  if (produktbuehne) {
    intro
      .from('#hero-scheibe', { scale: 0.35, opacity: 0, duration: 1.25 }, 0.25)
      .from('#hero-ring', { scale: 0.6, opacity: 0, rotate: -60, duration: 1.4 }, 0.3)
      .from('#hero-beutel', { yPercent: 22, opacity: 0, rotate: -7, duration: 1.35 }, 0.42)
      .from('.hero-bohne', { scale: 0, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(2.2)' }, 0.75)
      .from('[data-notiz]', { opacity: 0, scale: 0.7, y: 12, duration: 0.7, stagger: 0.1, ease: 'back.out(1.8)' }, 0.95);
  }

  // Sonne dreht endlos, der Kern atmet.
  gsap.to('#sonnen-strahlen', {
    rotate: 360, duration: 90, repeat: -1, ease: 'none', transformOrigin: '50% 50%'
  });
  gsap.to('#sonnen-kern', {
    scale: 1.09, opacity: 0.28, duration: 3.4,
    repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 50%'
  });

  // Bohnen und Notizen schweben, jede mit eigenen Werten.
  gsap.utils.toArray('.hero-bohne').forEach((bohne, i) => {
    gsap.to(bohne, {
      y: gsap.utils.random(-26, -14),
      x: gsap.utils.random(-12, 12),
      rotate: gsap.utils.random(-22, 22),
      duration: gsap.utils.random(3.2, 5.4),
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.24
    });
  });
  gsap.utils.toArray('[data-notiz]').forEach((notiz, i) => {
    gsap.to(notiz, {
      y: -9, duration: gsap.utils.random(2.4, 3.6),
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.4
    });
  });

  // Drei Wellenebenen, unterschiedlich schnell. Jedes SVG ist doppelt so
  // breit wie der Viewport und läuft um die halbe Breite: nahtlose Schleife.
  [['#welle-hinten', 26], ['#welle-mitte', 18], ['#welle-vorne', 12]].forEach(([el, dauer]) => {
    gsap.fromTo(el, { xPercent: 0 }, { xPercent: -50, duration: dauer, repeat: -1, ease: 'none' });
    gsap.to(el, {
      y: gsap.utils.random(-9, -4), duration: gsap.utils.random(3, 5),
      repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
  });

  // Parallax beim Verlassen des Heros.
  const verlassen = gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
  })
    .to('.hero-text', { yPercent: -22, opacity: 0.15, ease: 'none' }, 0)
    .to('#hero-sonne', { yPercent: 46, rotate: 22, ease: 'none' }, 0)
    .to('.hero-wellen', { yPercent: 26, ease: 'none' }, 0)
    .to('#scrollhinweis', { opacity: 0, duration: 0.2, ease: 'none' }, 0);
  if (produktbuehne) verlassen.to(produktbuehne, { yPercent: -9, ease: 'none' }, 0);

  /* ------------------------------------------------------------------
     02 · Reverse-Prinzip
     Ein Klick tauscht Position (Flip) und Farbrollen der beiden Karten,
     genau wie es der CI-Guide für Espresso und Filter beschreibt.
     ------------------------------------------------------------------ */
  const schalter = document.getElementById('reverse-schalter');
  const buehne = document.getElementById('reverse-buehne');

  if (schalter && buehne) {
    const PINK = '#E7455B';
    const HELL = '#FFF3E8';
    let getauscht = false;
    let laeuft = false;

    schalter.addEventListener('click', () => {
      if (laeuft) return;
      laeuft = true;

      const karten = gsap.utils.toArray('.reverse-karte', buehne);
      const status = Flip.getState(karten, { props: 'backgroundColor,color' });

      buehne.insertBefore(karten[1], karten[0]);

      getauscht = !getauscht;
      gsap.set('#karte-espresso', {
        backgroundColor: getauscht ? HELL : PINK,
        color: getauscht ? PINK : HELL
      });
      gsap.set('#karte-filter', {
        backgroundColor: getauscht ? PINK : HELL,
        color: getauscht ? HELL : PINK
      });

      Flip.from(status, {
        duration: 0.95, ease: 'bw-weich', absolute: true, scale: false,
        onComplete: () => { laeuft = false; }
      });

      gsap.fromTo('.reverse-karte .beutel',
        { rotate: 0 },
        { rotate: getauscht ? 8 : -8, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    });

    // Einmal von selbst kippen, damit das Prinzip auffällt.
    ScrollTrigger.create({
      trigger: buehne,
      start: 'top 62%',
      once: true,
      onEnter: () => gsap.delayedCall(0.7, () => schalter.click())
    });
  }
})();
