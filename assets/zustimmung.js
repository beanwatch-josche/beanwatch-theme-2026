/* ==========================================================================
   Beanwatch · Zustimmung (Cookie-Hinweis «Coffee & Cookies»)
   Seit 10.10.2026. Zeigt #cookie-hinweis, solange keine Wahl getroffen ist,
   und gibt die Wahl weiter (Entscheid Joscha: Die Wahl gilt auch für Google):

   - an Shopify: customerPrivacy.setTrackingConsent({ analytics, marketing,
     preferences }), wie der Hinweis im alten Theme;
   - an den Google Tag Manager im Consent Mode: gtag('consent', 'update', …).
     Die Grundeinstellung «denied» setzt das Theme im <head>, bevor der Tag
     Manager lädt (snippets/bw-tagmanager.liquid);
   - als Spiegel in localStorage 'bw-zustimmung' ('alle' oder 'notwendig'),
     damit der <head> sie beim nächsten Laden sofort kennt, noch bevor die
     Schnittstelle von Shopify geladen ist.

   Wer schon im alten Theme gewählt hat, bekommt keinen Hinweis: Shopify
   kennt die Wahl, sie wird still übernommen.

   Im Prototyp gibt es weder Shopify noch gtag, dort zeigt und speichert das
   Skript nur.

   Aufruf: BWZustimmung.start()
   ========================================================================== */

(function (global) {
  'use strict';

  const SPIEGEL = 'bw-zustimmung';

  function lesen() {
    try { return global.localStorage.getItem(SPIEGEL); } catch (e) { return null; }
  }
  function merken(wert) {
    try { global.localStorage.setItem(SPIEGEL, wert); } catch (e) { /* privates Fenster */ }
  }

  // Google im Consent Mode. Ohne gtag (Prototyp) passiert nichts.
  function google(alle) {
    if (typeof global.gtag !== 'function') return;
    const wert = alle ? 'granted' : 'denied';
    global.gtag('consent', 'update', {
      analytics_storage: wert,
      ad_storage: wert,
      ad_user_data: wert,
      ad_personalization: wert
    });
  }

  // Die Schnittstelle von Shopify laden; ohne Shopify (Prototyp) nie.
  // sonst() läuft, wenn sie fehlt oder nicht lädt.
  function shopify(fertig, sonst) {
    const s = global.Shopify;
    if (!s || typeof s.loadFeatures !== 'function') { if (sonst) sonst(); return; }
    s.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (fehler) => {
      if (!fehler && s.customerPrivacy) fertig(s.customerPrivacy);
      else if (sonst) sonst();
    });
  }

  function start() {
    const hinweis = document.getElementById('cookie-hinweis');
    if (!hinweis) return;

    const zu = () => { hinweis.hidden = true; };

    function waehlen(alle) {
      merken(alle ? 'alle' : 'notwendig');
      google(alle);
      shopify((cp) => cp.setTrackingConsent({
        analytics: alle, marketing: alle, preferences: alle
      }, () => {}));
      zu();
    }

    hinweis.querySelectorAll('[data-zustimmung]').forEach((knopf) => {
      knopf.addEventListener('click', () => waehlen(knopf.dataset.zustimmung === 'alle'));
    });

    if (lesen()) return;               // schon gewählt, Hinweis bleibt zu

    // Hat der Besucher bei Shopify schon gewählt (altes Theme), übernehmen
    // wir das still. Sonst den Hinweis zeigen, ohne Shopify sofort. Der
    // Fokus springt nicht hin: Der Hinweis steht als Erstes im <body>, die
    // Tabulatortaste erreicht ihn also gleich.
    const zeigen = () => { hinweis.hidden = false; };
    shopify((cp) => {
      const stand = typeof cp.getTrackingConsent === 'function' ? cp.getTrackingConsent() : '';
      if (stand === 'yes' || stand === 'no') {
        merken(stand === 'yes' ? 'alle' : 'notwendig');
        google(stand === 'yes');
      } else {
        zeigen();
      }
    }, zeigen);
  }

  global.BWZustimmung = { start };
})(window);
