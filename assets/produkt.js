/* ==========================================================================
   Beanwatch · Produktseite
   Galerie, Geschmacksnoten, Kaufwahl (einmal oder im Abo), Mahlgradwahl
   (nur noch im Kaffeefinder) und die beiden Meter für Röstgrad und
   Geschmacksprofil.
   ========================================================================== */

window.BWProdukt = (function () {
  'use strict';

  const ruhig = window.BW && window.BW.wenigerBewegung;

  /* ------------------------------------------------------------------
     Galerie
     ------------------------------------------------------------------ */
  function galerie() {
    const haupt = document.getElementById('galerie-bild');
    const mini = document.getElementById('galerie-mini');
    if (!haupt || !mini) return;

    mini.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf || knopf.classList.contains('ist-aktiv')) return;

      mini.querySelectorAll('button').forEach(b => b.classList.toggle('ist-aktiv', b === knopf));

      const neu = knopf.dataset.bild;
      if (ruhig) { haupt.src = neu; return; }

      // Weich überblenden statt hart tauschen.
      gsap.to(haupt, {
        opacity: 0, scale: 1.04, duration: 0.22, ease: 'power2.in',
        onComplete: () => {
          haupt.src = neu;
          gsap.fromTo(haupt,
            { opacity: 0, scale: 1.04 },
            { opacity: 1, scale: 1, duration: 0.45, ease: 'bw-aus' });
        }
      });
    });

    if (ruhig) return;
    gsap.from('.galerie-haupt', { opacity: 0, scale: 0.94, duration: 1, ease: 'bw-aus' });
    gsap.from('.galerie-mini button', { opacity: 0, y: 18, duration: 0.7, stagger: 0.07, delay: 0.3 });
  }

  /* ------------------------------------------------------------------
     Geschmacksnoten
     Die Namen stehen im data-Attribut, die Icons kommen aus illustrationen.js.
     ------------------------------------------------------------------ */
  function noten() {
    const reihe = document.getElementById('notenreihe');
    if (!reihe || !window.bwNote) return;

    const liste = (reihe.dataset.noten || '').split(',').map(s => s.trim()).filter(Boolean);
    reihe.innerHTML = liste.map(n =>
      `<span class="note">${bwNote(n)}<span>${n}</span></span>`).join('');

    if (ruhig) return;
    gsap.from(reihe.children, {
      opacity: 0, scale: 0.5, y: 14,
      duration: 0.7, stagger: 0.09, delay: 0.5, ease: 'back.out(2)'
    });

    // Beim Überfahren hüpft das Zeichen kurz.
    reihe.querySelectorAll('.note').forEach((note) => {
      note.addEventListener('mouseenter', () => {
        gsap.fromTo(note.querySelector('.note-icon'),
          { y: 0 },
          { y: -7, duration: 0.28, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true });
      });
    });
  }

  /* ------------------------------------------------------------------
     Mahlgradwahl
     ------------------------------------------------------------------ */
  function mahlgrad() {
    const gruppe = document.getElementById('mahlgrad');
    if (!gruppe) return;

    gruppe.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf) return;
      gruppe.querySelectorAll('button').forEach(b => b.classList.toggle('ist-aktiv', b === knopf));
      if (!ruhig) {
        gsap.fromTo(knopf, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: 'back.out(2.4)' });
      }
    });
  }

  /* ------------------------------------------------------------------
     Kaufwahl: einmal kaufen oder im Abo (seit 06.10.2026)
     Die gewählte Karte wird hervorgehoben, das Intervall erscheint nur
     beim Abo, und die Preiszeile zeigt Preis und Grundpreis der Wahl. Im Theme steht
     im Formular ein Feld selling_plan; dorthin kommt die Plan-ID aus dem
     Intervall. Bei «Einmal» bleibt es leer und gesperrt, damit es nicht
     mitgeschickt wird. Im Prototyp fehlt das Feld.
     ------------------------------------------------------------------ */
  function kaufwahl() {
    const box = document.getElementById('kaufwahl');
    if (!box) return;
    const form = box.closest('form');
    const planFeld = form && form.querySelector('input[name="selling_plan"]');
    const intervall = box.querySelector('.kaufwahl-intervall');
    const auswahl = intervall && intervall.querySelector('select');
    const preis = document.querySelector('[data-kaufwahl-preis]');
    const grundpreis = document.querySelector('[data-kaufwahl-grundpreis]');

    const setzen = () => {
      const gewaehlt = box.querySelector('input[name="kaufart"]:checked');
      const option = gewaehlt && gewaehlt.closest('.kaufwahl-option');
      const abo = !!gewaehlt && gewaehlt.value === 'abo';
      box.querySelectorAll('.kaufwahl-option').forEach((o) => o.classList.toggle('ist-aktiv', o === option));
      if (intervall) intervall.hidden = !abo;
      if (planFeld) {
        planFeld.value = abo && auswahl ? auswahl.value : '';
        planFeld.disabled = !planFeld.value;
      }
      const p = option && option.querySelector('.kaufwahl-preis');
      if (preis && p) preis.textContent = p.textContent;
      if (grundpreis && option && option.dataset.grundpreis) grundpreis.textContent = option.dataset.grundpreis;
    };

    box.addEventListener('change', setzen);
    setzen();
  }

  /* ------------------------------------------------------------------
     Meter für Röstgrad und Profil
     Die Stufen füllen sich nacheinander, sobald die Karte sichtbar wird.
     ------------------------------------------------------------------ */
  function meter() {
    gsap.utils.toArray('[data-meter]').forEach((m) => {
      const wert = parseInt(m.dataset.meter, 10);
      const stufen = gsap.utils.toArray('i', m);

      if (ruhig) {
        stufen.forEach((s, i) => { if (i < wert) s.classList.add('ist-voll'); });
        return;
      }

      gsap.set(stufen, { scaleX: 1 });

      ScrollTrigger.create({
        trigger: m,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          stufen.forEach((s, i) => {
            if (i >= wert) return;
            gsap.fromTo(s,
              { scaleX: 0 },
              {
                scaleX: 1, duration: 0.5, delay: i * 0.12, ease: 'bw-aus',
                onStart: () => s.classList.add('ist-voll')
              });
          });
        }
      });
    });
  }

  function start() {
    galerie();
    noten();
    mahlgrad();
    kaufwahl();
    meter();
  }

  return { start, galerie, noten, mahlgrad, kaufwahl, meter };
})();
