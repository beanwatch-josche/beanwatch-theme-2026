/* ==========================================================================
   Beanwatch · Start-Modus
   Welche Inhalte beim Start der neuen Website auf Shopify sichtbar sind.
   Der Prototyp zeigt damit genau den Start-Umfang, ohne einen Link auf
   Ausgeblendetes. Entschieden am 05.10.2026, siehe MIGRATION-SHOPIFY.md.

   Der PLAN ist die einzige Stelle mit dem Veröffentlichungsstand. Er ist
   aufgebaut wie der Shopify-Admin: Blog, darin Artikel-Handles, je
   "sichtbar" oder "ausgeblendet".
     Blog nicht im PLAN   alles darin ist sichtbar (kaffeewissen,
                          kaffeerezepte, und alles ausserhalb von /blogs/)
     Blog im PLAN         sichtbar ist nur, was "sichtbar" steht; ein
                          fehlender Handle gilt als ausgeblendet. Genau so
                          liefert Liquid nur veröffentlichte Artikel.
   Einen Guide veröffentlichen heisst: seinen Wert auf "sichtbar" setzen.
   Alle Links, Karten und Sätze dazu kommen dann von selbst zurück.
   Zwischen den Marken steht reines JSON, werkzeug/links.rb liest es mit.

   Im HTML:
     data-nur-wenn="KEY"  nur zeigen, wenn KEY sichtbar ist   {% if %}
     data-sonst="KEY"     Ersatz, steht direkt nach seinem
                          data-nur-wenn mit demselben KEY      {% else %}
     data-geplant         Platzhalter, im Start nie sichtbar   (entfällt)
   KEY ist ein Blog ("brew-guides", sichtbar, sobald ein Artikel darin
   sichtbar ist) oder ein Artikel ("brew-guides/hario-v60").

   Entwurfsansicht: ?entwuerfe=1 zeigt alles wie vor dem Start-Modus und
   merkt sich das im Browser, ?entwuerfe=0 schaltet zurück. Eine
   ausgeblendete Seite, direkt aufgerufen, steht immer ganz da, mit Schild.

   Im Shopify-Theme (beanwatch-theme-2026) rendert Liquid den PLAN selbst,
   aus den tatsächlich veröffentlichten Artikeln, als window.BW_PLAN vor
   dieser Datei. Dann gilt nur er, und die Entwurfsansicht ist aus: Was in
   Shopify ausgeblendet ist, gibt es für Besucher schlicht nicht.

   Wird synchron im <head> geladen, direkt nach window.BW_SEITE. Das Stil-
   Element blendet aus, bevor der Body gezeichnet wird; shell.js entfernt
   die Elemente danach aus dem DOM, bevor basis.js und ScrollTrigger
   messen. Labor-Seiten und archiv.html laden die Datei bewusst nicht, alle
   Verbraucher zeigen dann alles.
   ========================================================================== */

window.BWStart = (function () {
  'use strict';

  const IM_THEME = !!window.BW_PLAN && typeof window.BW_PLAN === 'object';
  const PLAN = IM_THEME ? window.BW_PLAN : /*<plan>*/{
    "brew-guides": {
      "hario-v60": "ausgeblendet"
    },
    "barista-guides": {
      "einkreiser": "ausgeblendet",
      "zweikreiser": "ausgeblendet",
      "thermoblock": "ausgeblendet",
      "kaffeevollautomat": "ausgeblendet",
      "kapselmaschine": "ausgeblendet",
      "bialetti": "ausgeblendet"
    }
  }/*</plan>*/;

  /* --- Schlüssel --------------------------------------------------------- */

  // "/blogs/brew-guides/hario-v60.html#timer" wird "brew-guides/hario-v60".
  // Im Theme auch "/en/blogs/…" ohne .html. Pfade ausserhalb von /blogs/
  // geben null, sie gelten als sichtbar.
  function schluessel(pfad) {
    if (!pfad) return null;
    const p = String(pfad);
    if (p.charAt(0) !== '/') return p;
    const m = p.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/blogs\/([^\/?#]+)(?:\/([^\/?#]+?))?(?:\.html)?\/?(?:[?#].*)?$/i);
    if (!m) return null;
    return m[2] ? m[1] + '/' + m[2] : m[1];
  }

  function veroeffentlicht(key) {
    if (!key) return true;
    const teile = key.split('/');
    const blog = PLAN[teile[0]];
    if (!blog) return true;
    if (!teile[1]) return Object.keys(blog).some(h => blog[h] === 'sichtbar');
    return blog[teile[1]] === 'sichtbar';
  }

  /* --- Modus ------------------------------------------------------------- */

  let gemerkt = false;
  let parameter = null;
  if (!IM_THEME) try {
    const p = new URLSearchParams(location.search);
    if (p.has('entwuerfe')) {
      parameter = p.get('entwuerfe') !== '0';
      p.delete('entwuerfe');
      const rest = p.toString();
      history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
    }
  } catch (e) { /* alter Browser: ohne Parameter weiter */ }

  if (!IM_THEME) try {
    if (parameter === true) localStorage.setItem('bw-entwuerfe', '1');
    if (parameter === false) localStorage.removeItem('bw-entwuerfe');
    gemerkt = localStorage.getItem('bw-entwuerfe') === '1';
  } catch (e) { /* Speicher gesperrt, etwa im privaten Fenster */ }
  if (parameter !== null) gemerkt = parameter;

  const eigene = schluessel(location.pathname);
  const seiteAusgeblendet = !IM_THEME && !!eigene && !veroeffentlicht(eigene);
  const vorschau = gemerkt || seiteAusgeblendet;

  /* --- Öffentliche Prüfungen -------------------------------------------- */

  // Darf ein Ziel erscheinen? Nimmt einen Pfad oder einen Schlüssel.
  function zeigen(zielOderSchluessel) {
    return vorschau || veroeffentlicht(schluessel(zielOderSchluessel));
  }

  // Für Datenlisten (GUIDES, BEITRAEGE ...): Geplantes erscheint nur in der
  // Entwurfsansicht, alles andere, wenn sein Ziel sichtbar ist.
  function eintrag(e) {
    if (!e) return false;
    if (e.stand === 'geplant') return vorschau;
    return zeigen(e.datei || e.ziel || e.href);
  }

  /* --- Stil: ausblenden, bevor gezeichnet wird --------------------------- */

  const regeln = [];
  if (vorschau) {
    regeln.push('[data-sonst]{display:none!important}');
  } else {
    regeln.push('[data-geplant]{display:none!important}');
    Object.keys(PLAN).forEach(blog => {
      const keys = [blog].concat(Object.keys(PLAN[blog]).map(h => blog + '/' + h));
      keys.forEach(k => {
        const attr = veroeffentlicht(k) ? 'data-sonst' : 'data-nur-wenn';
        regeln.push('[' + attr + '="' + k + '"]{display:none!important}');
      });
    });
  }
  // Das Schild ist ein Werkzeug für den Prototyp, kein Designelement. Es
  // steht deshalb hier und nicht in seiten.css oder im CI-Guide.
  regeln.push(
    '.bw-schild{position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;gap:10px;align-items:center;' +
    'padding:8px 12px;border:1.5px solid #004B5C;border-radius:8px;background:#FFF3E8;color:#004B5C;' +
    'font:600 12px/1.3 Gabarito,system-ui,sans-serif;letter-spacing:.02em}' +
    '.bw-schild a{color:#004B5C;text-decoration:underline;font-weight:500}'
  );
  const stil = document.createElement('style');
  stil.id = 'bw-start';
  stil.textContent = regeln.join('\n');
  document.head.appendChild(stil);
  document.documentElement.classList.add(vorschau ? 'bw-entwuerfe' : 'bw-start');

  /* --- Anwenden: aus dem DOM entfernen ----------------------------------- */

  function unbekannt(key) {
    const blog = String(key).split('/')[0];
    if (!PLAN[blog] && window.console) {
      console.warn('Start-Modus: Schlüssel "' + key + '" gehört zu keinem Blog im PLAN und gilt als sichtbar.');
    }
  }

  function schild() {
    if (!vorschau || !document.body || document.getElementById('bw-schild')) return;
    const el = document.createElement('div');
    el.className = 'bw-schild';
    el.id = 'bw-schild';
    el.setAttribute('role', 'status');
    el.innerHTML = seiteAusgeblendet && !gemerkt
      ? 'Ausgeblendet · nicht im Start'
      : 'Entwurfsansicht <a href="?entwuerfe=0">Zur Startansicht</a>';
    document.body.appendChild(el);
  }

  function anwenden(root) {
    (root || document).querySelectorAll('[data-nur-wenn],[data-sonst],[data-geplant]').forEach(el => {
      let weg;
      if (el.hasAttribute('data-geplant')) {
        weg = !vorschau;
      } else if (el.hasAttribute('data-nur-wenn')) {
        const k = el.getAttribute('data-nur-wenn');
        unbekannt(k);
        weg = !zeigen(k);
      } else {
        const k = el.getAttribute('data-sonst');
        unbekannt(k);
        weg = zeigen(k);
      }
      if (weg) el.remove();
    });
    schild();
  }

  // Rückfall, falls eine Seite shell.js nicht lädt.
  document.addEventListener('DOMContentLoaded', () => anwenden(document));

  return { PLAN, IM_THEME, vorschau, schluessel, zeigen, eintrag, anwenden };
})();
