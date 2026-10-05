/* ==========================================================================
   Beanwatch · Hero der Über-uns-Seite
   Die Szene aus dem bisherigen Foto: Joscha rennt mit der Riesenbohne unter
   dem Arm über die Wiese vor der Mauer, dahinter fährt die Fähre. Beim
   Runterscrollen läuft er von links nach rechts, die Fähre fährt von rechts
   nach links, in der Mitte kreuzen sie sich. Beim Hochscrollen rückwärts.

     Gezeichnet   bwFaehre() und bwUfer() in illustrationen.js, der Läufer
                  ist das Signet: bwLaeufer() in laeufer-signet.js, erzeugt
                  von werkzeug/signet-laeufer.rb
     Bausteine    Blasen, Schaukeln, Kielwasser und das Ende der Fahrt teilt
                  sich die Seite mit der Startseite (BWFaehren in faehren.js)
     Laufschritt  Rennen mit Flugphase (BWLauf, unten). Die Phase hängt an
                  der zurückgelegten Strecke, nicht an der Zeit; wie stark er
                  rennt, ist ein Wert zwischen 0 und 1, den gsap.quickTo
                  weich nachführt. Bei 0 steht er genau wie das Signet.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Laufzyklus
     Rennen, nicht gehen, nach der Biomechanik des Laufens. Phase eines
     Beins:
       0     Aufsetzen knapp vor der Hüfte, Schienbein steil
       0,1   tiefster Punkt, Knie im Stütz gebeugt, Sohle flach
       0,25  Abdruck über die Zehen, Fuss gestreckt; danach Flug
       0,5   Ferse unter dem Po, das Knie zieht durch
       0,65  Kniehub, der Oberschenkel fast waagrecht
       0,8   der Unterschenkel klappt vor, der Fuss zeigt nach vorne
       0,92  das Bein greift zurück zum Boden
     Das hintere Bein läuft eine halbe Phase versetzt. Zwischen den
     Stützstellen wird weich interpoliert (Catmull-Rom, periodisch).

     Winkel in Grad. Oberschenkel: Richtung Hüfte–Knie, positiv nach vorne.
     Knie: Beugung. Fuss: Drehung gegenüber dem Signet, positiv mit den
     Zehen nach unten.

     Bodenkontakt: Im Stütz steht die Sohle flach und genau auf der
     Grundlinie, die Körperhöhe richtet sich danach. Zwischen Abdruck und
     Aufsetzen fliegt der Körper auf einem Bogen. Die Schrittlänge folgt aus
     der Strecke, die der Fuss im Stütz unter dem Körper zurücklegt; so
     rutscht er nicht.

     Stärke s zwischen 0 und 1: Gesetzt wird Ruhe plus s mal (Ziel − Ruhe).
     Im Stillstand zeigen sich die Originalbeine des Signets. Zwischen den
     beiden Stärken in SIGNETBEINE blenden sie aus und die nachgebauten ein;
     deren Form weicht leicht ab, ein hartes Umschalten spränge sichtbar.
     window.BWLauf dient der Abstimmung.
     ------------------------------------------------------------------ */
  const BEIN = {
    oberschenkel: [[0, 26], [0.1, 6], [0.25, -22], [0.36, -14], [0.5, 16], [0.65, 80], [0.8, 64], [0.92, 36]],
    knie:         [[0, 16], [0.1, 32], [0.25, 26], [0.36, 80], [0.5, 125], [0.65, 112], [0.8, 60], [0.92, 22]],
    fuss:         [[0, -6], [0.1, 0], [0.25, 32], [0.36, 26], [0.5, 4], [0.65, -10], [0.8, -8], [0.92, -6]]
  };
  const STUETZ = 0.25;      // Anteil des Zyklus mit Bodenkontakt, je Bein
  const NEIGUNG = 8;        // Vorlage des Körpers
  const FLUG = 34;          // so viel höher als die Verbindungslinie liegt der Scheitel des Flugs
  // Anteil der Oberschenkelbewegung, den der freie Arm gegengleich mitgeht.
  // Steht auf 0: Der Arm ist ein Ausschnitt der Originalzeichnung, und schon
  // bei ±13° ragen am Ansatz Kanten heraus. Er bleibt in der Signet-Pose,
  // die schon ein Laufarm ist. Zum Pumpen müsste er nachgebaut werden wie
  // die Beine.
  const ARM = 0;
  const SIGNETBEINE = [0.02, 0.3];
  // Hosenbeine: Der Saum geht zu diesem Anteil mit dem Oberschenkel mit und
  // folgt ihm um so viel Phase verzögert, wie lockerer Stoff nachzieht.
  const MITNAHME = 0.9;
  const NACHZIEHEN = 0.03;

  const eins = gsap.utils.wrap(0, 1);
  const rad = (grad) => grad * Math.PI / 180;
  const richtungVon = (von, bis) => Math.atan2(bis[0] - von[0], bis[1] - von[1]) * 180 / Math.PI;
  const neigungGrad = (von, bis) => Math.atan2(bis[1] - von[1], bis[0] - von[0]) * 180 / Math.PI;
  const glatt = (von, bis, x) => {
    const t = Math.min(1, Math.max(0, (x - von) / (bis - von)));
    return t * t * (3 - 2 * t);
  };
  const drehen = ([x, y], winkel, [cx, cy]) => {
    const c = Math.cos(rad(winkel)), s = Math.sin(rad(winkel));
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };

  function kurve(tabelle) {
    const n = tabelle.length;
    const wert = (k) => tabelle[((k % n) + n) % n][1];
    return (phase) => {
      const p = eins(phase);
      let i = n - 1;
      for (let k = 0; k < n; k++) if (tabelle[k][0] <= p) i = k;
      const von = tabelle[i][0];
      const bis = i + 1 < n ? tabelle[i + 1][0] : 1;
      const u = (p - von) / (bis - von);
      const a = wert(i - 1), b = wert(i), c = wert(i + 1), d = wert(i + 2);
      return 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u +
        (3 * b - a - 3 * c + d) * u * u * u);
    };
  }
  const kurven = {
    oberschenkel: kurve(BEIN.oberschenkel),
    knie: kurve(BEIN.knie),
    fuss: kurve(BEIN.fuss)
  };

  // Die Sohle liegt flach, kurz nach dem Aufsetzen, bis sich die Ferse hebt.
  const flach = (q) => glatt(0, 0.04, q) * (1 - glatt(0.15, 0.22, q));

  function laufen(svg, P) {
    const oberRuhe = richtungVon(P.huefte, P.knie);
    const knieRuhe = oberRuhe - richtungVon(P.knie, P.knoechel);
    const versatz = [P.huefteHinten[0] - P.huefte[0], P.huefteHinten[1] - P.huefte[1]];

    // Drehungen [Hüfte, Knie, Knöchel] für ein Bein in seiner Phase q. Der
    // Oberschenkel dreht gegen den Uhrzeigersinn nach vorne, darum das Minus.
    // Liegt die Sohle flach, hebt der Fuss alle Drehungen darüber auf.
    function ziel(q) {
      const rO = -(kurven.oberschenkel(q) - oberRuhe);
      const rK = kurven.knie(q) - knieRuhe;
      const w = flach(eins(q));
      return [rO, rK, kurven.fuss(q) * (1 - w) - (NEIGUNG + rO + rK) * w];
    }

    // Ruhepose des hinteren Beins: gedreht wie das hintere Bein im Signet.
    const H = P.signetHinten;
    const rOh = -(richtungVon(P.huefteHinten, H.knie) - oberRuhe);
    const rKh = richtungVon(P.huefteHinten, H.knie) - richtungVon(H.knie, H.knoechel) - knieRuhe;
    const rFh = neigungGrad(H.knoechel, H.zehen) - neigungGrad(P.knoechel, P.sohle[1]) - rOh - rKh;
    const ruheHinten = [rOh, rKh, rFh];

    // Ein Punkt des Fusses in Koordinaten des Körpers, vorgeneigt, ungehoben.
    function welt(punkt, [rO, rK, rF], t) {
      let q = drehen(punkt, rF, P.knoechel);
      q = drehen(q, rK, P.knie);
      q = drehen(q, rO, P.huefte);
      return drehen([q[0] + t[0], q[1] + t[1]], NEIGUNG, P.becken);
    }
    const tiefste = (r, t) => Math.max(...P.sohle.map((punkt) => welt(punkt, r, t)[1]));

    // Körperhöhe über den Zyklus, in der Phase des vorderen Beins.
    function hoeheBei(p) {
      const qv = eins(p), qh = eins(p + 0.5);
      if (qv < STUETZ) return P.boden - tiefste(ziel(qv), [0, 0]);
      if (qh < STUETZ) return P.boden - tiefste(ziel(qh), versatz);
      const abdruck = Math.floor(qv * 2) / 2 + STUETZ;
      const aufsetzen = Math.floor(qv * 2) / 2 + 0.5;
      const u = (qv - abdruck) / (aufsetzen - abdruck);
      const von = hoeheBei(abdruck - 1e-4);
      const bis = hoeheBei(aufsetzen);
      return von + (bis - von) * u - FLUG * 4 * u * (1 - u);
    }
    const N = 240;
    const hoehen = Array.from({ length: N + 1 }, (_, i) => hoeheBei(i / N));
    const hoehe = (p) => {
      const x = eins(p) * N;
      const i = Math.floor(x);
      return hoehen[i] + (hoehen[i + 1] - hoehen[i]) * (x - i);
    };

    // Solange die Sohle flach liegt, steht der Ballen still: Um so viel
    // schiebt sich der Körper in dieser Zeit vor.
    const ballen = (q) => welt(P.sohle[1], ziel(q), [0, 0])[0];
    const doppelschritt = (ballen(0.04) - ballen(0.15)) / 0.11;

    // Der Takt beginnt dort, wo die Beine dem Signet am nächsten sind.
    let start = 0;
    let naechste = Infinity;
    for (let k = 0; k < 200; k++) {
      const v = ziel(k / 200), h = ziel(k / 200 + 0.5);
      const abstand = v[0] ** 2 + v[1] ** 2 + (h[0] - ruheHinten[0]) ** 2 + (h[1] - ruheHinten[1]) ** 2;
      if (abstand < naechste) { naechste = abstand; start = k / 200; }
    }

    const gelenke = {};
    svg.querySelectorAll('[data-gelenk]').forEach((el) => {
      (gelenke[el.dataset.gelenk] = gelenke[el.dataset.gelenk] || []).push(el);
    });
    const oberschenkelWerte = BEIN.oberschenkel.map(([, wert]) => wert);
    const armMitte = (Math.min(...oberschenkelWerte) + Math.max(...oberschenkelWerte)) / 2;
    const koerper = svg.querySelector('.laeufer-koerper');
    const arm = svg.querySelector('.lf-arm');
    const beine = svg.querySelector('.lf-beine');
    const signetBeine = svg.querySelector('.lf-beine-signet');

    // Hosenbeine biegen sich: Jeder Punkt dreht um die Hüfte seines Beins,
    // gewichtet nach seiner Lage zwischen Bundlinie (0, bleibt am Bund) und
    // Saum (1, liegt um den Oberschenkel), weich über smoothstep.
    const abstandZurLinie = ([x, y], linie) => {
      let naechster = Infinity;
      for (let i = 0; i < linie.length - 1; i++) {
        const [ax, ay] = linie[i], [bx, by] = linie[i + 1];
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
        naechster = Math.min(naechster, Math.hypot(x - ax - t * dx, y - ay - t * dy));
      }
      return naechster;
    };
    const gewicht = (punkt) => {
      const oben = abstandZurLinie(punkt, P.hose.bund);
      const unten = abstandZurLinie(punkt, P.hose.saum);
      return glatt(0, 1, oben / (oben + unten || 1));
    };
    // Lange gerade Kanten werden unterteilt, sonst bögen sie sich eckig.
    const unterteilen = (punkte, laenge) => punkte.flatMap((a, i) => {
      const b = punkte[(i + 1) % punkte.length];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / laenge));
      return Array.from({ length: n }, (_, k) => [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    });
    // Beide Hosenbeine haben die Form des vorderen Signet-Hosenbeins. Das
    // hintere ist wie das hintere Bein an die hintere Hüfte verschoben und
    // dreht, wie die Beinkette, gegenüber der Ruhe des vorderen Beins.
    const hosenform = unterteilen(P.hose.form, 6).map((punkt) => [punkt, gewicht(punkt)]);
    const hosenbeine = {
      hinten: svg.querySelector('.lf-hosenbein--hinten'),
      vorne: svg.querySelector('.lf-hosenbein--vorne')
    };

    function hoseSetzen(oberHinten, oberVorne) {
      [['hinten', oberHinten], ['vorne', oberVorne]].forEach(([seite, ober]) => {
        const drehung = ober * MITNAHME;
        hosenbeine[seite].setAttribute('d', 'M' + hosenform.map(([punkt, w]) => {
          const q = drehen(punkt, drehung * w, P.huefte);
          return q[0].toFixed(1) + ' ' + q[1].toFixed(1);
        }).join('L') + 'Z');
      });
    }
    const dreh = (winkel, [x, y]) => `rotate(${winkel.toFixed(2)} ${x} ${y})`;

    function kette(seite, [rO, rK, rF]) {
      const werte = { huefte: dreh(rO, P.huefte), knie: dreh(rK, P.knie), knoechel: dreh(rF, P.knoechel) };
      Object.keys(werte).forEach((name) => {
        gelenke[`${seite}-${name}`].forEach((el) => el.setAttribute('transform', werte[name]));
      });
    }

    let anteilZuletzt = -1;
    function setzen(phase, s) {
      const p = start + phase;
      const mischen = (ruhe, z) => ruhe.map((r, i) => r + (z[i] - r) * s);
      const anteil = +glatt(SIGNETBEINE[0], SIGNETBEINE[1], s).toFixed(3);
      if (anteil !== anteilZuletzt) {
        anteilZuletzt = anteil;
        beine.setAttribute('display', anteil > 0 ? 'inline' : 'none');
        beine.setAttribute('opacity', anteil);
        signetBeine.setAttribute('display', anteil < 1 ? 'inline' : 'none');
        signetBeine.setAttribute('opacity', 1 - anteil);
      }
      if (anteil > 0) {
        kette('vorne', mischen([0, 0, 0], ziel(p)));
        kette('hinten', mischen(ruheHinten, ziel(p + 0.5)));
        hoseSetzen(mischen(ruheHinten, ziel(p + 0.5 - NACHZIEHEN))[0], mischen([0, 0, 0], ziel(p - NACHZIEHEN))[0]);
      }
      arm.setAttribute('transform', dreh(-(kurven.oberschenkel(p) - armMitte) * ARM * s, P.schulter));
      koerper.setAttribute('transform', `translate(0 ${(hoehe(p) * s).toFixed(2)}) ${dreh(NEIGUNG * s, P.becken)}`);
    }
    setzen.schritt = doppelschritt / P.hoehe;   // Doppelschritt in Figurhöhen
    setzen.start = start;
    return setzen;
  }
  window.BWLauf = { laufen, kurven, BEIN };

  const hero = document.getElementById('hero');
  const faehre = document.getElementById('faehre-roesterei');
  const laeufer = document.getElementById('laeufer');
  const ufer = document.getElementById('ufer');
  if (!hero || !faehre || !laeufer || !window.BWFaehren ||
      !window.bwFaehre || !window.bwLaeufer || !window.bwUfer) return;

  const B = window.BWFaehren;
  const ruhig = window.BW && window.BW.wenigerBewegung;

  /* ------------------------------------------------------------------
     Zeichnen
     Das Ufer wird in echten Pixeln gezeichnet, damit die Steine bei jeder
     Breite ihre Form behalten. Bei einer neuen Breite also neu.
     ------------------------------------------------------------------ */
  faehre.innerHTML = bwFaehre({
    name: faehre.dataset.faehre,
    ladung: faehre.dataset.ladung,
    akzent: faehre.dataset.akzent
  });
  laeufer.innerHTML = bwLaeufer();

  let uferBreite = 0;
  const uferZeichnen = () => {
    if (!ufer || ufer.clientWidth === uferBreite) return;
    uferBreite = ufer.clientWidth;
    ufer.innerHTML = bwUfer(ufer.clientWidth, ufer.clientHeight);
  };
  uferZeichnen();
  window.addEventListener('resize', uferZeichnen);

  const gedanken = [
    B.gedankeAnhaengen(laeufer, 'links', laeufer.dataset.gedanke),
    B.gedankeAnhaengen(faehre, 'rechts', faehre.dataset.gedanke)
  ];

  /* ------------------------------------------------------------------
     Wege
     Der Läufer beginnt links am Rand und endet rechts, die Fähre umgekehrt.
     Gerechnet wird mit der Mitte, GSAP bewegt die linke Kante.
     ------------------------------------------------------------------ */
  const breite = () => hero.clientWidth;
  const RAND = 16;
  const faehreLaenge = () => faehre.offsetWidth / 1.2;

  const start = {
    laeufer: () => Math.max(laeufer.offsetWidth / 2 + RAND, breite() * 0.1),
    faehre: () => Math.min(breite() - faehreLaenge() / 2 - RAND, breite() * 0.86)
  };
  const ziel = {
    laeufer: () => Math.min(breite() - laeufer.offsetWidth / 2 - RAND, breite() * 0.9),
    faehre: () => Math.max(faehreLaenge() / 2 + RAND, breite() * 0.14)
  };

  if (ruhig) {
    gsap.set(gedanken, { autoAlpha: 0 });
    const setzen = () => {
      gsap.set(laeufer, { x: B.kante(laeufer, start.laeufer()) });
      gsap.set(faehre, { x: B.kante(faehre, start.faehre()) });
    };
    setzen();
    window.addEventListener('resize', setzen);
    return;
  }

  /* ------------------------------------------------------------------
     Die Fahrt, an den Scroll gebunden, wie auf der Startseite
     ------------------------------------------------------------------ */
  const fahrt = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'clamp(bottom bottom)',
      end: B.fahrtEnde(hero, gedanken),
      scrub: 0.8,
      invalidateOnRefresh: true
    }
  })
    .fromTo(laeufer,
      { x: () => B.kante(laeufer, start.laeufer()) },
      { x: () => B.kante(laeufer, ziel.laeufer()), duration: 1 }, 0)
    .fromTo(faehre,
      { x: () => B.kante(faehre, start.faehre()) },
      { x: () => B.kante(faehre, ziel.faehre()), duration: 1 }, 0)
    .to('.hero-text', { y: -110, duration: 0.2 }, 0);

  B.blasen(fahrt, gedanken, 0.2);
  B.schaukeln(faehre, 2.5, 0.6);
  B.kielwasser([faehre]);

  gsap.from([laeufer, faehre], {
    autoAlpha: 0, y: 26, duration: 1.3, delay: 0.7, stagger: 0.18, ease: 'bw-aus'
  });

  /* ------------------------------------------------------------------
     Laufschritt
     Die Phase hängt an der zurückgelegten Strecke. Wie lang ein
     Doppelschritt ist, rechnet laufen() aus der Bewegung (haltung.schritt,
     in Figurhöhen). Gesetzt wird das transform-Attribut direkt, mit den
     Drehpunkten aus dem Signet. Knie und Knöchel sitzen in der gedrehten
     Gruppe darüber, ihr Drehpunkt gilt deshalb im Koordinatensystem des
     übergeordneten Glieds.
     ------------------------------------------------------------------ */
  const P = window.bwLaeufer.punkte;
  const dreh = laeufer.querySelector('.laeufer-dreh');
  const haltung = laufen(laeufer.querySelector('svg'), P);

  const takt = gsap.utils.wrap(0, 1);
  const schrittlaenge = () => laeufer.offsetHeight * haltung.schritt;
  const gang = { staerke: 0 };
  const gangZu = gsap.quickTo(gang, 'staerke', { duration: 0.35, ease: 'power2.out' });
  const blick = { richtung: 1 };

  let strecke = 0;
  let zuletzt = gsap.getProperty(laeufer, 'x');
  let zuletztBewegt = 0;
  let laeuft = false;
  let richtung = 1;

  gsap.ticker.add(() => {
    const x = gsap.getProperty(laeufer, 'x');
    const weg = x - zuletzt;
    zuletzt = x;
    const jetzt = performance.now();

    if (Math.abs(weg) > 0.15) {
      strecke += Math.abs(weg);
      zuletztBewegt = jetzt;
      const neu = weg > 0 ? 1 : -1;
      if (neu !== richtung) {
        richtung = neu;
        gsap.to(blick, { richtung: neu, duration: 0.22, ease: 'power2.inOut', overwrite: true });
      }
    }

    // Steht er rund 0,2 s still, klingt der Schritt aus.
    const soll = jetzt - zuletztBewegt < 200;
    if (soll !== laeuft) {
      laeuft = soll;
      gangZu(soll ? 1 : 0);
    }

    haltung(takt(strecke / schrittlaenge()), gang.staerke);

    // Beim Zurücklaufen dreht er sich um. Gespiegelt wird um die Mitte der
    // viewBox, die Blase hängt ausserhalb des SVG und bleibt lesbar.
    const r = blick.richtung;
    dreh.setAttribute('transform', `translate(${(P.mitte * (1 - r)).toFixed(2)} 0) scale(${r.toFixed(3)} 1)`);
  });
})();
