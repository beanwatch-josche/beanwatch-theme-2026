/* ==========================================================================
   Beanwatch · Fähren im Hero
   Startseite: Zwei Autofähren im Wasser des Heros. Beim Runterscrollen
   fahren sie aufeinander zu, kreuzen sich in der Mitte und fahren weiter bis
   fast an den Startpunkt der anderen. Beim Hochscrollen alles rückwärts.
   Gezeichnet werden sie von bwFaehre() in illustrationen.js.

   Links KAFFEE mit Rohkaffee in Jute aus Brasilien, Kolumbien und
   Äthiopien (Ladung 'stapel'), hintere Spur. Rechts RÖSTEREI mit zwei
   Haufen Beanwatch-Beuteln (Ladung 'haufen', braucht beutel.js), vordere
   Spur. Unterwegs denken beide laut.

   Die Bausteine dafür stehen als window.BWFaehren bereit. Die Über-uns-Seite
   nutzt sie für ihre Fähre und den Läufer (ueberuns-hero.js).
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Bausteine
     ------------------------------------------------------------------ */

  // Gedankenblase an eine Spur hängen. Der Text wird als Text eingesetzt,
  // nicht als HTML. seite: 'links' oder 'rechts', dorthin hängt die Blase.
  function gedankeAnhaengen(spur, seite, text) {
    const gedanke = document.createElement('div');
    gedanke.className = 'gedanke gedanke--' + seite;
    gedanke.innerHTML = '<span class="gedanke-punkt gedanke-punkt--1"></span>' +
                        '<span class="gedanke-punkt gedanke-punkt--2"></span>' +
                        '<p class="gedanke-blase"></p>';
    gedanke.querySelector('.gedanke-blase').textContent = text || '';
    spur.appendChild(gedanke);
    return gedanke;
  }

  // GSAP bewegt die linke Kante der Spur, gerechnet wird mit der Mitte.
  const kante = (spur, mitte) => mitte - spur.offsetWidth / 2;

  // Oberkante im Hero, ohne Transforms gerechnet: Beim Vermessen sind die
  // Blasen klein oder unsichtbar, und die Fähren schaukeln.
  function imHero(hero, el) {
    let y = 0;
    for (let e = el; e && e !== hero; e = e.offsetParent) y += e.offsetTop;
    return y;
  }

  /* Ende der Fahrt
     Sie endet, sobald die höchste Blase knapp unter der festen Kopfleiste
     steht. Das wird gemessen statt in Prozent angegeben: Wie weit die Blase
     über das Hero-Ende ragt, hängt von der Breite ab, der Platz darüber von
     der Höhe. Auf einem niedrigen Laptop stiesse sie bei festen Prozent an
     die Kopfleiste. Die Parallaxe aus animationen.js senkt die Wellen samt
     Fähren beim Scrollen noch etwas ab. Sie bleibt hier aussen vor und gibt
     Reserve, auch wenn sie sich einmal ändert. */
  function fahrtEnde(hero, gedanken) {
    const LUFT = 16;          // zwischen Kopfleiste und höchster Blase
    const MIN_WEG = 240;      // so viel Scroll bekommt die Fahrt mindestens
    return () => {
      const blasen = gedanken.map(g => imHero(hero, g.querySelector('.gedanke-blase')));
      const ueberKante = hero.offsetHeight - Math.min(...blasen);
      const kopf = document.getElementById('kopf');
      const kopfUnten = kopf ? kopf.offsetTop + kopf.offsetHeight : 0;
      const y = Math.min(kopfUnten + LUFT + ueberKante, window.innerHeight - MIN_WEG);
      return 'bottom ' + Math.round(y) + 'px';
    };
  }

  /* Die Gedankenblasen
     Eigenes Tempo statt Scroll: Hingen sie am Scroll, sah man sie bei
     schnellem Scrollen fast schlagartig. So wachsen sie ruhig, sobald die
     Fahrt die Schwelle erreicht — erst die erste Blase: der kleine Kreis,
     der grössere und die Blase. Hat sie sich gesetzt, folgt ohne Pause die
     nächste.

     Durch den Scrub hinken die Schiffe dem Finger nach. Die Blasen kommen
     deshalb erst, wenn auch die Schiffe die Schwelle erreicht haben, und
     gehen, sobald einer von beiden zurück ist — meist der Finger. Beim
     Hochwischen sind sie so weg, bevor die Buttons wieder da sind. Alle
     ploppen dann zugleich weg, nacheinander stünde die erste zu lange. */
  function blasen(fahrt, gedanken, ab) {
    const aufgehen = gsap.timeline({ paused: true });
    gedanken.forEach((g, i) => {
      const [klein, gross] = g.querySelectorAll('.gedanke-punkt');
      const blase = g.querySelector('.gedanke-blase');
      aufgehen
        .fromTo(klein, { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.4)' }, i ? '>' : 0)
        .fromTo(gross, { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.4)' }, '-=0.12')
        .fromTo(blase, { scale: 0.25, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.75, ease: 'back.out(1.6)' }, '-=0.1');
    });

    const teile = gedanken.flatMap(g => [...g.children]);
    let denkt = false;
    let weg = null;
    gsap.ticker.add(() => {
      // fahrt.progress() ist, wo die Schiffe sind, scrollTrigger.progress,
      // wo der Finger ist.
      const soll = Math.min(fahrt.progress(), fahrt.scrollTrigger.progress) >= ab;
      if (soll === denkt) return;
      denkt = soll;
      if (soll) {
        if (weg) weg.kill();
        aufgehen.restart();
      } else {
        aufgehen.pause();
        weg = gsap.to(teile, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.out' });
      }
    });
  }

  /* Schaukeln
     Heben und Kippen mit gleichem Takt, das Kippen um eine Viertelperiode
     versetzt. So wirkt es, als liefe eine Welle unter dem Schiff durch:
     erst hebt sich der Bug, dann das Heck. Auf der inneren Gruppe, damit es
     sich nicht mit der Fahrt ins Gehege kommt. Drehpunkt ist die Mitte der
     Wasserlinie. */
  function schaukeln(spur, takt, versatz) {
    const schiff = spur.querySelector('.faehre-schiff');
    gsap.set(schiff, { svgOrigin: '250 132' });
    gsap.fromTo(schiff, { y: 1.5 }, {
      y: -3, duration: takt, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: versatz
    });
    gsap.fromTo(schiff, { rotation: -1.6 }, {
      rotation: 1.6, duration: takt, repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: versatz + takt / 2
    });
  }

  /* Kielwasser
     Gemessen wird, wie weit sich jede Fähre seit dem letzten Bild bewegt
     hat, nicht die Scrollgeschwindigkeit: Durch den Scrub gleitet sie noch
     nach, wenn der Finger längst stillsteht, und so lange zieht sie auch
     ihre Spur. Die Fähren sind Doppelender und wenden nicht — das
     Kielwasser wechselt deshalb mit der Richtung das Ende. */
  function kielwasser(spurListe) {
    const spuren = spurListe.map((spur) => {
      const enden = {};
      [['links', '10 128'], ['rechts', '490 128']].forEach(([seite, ursprung]) => {
        const g = spur.querySelector('.kielwasser--' + seite);
        gsap.set(g, { svgOrigin: ursprung, scaleX: 0.35 });
        enden[seite] = {
          deckkraft: gsap.quickTo(g, 'opacity', { duration: 0.45, ease: 'power2.out' }),
          laenge: gsap.quickTo(g, 'scaleX', { duration: 0.45, ease: 'power2.out' })
        };
      });
      return { spur, enden, zuletzt: gsap.getProperty(spur, 'x') };
    });

    gsap.ticker.add(() => {
      spuren.forEach((s) => {
        const x = gsap.getProperty(s.spur, 'x');
        const weg = x - s.zuletzt;
        s.zuletzt = x;

        // Rund sechs Pixel pro Bild entsprechen zügigem Scrollen.
        const staerke = gsap.utils.clamp(0, 1, Math.abs(weg) / 6);
        const hinten = weg > 0 ? s.enden.links : s.enden.rechts;
        const vorne = weg > 0 ? s.enden.rechts : s.enden.links;

        hinten.deckkraft(staerke * 0.9);
        hinten.laenge(0.35 + staerke * 0.9);
        vorne.deckkraft(0);
      });
    });
  }

  window.BWFaehren = { gedankeAnhaengen, kante, fahrtEnde, blasen, schaukeln, kielwasser };

  /* ------------------------------------------------------------------
     Startseite
     ------------------------------------------------------------------ */
  const hero = document.getElementById('hero');
  const links = document.getElementById('faehre-kaffee');
  const rechts = document.getElementById('faehre-roesterei');
  if (!hero || !links || !rechts || !window.bwFaehre) return;

  const gedanken = [links, rechts].map((spur) => {
    spur.innerHTML = bwFaehre({
      name: spur.dataset.faehre,
      ladung: spur.dataset.ladung,
      akzent: spur.dataset.akzent
    });
    return gedankeAnhaengen(spur, spur === links ? 'links' : 'rechts', spur.dataset.gedanke);
  });

  const ruhig = window.BW && window.BW.wenigerBewegung;

  /* Wege
     Die Spur ist 1,2-mal so breit wie das Schiff, weil das SVG links und
     rechts Platz fürs Kielwasser lässt. Ihre Mitte ist die Schiffsmitte. */
  const breite = () => hero.clientWidth;
  const laenge = (spur) => spur.offsetWidth / 1.2;
  const RAND = 16;

  // So nah am Rand, wie es geht, ohne dass ein Schiff angeschnitten wird.
  const start = {
    links: () => Math.max(laenge(links) / 2 + RAND, breite() * 0.14),
    rechts: () => Math.min(breite() - laenge(rechts) / 2 - RAND, breite() * 0.86)
  };

  // Jedes fährt bis fast an den Startpunkt des anderen.
  const VOR_DEM_ZIEL = 0.04;
  const ziel = {
    links: () => start.rechts() - breite() * VOR_DEM_ZIEL,
    rechts: () => start.links() + breite() * VOR_DEM_ZIEL
  };

  if (ruhig) {
    // Keine Fahrt, kein Schaukeln. Die Blasen bleiben weg: An den
    // Startpunkten haben sie über den Schiffen keinen Platz.
    gsap.set(gedanken, { autoAlpha: 0 });
    const setzen = () => {
      gsap.set(links, { x: kante(links, start.links()) });
      gsap.set(rechts, { x: kante(rechts, start.rechts()) });
    };
    setzen();
    window.addEventListener('resize', setzen);
    return;
  }

  /* Die Fahrt, an den Scroll gebunden
     Sie beginnt, wenn das Hero-Ende den unteren Fensterrand erreicht. Auf
     dem Desktop füllt der Hero genau den Bildschirm, dort heisst das: ab
     dem ersten Pixel. Liegen die Fähren unterhalb des ersten Bildschirms,
     etwa auf einem kleinen Handy, beginnt sie erst, wenn sie ins Bild
     kommen. Die Zeitleiste hat die Länge 1, alle Zeitpunkte sind Anteile
     der Fahrt. */
  const fahrt = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      // Ist der Hero niedriger als das Fenster, etwa auf dem Tablet hochkant,
      // läge der Start vor dem Seitenanfang, und die Fähren stünden schon beim
      // Laden mitten auf dem See. clamp() setzt ihn dann auf Scroll 0.
      start: 'clamp(bottom bottom)',
      end: fahrtEnde(hero, gedanken),
      scrub: 0.8,
      invalidateOnRefresh: true
    }
  })
    .fromTo(links,
      { x: () => kante(links, start.links()) },
      { x: () => kante(links, ziel.links()), duration: 1 }, 0)
    .fromTo(rechts,
      { x: () => kante(rechts, start.rechts()) },
      { x: () => kante(rechts, ziel.rechts()), duration: 1 }, 0);

  /* Platz für die Gedanken
     Pillen und Buttons scrollen mit den Schiffen nach oben, der Abstand
     wächst nur durch die leichte Parallaxe der Startseite. Für eine Blase
     reicht das nicht. Deshalb hebt sich der Hero-Inhalt in den ersten
     Metern der Fahrt ein Stück schneller weg — auf y, die Parallaxe aus
     animationen.js arbeitet auf yPercent und läuft unberührt weiter. */
  const HUB = 110;          // so viel zusätzlich, in Pixeln
  const HUB_BIS = 0.2;      // bis zu diesem Anteil der Fahrt
  const GEDANKE_AB = 0.2;   // ab hier denken sie laut

  fahrt.to('.hero-text', { y: -HUB, duration: HUB_BIS }, 0);
  blasen(fahrt, gedanken, GEDANKE_AB);

  // Auftritt mit dem übrigen Hero.
  gsap.from([links, rechts], {
    autoAlpha: 0, y: 26, duration: 1.3, delay: 0.7, stagger: 0.18, ease: 'bw-aus'
  });

  schaukeln(links, 2.9, 0);
  schaukeln(rechts, 2.5, 0.6);
  kielwasser([links, rechts]);
})();
