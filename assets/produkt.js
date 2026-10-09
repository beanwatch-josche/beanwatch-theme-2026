/* ==========================================================================
   Beanwatch · Produktseite
   Galerie, Geschmacksnoten, Kaufwahl (einmal oder im Abo), Mahlgradwahl
   (nur noch im Kaffeefinder), die Zusammenstellung des Probiersets und die
   beiden Meter für Röstgrad und Geschmacksprofil.
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
     Zusammenstellung des Probiersets (seit 08.10.2026)
     Die Wahl sind Radio-Knöpfe in #set-wahl; im Theme heissen sie name="id"
     und stehen im Produktformular, damit sie auch ohne Skript gelten. Beim
     Wechsel tauscht die Funktion die drei Beutel, die Herkunftszeile, den
     Satz, Preis und Zusatz, die Liste «Drin steckt» und den Knopf (bei
     ausverkauft gesperrt) und schreibt die Adresse der Wahl. Alles kommt
     aus dem Datenblock #bw-set; ohne ihn tut sie nichts. ?set=filter wählt
     vor (im Theme wählt Shopify über ?variant= schon im HTML vor).
     ------------------------------------------------------------------ */
  function zusammenstellung() {
    const wahl = document.getElementById('set-wahl');
    const block = document.getElementById('bw-set');
    if (!wahl || !block) return;
    let daten;
    try { daten = JSON.parse(block.textContent); } catch (e) { return; }
    const varianten = daten.varianten || [];
    const texte = daten.texte || {};
    if (!varianten.length) return;

    const beutel = Array.from(document.querySelectorAll('#set-bild .set-beutel'));
    const herkunft = document.getElementById('set-herkunft');
    const satz = document.getElementById('set-satz');
    const liste = document.getElementById('set-liste');
    const preis = document.querySelector('[data-set-preis]');
    const zusatz = document.querySelector('[data-set-zusatz]');
    const knopf = document.querySelector('[data-set-knopf]');
    const PFEIL = '<svg class="pfeil" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    const finden = (wert) => varianten.find((v) => String(v.id) === String(wert));
    const sicher = (t) => String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Ohne Adresse (der Apas im Prototyp) ist die Karte kein Link.
    const karte = (k) => {
      const innen = `<img src="${sicher(k.bild_klein)}" alt="" loading="lazy">` +
        `<span class="text"><span class="rolle">${sicher(k.herkunft)}</span><h4>${sicher(k.name)}</h4>` +
        (k.noten ? `<span class="noten-kurz">${sicher(k.noten)}</span>` : '') + '</span>';
      return k.url
        ? `<a class="schwester" href="${sicher(k.url)}">${innen}<span class="hin">${sicher(texte.ansehen || 'Ansehen')} ${PFEIL}</span></a>`
        : `<div class="schwester">${innen}</div>`;
    };

    // Nur der Text des Knopfs wechselt, der Pfeil daneben bleibt.
    const knopfText = (t) => {
      if (!knopf) return;
      const knoten = Array.from(knopf.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
      if (knoten) knoten.textContent = knoten.textContent.replace(knoten.textContent.trim(), t);
    };

    function einsetzen(v) {
      const kaffees = v.kaffees || [];
      beutel.forEach((b, i) => {
        const k = kaffees[i];
        b.hidden = !k;
        if (k) { b.src = k.bild; b.alt = k.name; }
      });
      if (herkunft && v.herkunft) herkunft.textContent = v.herkunft;
      if (satz) satz.textContent = v.satz || '';
      if (preis) preis.textContent = v.preis;
      if (zusatz) zusatz.textContent = v.zusatz || '';
      if (liste) liste.innerHTML = kaffees.map(karte).join('');
      if (knopf) {
        const frei = v.verfuegbar !== false;
        if ('disabled' in knopf) knopf.disabled = !frei;
        knopf.setAttribute('aria-disabled', frei ? 'false' : 'true');
        knopfText(frei ? (texte.in_den_warenkorb || 'In den Warenkorb') : (texte.ausverkauft || 'Ausverkauft'));
      }
    }

    function zeigen(v) {
      if (ruhig) { einsetzen(v); return; }
      gsap.timeline()
        .to(beutel, { scale: 0.7, autoAlpha: 0, duration: 0.25, stagger: 0.05, ease: 'power2.in' })
        .to([satz, liste, herkunft].filter(Boolean), { autoAlpha: 0, duration: 0.2 }, 0)
        .call(() => einsetzen(v))
        .to(beutel, { scale: 1, autoAlpha: 1, duration: 0.55, stagger: 0.08, ease: 'back.out(1.7)' })
        .to([satz, liste, herkunft].filter(Boolean), { autoAlpha: 1, duration: 0.35 }, '<');
    }

    wahl.addEventListener('change', (e) => {
      const v = finden(e.target.value);
      if (!v) return;
      zeigen(v);
      if (v.url) history.replaceState(null, '', v.url);
      if (!ruhig) {
        const chip = e.target.nextElementSibling;
        if (chip) gsap.fromTo(chip, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: 'back.out(2.4)' });
      }
    });

    const gewuenscht = new URLSearchParams(window.location.search).get('set');
    const vorwahl = gewuenscht && varianten.find((v) => v.set === gewuenscht);
    const feld = vorwahl && Array.from(wahl.querySelectorAll('input')).find((i) => String(i.value) === String(vorwahl.id));
    if (feld && !feld.checked) { feld.checked = true; einsetzen(vorwahl); }

    if (!ruhig) {
      gsap.from(beutel, { scale: 0.6, autoAlpha: 0, duration: 0.9, stagger: 0.12, delay: 0.2, ease: 'back.out(1.6)' });
    }
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

  /* ------------------------------------------------------------------
     Fotos der Anlässe (Vernissagen auf der Buchseite, seit 09.10.2026)
     Antippen öffnet das Foto gross in einem <dialog>. Pfeile, Pfeiltasten
     und Wischen blättern innerhalb desselben Anlasses, Escape oder ein
     Klick neben das Foto schliesst, danach steht der Fokus wieder auf dem
     Foto im Raster. Im Theme kommen die Wörter aus data-text-* an
     .anlaesse, ohne sie spricht der Dialog deutsch.
     ------------------------------------------------------------------ */
  function fotos() {
    const bereich = document.querySelector('.anlaesse');
    if (!bereich || !bereich.querySelector('.anlass-bild')) return;

    const text = (name, rueckfall) => bereich.dataset['text' + name] || rueckfall;
    const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

    let dialog, bild, beschrieb, zaehler;
    let liste = [];
    let nr = 0;
    let ausloeser = null;

    function bauen() {
      dialog = document.createElement('dialog');
      dialog.className = 'foto-dialog';
      dialog.setAttribute('aria-label', text('Dialog', 'Foto'));
      dialog.innerHTML =
        '<figure><img alt=""><figcaption><span class="foto-beschrieb"></span>' +
        '<span class="foto-zaehler"></span></figcaption></figure>' +
        `<button type="button" class="foto-knopf foto-zurueck">${svg('M19 12H5M11 6l-6 6 6 6')}</button>` +
        `<button type="button" class="foto-knopf foto-weiter">${svg('M5 12h14M13 6l6 6-6 6')}</button>` +
        `<button type="button" class="foto-knopf foto-zu">${svg('M6 6l12 12M18 6 6 18')}</button>`;
      // Beschriftungen als Attribut gesetzt, nicht ins HTML geschrieben:
      // Übersetzungen dürfen Anführungszeichen enthalten.
      dialog.querySelector('.foto-zurueck').setAttribute('aria-label', text('Zurueck', 'Vorheriges Foto'));
      dialog.querySelector('.foto-weiter').setAttribute('aria-label', text('Weiter', 'Nächstes Foto'));
      dialog.querySelector('.foto-zu').setAttribute('aria-label', text('Schliessen', 'Schliessen'));
      // Beim Öffnen steht der Fokus auf «Schliessen», auch mit nur einem Foto.
      dialog.querySelector('.foto-zu').autofocus = true;
      document.body.appendChild(dialog);

      bild = dialog.querySelector('img');
      beschrieb = dialog.querySelector('.foto-beschrieb');
      zaehler = dialog.querySelector('.foto-zaehler');

      dialog.querySelector('.foto-zurueck').addEventListener('click', () => zeigen(nr - 1));
      dialog.querySelector('.foto-weiter').addEventListener('click', () => zeigen(nr + 1));
      dialog.querySelector('.foto-zu').addEventListener('click', () => dialog.close());

      // Ein Klick neben das Foto schliesst, einer aufs Foto nicht.
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog || e.target.tagName === 'FIGURE') dialog.close();
      });
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); zeigen(nr - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); zeigen(nr + 1); }
      });

      // Wischen am Handy: ab 50 px waagrecht blättern.
      let startX = null;
      dialog.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
      dialog.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) zeigen(nr + (dx < 0 ? 1 : -1));
      });

      dialog.addEventListener('close', () => {
        document.body.style.overflow = '';
        if (ausloeser) ausloeser.focus({ preventScroll: true });
      });
    }

    function zeigen(i) {
      nr = (i + liste.length) % liste.length;
      const knopf = liste[nr];
      const vorschau = knopf.querySelector('img');
      bild.src = knopf.dataset.gross || vorschau.currentSrc || vorschau.src;
      bild.alt = vorschau.alt || '';
      beschrieb.textContent = vorschau.alt || '';
      zaehler.textContent = `${nr + 1} / ${liste.length}`;
      if (!ruhig) gsap.fromTo(bild, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
    }

    bereich.addEventListener('click', (e) => {
      const knopf = e.target.closest('.anlass-bild');
      if (!knopf) return;
      if (!dialog) bauen();
      liste = Array.from(knopf.parentElement.querySelectorAll('.anlass-bild'));
      ausloeser = knopf;
      dialog.dataset.anzahl = liste.length;
      zeigen(liste.indexOf(knopf));
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  }

  function start() {
    galerie();
    noten();
    mahlgrad();
    kaufwahl();
    zusammenstellung();
    meter();
    fotos();
  }

  return { start, galerie, noten, mahlgrad, kaufwahl, zusammenstellung, meter, fotos };
})();
