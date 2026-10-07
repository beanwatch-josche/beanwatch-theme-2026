/* ==========================================================================
   Beanwatch · Theme
   Was im Prototyp shell.js tat und nur im Shopify-Theme gebraucht wird:
   das Menü auf dem Handy, die Pfeile in Knöpfen mit data-pfeil und der
   Warenkorb über die Cart-API von Shopify (/cart.js, /cart/add.js,
   /cart/change.js). Gehört dem Theme, nicht der Werkstatt.

   Braucht window.BW_ROUTEN, BW_TEXTE und BW_WAEHRUNG aus
   snippets/bw-seitendaten.liquid. Läuft mit defer, das DOM steht also.
   ========================================================================== */

(function () {
  'use strict';

  const R = window.BW_ROUTEN || { warenkorb: '/cart', hinzufuegen: '/cart/add', aendern: '/cart/change' };
  const T = window.BW_TEXTE || {};

  /* --- Pfeile in Knöpfen ---------------------------------------------------- */
  const pfeil = `<svg class="pfeil" width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  function pfeileSetzen(wurzel) {
    (wurzel || document).querySelectorAll('[data-pfeil]:not([data-pfeil-gesetzt])').forEach((el) => {
      el.insertAdjacentHTML('beforeend', pfeil);
      el.setAttribute('data-pfeil-gesetzt', '');
    });
  }
  pfeileSetzen();

  /* --- Menü auf dem Handy, wie in shell.js ----------------------------------- */
  const knopf = document.getElementById('menue-knopf');
  const menue = document.getElementById('mobilmenue');
  if (knopf && menue) {
    knopf.addEventListener('click', () => {
      const offen = !menue.hidden;
      menue.hidden = offen;
      knopf.setAttribute('aria-expanded', String(!offen));
      document.body.style.overflow = offen ? '' : 'hidden';
    });
    menue.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      menue.hidden = true;
      knopf.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  /* --- Warenkorb ------------------------------------------------------------ */
  const schublade = document.getElementById('bw-warenkorb');
  const inhalt = document.getElementById('bw-warenkorb-inhalt');
  const fuss = document.getElementById('bw-warenkorb-fuss');
  const summe = document.getElementById('bw-warenkorb-summe');
  const notiz = document.getElementById('bw-warenkorb-notiz');
  const aufWarenkorbseite = document.body.querySelector('.bw-warenkorb-form') !== null;
  let zuvor = null;

  const sprache = (document.documentElement.lang || 'de').slice(0, 2);
  const geld = new Intl.NumberFormat(sprache + '-CH', { style: 'currency', currency: window.BW_WAEHRUNG || 'CHF' });
  const betrag = (rappen) => geld.format(rappen / 100);
  const sicher = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z]));

  async function anfrage(url, daten) {
    const antwort = await fetch(url, daten ? {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(daten)
    } : { headers: { Accept: 'application/json' } });
    if (!antwort.ok) throw new Error((await antwort.json().catch(() => ({}))).description || antwort.status);
    return antwort.json();
  }

  function zahlSetzen(anzahl) {
    document.querySelectorAll('[data-bw-warenkorb-zahl]').forEach((el) => {
      el.textContent = anzahl;
      el.hidden = anzahl === 0;
    });
  }

  function bildUrl(url) {
    if (!url) return '';
    return url + (url.indexOf('?') < 0 ? '?' : '&') + 'width=160';
  }

  function zeichnen(korb) {
    zahlSetzen(korb.item_count);
    if (!inhalt) return;
    if (!korb.item_count) {
      inhalt.innerHTML = `<p class="bw-leer">${sicher(T.leer)}</p>
        <a class="btn btn--linie" href="${sicher(R.alle || R.start || '/')}">${sicher(T.weiter_einkaufen)}</a>`;
      if (fuss) fuss.hidden = true;
      return;
    }
    inhalt.innerHTML = `<ul class="bw-zeilen">${korb.items.map((z) => `
      <li class="bw-zeile" data-schluessel="${sicher(z.key)}">
        ${z.image ? `<a class="bw-zeile-bild" href="${sicher(z.url)}"><img src="${sicher(bildUrl(z.image))}" alt="" loading="lazy"></a>` : ''}
        <div class="bw-zeile-text">
          <a class="bw-zeile-titel" href="${sicher(z.url)}">${sicher(z.product_title)}</a>
          ${z.product_has_only_default_variant ? '' : `<span class="bw-zeile-variante">${sicher(z.variant_title)}</span>`}
          ${z.selling_plan_allocation ? `<span class="bw-zeile-variante">${sicher(z.selling_plan_allocation.selling_plan.name)}</span>` : ''}
          <button type="button" class="bw-zeile-weg" data-menge="0">${sicher(T.entfernen)}</button>
        </div>
        <div class="bw-menge" role="group" aria-label="${sicher(T.anzahl)}">
          <button type="button" data-menge="${z.quantity - 1}" aria-label="${sicher(T.weniger)}">−</button>
          <span>${z.quantity}</span>
          <button type="button" data-menge="${z.quantity + 1}" aria-label="${sicher(T.mehr)}">+</button>
        </div>
        <span class="bw-preis">${betrag(z.final_line_price)}</span>
      </li>`).join('')}</ul>`;
    if (summe) summe.textContent = betrag(korb.total_price);
    if (notiz && document.activeElement !== notiz) notiz.value = korb.note || '';
    if (fuss) fuss.hidden = false;
    pfeileSetzen(schublade);
  }

  function fehler(e) {
    if (inhalt) inhalt.insertAdjacentHTML('afterbegin', `<p class="bw-fehler" role="alert">${sicher(T.fehler)}</p>`);
    if (window.console) console.warn('Warenkorb:', e);
  }

  async function laden() {
    try { zeichnen(await anfrage(R.warenkorb + '.js')); } catch (e) { fehler(e); }
  }

  function oeffnen() {
    if (!schublade) return null;
    zuvor = document.activeElement;
    schublade.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => schublade.classList.add('ist-offen'));
    const panel = schublade.querySelector('.bw-schublade-panel');
    if (panel) panel.focus();
    return laden();
  }

  function schliessen() {
    if (!schublade || schublade.hidden) return;
    schublade.classList.remove('ist-offen');
    document.body.style.overflow = '';
    setTimeout(() => { schublade.hidden = true; }, 280);
    if (zuvor && zuvor.focus) zuvor.focus();
  }

  // Öffnen über den Warenkorb im Kopf. Auf der Warenkorbseite selbst nicht.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-bw-warenkorb-oeffnen]');
    if (!link || aufWarenkorbseite || !schublade) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    oeffnen();
  });

  if (schublade) {
    schublade.addEventListener('click', async (e) => {
      if (e.target.closest('[data-bw-zu]')) { schliessen(); return; }
      const mengenKnopf = e.target.closest('[data-menge]');
      if (!mengenKnopf) return;
      const zeile = mengenKnopf.closest('[data-schluessel]');
      mengenKnopf.disabled = true;
      try {
        zeichnen(await anfrage(R.aendern + '.js', {
          id: zeile.getAttribute('data-schluessel'),
          quantity: Math.max(0, Number(mengenKnopf.getAttribute('data-menge')))
        }));
      } catch (err) { fehler(err); mengenKnopf.disabled = false; }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') schliessen(); });
  }

  // Notiz zur Bestellung: kurz nach dem Tippen speichern (/cart/update.js),
  // beim Verlassen des Felds sofort. Beim Bezahlen geht sie ohnehin mit.
  if (notiz) {
    let warten = null;
    const speichern = () => {
      clearTimeout(warten);
      anfrage((R.notiz || '/cart/update') + '.js', { note: notiz.value }).catch(fehler);
    };
    notiz.addEventListener('input', () => { clearTimeout(warten); warten = setTimeout(speichern, 600); });
    notiz.addEventListener('change', speichern);
  }

  // «In den Warenkorb»: jedes Formular, das auf /cart/add zeigt.
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || !/\/cart\/add(\?|$)/.test(form.getAttribute('action') || '')) return;
    if (!schublade) return;
    e.preventDefault();
    const knopf = form.querySelector('[type="submit"]');
    if (knopf) knopf.disabled = true;
    try {
      const antwort = await fetch(R.hinzufuegen + '.js', {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      });
      if (!antwort.ok) throw new Error((await antwort.json().catch(() => ({}))).description || antwort.status);
      oeffnen();
    } catch (err) {
      const geladen = oeffnen();
      if (geladen) geladen.then(() => fehler(err));
    } finally {
      if (knopf) knopf.disabled = false;
    }
  });

  // Andere Skripte können die Schublade öffnen: document.dispatchEvent(new Event('bw:warenkorb'))
  document.addEventListener('bw:warenkorb', oeffnen);
})();
