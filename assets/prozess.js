/* ==========================================================================
   Beanwatch · Prozessweg
   Fünf Stationen, verbunden von einer gezeichneten Linie. Die Linie wird
   nicht abgelegt, sondern gemessen: Sie läuft durch die Mittelpunkte der
   Illustrationen, egal wie breit das Fenster ist. Beim Scrollen wächst sie.

   Zwei Fassungen:
     bis 1199 px   Die Stationen stehen untereinander, die Schiene links.
                   Die Linie schwingt senkrecht von Station zu Station.
     ab 1200 px    Die Bühne wird gepinnt, der Kopf bleibt stehen und das
                   Band fährt waagerecht durch. Die Linie wird zur Welle:
                   Sie verlässt die Zeichnung waagerecht, taucht unter den
                   Textblock ab und steigt zur nächsten Zeichnung auf.

     Ein Pfad      Alle Bögen in einem einzigen d, dadurch zeichnet DrawSVG
                   mit gleichbleibendem Tempo. Wo eine Zeichnung steht,
                   nimmt eine Maske die Linie weg.
     Zwei Schalen  Gemessen wird die äussere Zelle, die nie bewegt wird;
                   bewegt wird die innere. Sonst misst man Transforms mit.
     Ohne Rects    Gemessen wird über die Offset-Kette. Im waagerechten Band
                   fährt .pfad-weg per x, und getBoundingClientRect() trüge
                   diese Fahrt mit. Dasselbe Muster nutzt faehren.js.
     Reduzierte Bewegung  Kein Pin, Linie fertig, Phasen sichtbar.

   Die Zeichnungen werden immer eingespritzt, auch ohne Bewegung. Deshalb
   steht das hier und nicht in animationen.js, das bei reduzierter Bewegung
   vollständig aussteigt.
   ========================================================================== */

(function () {
  'use strict';

  const weg = document.querySelector('.pfad-weg');
  if (!weg || !window.gsap) return;

  const buehne = document.querySelector('.pfad-buehne');
  const svg = weg.querySelector('.pfad-linie');
  const phasen = gsap.utils.toArray('.pfad-phase', weg);
  if (!svg || !buehne || phasen.length < 2) return;

  const ruhig = window.BW && window.BW.wenigerBewegung;

  // Wie viel länger der Scrollweg ist als das Band. 1 wäre 1:1, 1.25 lässt
  // jede Station einen Moment stehen, statt durchzurauschen.
  const HALTEN = 1.25;

  /* ------------------------------------------------------------------
     Die Zeichnungen
     ------------------------------------------------------------------ */
  phasen.forEach((phase) => {
    const feld = phase.querySelector('.pfad-illu');
    const name = feld && feld.dataset.illu;
    if (!name || !window.bwProzess) return;
    feld.innerHTML = '<span class="pfad-illu-innen">' + bwProzess(name) + '</span>';
  });

  /* ------------------------------------------------------------------
     Die Linie
     Das Gerüst steht einmal, danach werden nur noch Werte gesetzt. So
     bleiben die Pfade dieselben Elemente, und eine laufende Animation
     verliert beim Neumessen ihren Fortschritt nicht.
     ------------------------------------------------------------------ */
  // Das Loch in der Maske folgt der Zeichnung, bleibt aber etwas enger
  // als ihr Kasten: Die Motive laufen an den Rändern aus, dort darf die
  // Linie ruhig schon zu sehen sein.
  const ENG = 0.88;
  const LUFT = 6;         // Abstand, den die Linie um jede Zeichnung lässt
  const TIEFE = 34;       // wie weit die Welle unter den Textblock taucht
  const RAND = 80;        // Reserve, damit die Maske überall deckt
  const r1 = (n) => Math.round(n * 10) / 10;

  svg.innerHTML =
    '<defs><mask id="pfad-maske" maskUnits="userSpaceOnUse">' +
      '<rect class="pfad-maske-grund" fill="#fff"/>' +
      phasen.map(() => '<ellipse fill="#000"/>').join('') +
    '</mask></defs>' +
    '<g mask="url(#pfad-maske)">' +
      '<path class="pfad-spur"/><path class="pfad-strich"/>' +
    '</g>';

  const spur = svg.querySelector('.pfad-spur');
  const strich = svg.querySelector('.pfad-strich');
  const grund = svg.querySelector('.pfad-maske-grund');
  const loecher = gsap.utils.toArray('#pfad-maske ellipse', svg);

  // Lage im Band, ohne Transforms: die Offset-Kette bis .pfad-weg.
  function lage(el) {
    let x = 0;
    let y = 0;
    for (let e = el; e && e !== weg; e = e.offsetParent) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    return { x: x, y: y, b: el.offsetWidth, h: el.offsetHeight };
  }

  /* Senkrecht: Bögen mit senkrechten Tangenten von Station zu Station.
     Der Hebel k entscheidet, wie rund der Bogen wird; ohne den Anteil aus
     der Breite schösse die Linie in engen Haken aus der Station. Oberhalb
     von dy schlägt sie zurück nach oben, 0.85 lässt Reserve. */
  function schlange(kn) {
    let d = 'M ' + r1(kn[0].x) + ' ' + r1(kn[0].y);
    for (let i = 1; i < kn.length; i++) {
      const a = kn[i - 1];
      const b = kn[i];
      const dx = Math.abs(b.x - a.x);
      const dy = b.y - a.y;
      const k = Math.max(24, Math.min(dy * 0.85, dy * 0.42 + dx * 0.22));
      d += ' C ' + r1(a.x) + ' ' + r1(a.y + k) +
           ' ' + r1(b.x) + ' ' + r1(b.y - k) +
           ' ' + r1(b.x) + ' ' + r1(b.y);
    }
    return d;
  }

  /* Waagerecht: je Lücke zwei Bögen über einen Tiefpunkt unter dem
     Textblock. Die Linie verlässt die Station nach unten und kommt von
     unten in die nächste, am Tiefpunkt läuft sie waagerecht. Dadurch
     taucht sie noch im Schatten der Zeichnung ab, wo die Maske sie
     ohnehin wegnimmt, und ist unter dem Text schon tief genug. Würde sie
     die Station nach rechts verlassen, liefe sie mitten durch die Schrift. */
  function welle(kn, texte) {
    let d = 'M ' + r1(kn[0].x) + ' ' + r1(kn[0].y);
    for (let i = 1; i < kn.length; i++) {
      const a = kn[i - 1];
      const b = kn[i];
      const t = texte[i - 1];
      const m = {
        x: t.x + t.b / 2,
        y: Math.max(a.y, b.y, t.y + t.h) + TIEFE
      };
      d += ' C ' + r1(a.x) + ' ' + r1(a.y + (m.y - a.y) * 0.85) +
           ' ' + r1(m.x - (m.x - a.x) * 0.55) + ' ' + r1(m.y) +
           ' ' + r1(m.x) + ' ' + r1(m.y);
      d += ' C ' + r1(m.x + (b.x - m.x) * 0.55) + ' ' + r1(m.y) +
           ' ' + r1(b.x) + ' ' + r1(b.y + (m.y - b.y) * 0.85) +
           ' ' + r1(b.x) + ' ' + r1(b.y);
    }
    return d;
  }

  function bauen() {
    if (!weg.offsetHeight) return;

    const knoten = phasen.map((phase) => {
      const i = lage(phase.querySelector('.pfad-illu'));
      return { x: i.x + i.b / 2, y: i.y + i.h / 2, rx: i.b / 2, ry: i.h / 2 };
    });
    const texte = phasen.map((phase) => lage(phase.querySelector('.pfad-text')));

    // Welche Fassung gerade gilt, sagt das Layout selbst.
    const letzte = knoten[knoten.length - 1];
    const waagerecht = (letzte.x - knoten[0].x) > (letzte.y - knoten[0].y);
    const d = waagerecht ? welle(knoten, texte) : schlange(knoten);

    spur.setAttribute('d', d);
    strich.setAttribute('d', d);

    // Die Maske nimmt die Linie dort weg, wo eine Zeichnung steht.
    grund.setAttribute('x', -RAND);
    grund.setAttribute('y', -RAND);
    grund.setAttribute('width', weg.offsetWidth + RAND * 2);
    grund.setAttribute('height', weg.offsetHeight + RAND * 2);
    loecher.forEach((loch, i) => {
      const n = knoten[i];
      loch.setAttribute('cx', r1(n.x));
      loch.setAttribute('cy', r1(n.y));
      loch.setAttribute('rx', r1(n.rx * ENG + LUFT));
      loch.setAttribute('ry', r1(n.ry * ENG + LUFT));
    });
  }

  bauen();

  // Ohne Bewegung ist hier Schluss: Die Linie steht ungekürzt da, die
  // Phasen sind ohnehin sichtbar. Nur nachmessen muss man noch.
  if (ruhig) {
    let warte;
    window.addEventListener('resize', () => {
      clearTimeout(warte);
      warte = setTimeout(bauen, 160);
    });
    return;
  }

  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  const zeichnet = !!(gsap.plugins && gsap.plugins.drawSVG);

  // Neu messen, wann immer ScrollTrigger neu misst: bei Grössenänderung,
  // beim Laden und bei jedem fremden refresh(). Danach löst ScrollTrigger
  // die Prozentwerte gegen die neue Pfadlänge auf, der Fortschritt bleibt.
  ScrollTrigger.addEventListener('refreshInit', bauen);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ------------------------------------------------------------------
     Die Auftritte
     Jede Station tritt einmal auf, kurz bevor die Linie sie erreicht.
     Dazu ein ruhiger Akzent in der Zeichnung selbst, einer je Station.
     ------------------------------------------------------------------ */
  function akzent(phase) {
    const art = phase.querySelector('.pfad-illu').dataset.illu;
    const teile = (wahl) => phase.querySelectorAll(wahl);
    const tl = gsap.timeline();

    if (art === 'zweig') {
      // Vier Trauben zu je sechs Beeren: eng gestaffelt, sonst dauert es zu lang.
      tl.from(teile('.kirsche'), {
        scale: 0, duration: 0.45, stagger: 0.03,
        ease: 'back.out(2.4)', transformOrigin: '50% 50%'
      });
    } else if (art === 'containerschiff') {
      tl.from(teile('.container'), {
        yPercent: 55, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.5)'
      });
    } else if (art === 'bullet') {
      // Auswurf: Hebel runter, Klappe auf, ein Strom gerösteter Bohnen fällt
      // in die Schale, etwas Rauch steigt auf, Klappe wieder zu.
      //
      // Der Strom kommt nicht aus vielen Bohnen im SVG, sondern aus zwölf,
      // die mehrmals fallen: Jede hat eine kleine Zeitleiste, die sich
      // DURCHGAENGE-mal wiederholt, und die zwölf starten über eine Fallzeit
      // verteilt. So sind ständig acht bis zehn in der Luft. repeatRefresh
      // würfelt Weite, Tiefe und Drehung bei jedem Durchgang neu, damit
      // keine Bohne zweimal gleich fällt. Waagerecht gleichmässig und
      // senkrecht beschleunigt ergibt die Wurfbahn ohne MotionPath. Den Rand
      // der Schale braucht niemand auszublenden: Sie liegt im SVG vorn und
      // deckt die Bohnen selbst ab.
      const FALL = 0.6;
      const DURCHGAENGE = 4;
      const AUF = 0.32;
      const klappe = phase.querySelector('.klappe');
      const hebel = phase.querySelector('.hebel');
      const dampf = phase.querySelector('.roestdampf');
      const faeden = teile('.roestdampf path');
      const bohnen = teile('.roestbohne');
      const zufall = gsap.utils.random;

      tl.to(hebel, { y: 8, duration: 0.3, ease: 'bw-weich' }, 0)
        .to(klappe, { rotation: 12, svgOrigin: '82 79', duration: 0.35, ease: 'bw-weich' }, 0.05);

      bohnen.forEach((bohne, i) => {
        const lauf = gsap.timeline({ repeat: DURCHGAENGE - 1, repeatRefresh: true })
          .set(bohne, { opacity: 1, x: 0, y: 0, rotation: 0 }, 0)
          .to(bohne, { x: () => zufall(-58, -40), duration: FALL, ease: 'power1.out' }, 0)
          .to(bohne, { y: () => zufall(35, 40), duration: FALL, ease: 'power2.in' }, 0)
          .to(bohne, {
            rotation: () => zufall(-260, 260), duration: FALL, ease: 'none',
            transformOrigin: '50% 50%'
          }, 0)
          .set(bohne, { opacity: 0 }, FALL);
        tl.add(lauf, AUF + (i / bohnen.length) * FALL);
      });

      // Ende des Stroms: letzte Bohne startet eine Fallzeit später und fällt
      // DURCHGAENGE-mal.
      const zu = AUF + FALL + FALL * DURCHGAENGE;

      if (zeichnet && dampf) {
        tl.set(faeden, { drawSVG: '0% 0%' }, 0)
          .set(dampf, { opacity: 0.5 }, 1)
          .to(faeden, { drawSVG: '0% 100%', duration: 1.1, stagger: 0.2, ease: 'power1.out' }, 1)
          .to(faeden, { y: -12, duration: 2, ease: 'sine.out' }, 1.4)
          .to(dampf, { opacity: 0, duration: 0.9, ease: 'sine.in' }, zu - 0.3);
      }

      tl.to(klappe, { rotation: 0, svgOrigin: '82 79', duration: 0.4, ease: 'bw-weich' }, zu)
        .to(hebel, { y: 0, duration: 0.4, ease: 'bw-weich' }, zu);
    } else if (art === 'versand') {
      tl.from(teile('.pfad-beutel'), { y: -30, duration: 0.9, ease: 'bw-weich' });
    } else if (art === 'zuriga' && zeichnet) {
      tl.from(teile('.strahl'), { drawSVG: '0% 0%', duration: 0.5, ease: 'none' });
    }
    return tl;
  }

  function auftritt(phase, ausloeser) {
    gsap.timeline({ scrollTrigger: ausloeser })
      .from(phase.querySelector('.pfad-illu-innen'), {
        opacity: 0, scale: 0.84, duration: 0.9,
        ease: 'bw-aus', transformOrigin: '50% 50%'
      }, 0)
      .from(phase.querySelector('.pfad-text'), {
        opacity: 0, y: 26, duration: 0.9, ease: 'bw-aus'
      }, 0.08)
      .add(akzent(phase), 0.4);
  }

  /* ------------------------------------------------------------------
     Die zwei Fassungen
     ------------------------------------------------------------------ */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 1200px)', () => {
    // Das Band ist breiter als das Fenster. Verschoben wird .pfad-weg,
    // damit die Linie mitfährt: Sie liegt darin.
    const strecke = () => Math.max(1, weg.offsetWidth - window.innerWidth);

    const fahrt = gsap.to(weg, {
      x: () => -strecke(),
      ease: 'none',
      scrollTrigger: {
        trigger: buehne,
        pin: true,
        scrub: 0.75,
        start: 'top top',
        end: () => '+=' + strecke() * HALTEN,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Zuerst messen: Der Drift der Sterne (atmosphaere.js) hängt an der
        // ganzen Section und muss die Pin-Strecke schon kennen. Er entsteht
        // früher, deshalb danach neu sortieren.
        refreshPriority: 1
      }
    });
    ScrollTrigger.sort();

    // Die Linie hängt an denselben Grenzen und läuft dadurch im Takt.
    if (zeichnet) {
      gsap.fromTo(strich,
        { drawSVG: '0% 0%' },
        {
          drawSVG: '0% 100%',
          ease: 'none',
          scrollTrigger: {
            trigger: buehne,
            start: 'top top',
            end: () => '+=' + strecke() * HALTEN,
            scrub: 0.75,
            invalidateOnRefresh: true
          }
        });
    }

    // containerAnimation macht die Fahrt für ScrollTrigger lesbar, dadurch
    // treten die Stationen beim Durchlauf auf.
    phasen.forEach((phase) => auftritt(phase, {
      trigger: phase, containerAnimation: fahrt, start: 'left 82%', once: true
    }));

    return () => gsap.set(weg, { x: 0 });
  });

  mm.add('(max-width: 1199px)', () => {
    if (zeichnet) {
      gsap.fromTo(strich,
        { drawSVG: '0% 0%' },
        {
          drawSVG: '0% 100%',
          ease: 'none',
          scrollTrigger: {
            trigger: weg,
            start: 'top 74%',
            end: 'bottom 78%',
            scrub: 0.5,
            invalidateOnRefresh: true
          }
        });
    }

    phasen.forEach((phase) => auftritt(phase, {
      trigger: phase, start: 'top 78%', once: true
    }));
  });
})();
