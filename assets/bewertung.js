/* ==========================================================================
   Beanwatch · Rezept bewerten
   Nachgebaut nach dem Theme-Skript des bisherigen Shops, damit Stimmen und
   Durchschnitte zwischen alter und neuer Website dieselben sind.

     Datenbank      Supabase, Tabelle recipe_ratings mit article_slug,
                    article_id, rating und created_at. Gelesen und
                    geschrieben wird über die REST-Schnittstelle mit dem
                    öffentlichen Publishable Key, genau wie im Shop.
     Schlüssel      data-schluessel entspricht dem Metafeld
                    custom.recipe_rating_key am Artikel, nicht immer dem
                    Handle (Café Frappé heisst dort cafe-frappe).
     Doppelt        Wie im Shop nur im Browser verhindert, über localStorage
                    beanwatch_recipe_rating_<schlüssel>. Derselbe Name, damit
                    der Schutz nach dem Umzug weiter greift.
     Schema         Nach dem Laden wird der Schnitt ins Recipe-JSON-LD
                    geschrieben, wie es das Theme tut.
     Ohne Skript    Es steht der Schnitt aus den Daten da, gebaut von
                    werkzeug/rezepte-bauen.rb.
     Sprachen       Im Shopify-Theme stehen die Texte übersetzt an der Box:
                    data-text-keine, -danke, -schon, -lade-fehler,
                    -speicher-fehler, -ergebnis-eins und -ergebnis-mehr
                    ({schnitt} und {n} als Platzhalter), -dezimal. Fehlt
                    eines, gilt der deutsche Wortlaut wie bisher.
   ========================================================================== */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://tazpjdfnxmtcymbivlde.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fS-OR1jMa_9LkdWFBKtNdA_lyGs_eLl';
  const TABELLE = SUPABASE_URL + '/rest/v1/recipe_ratings';
  const KOPF = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };

  // Wortlaut wie im Theme des bisherigen Shops.
  const TEXT = {
    keine: 'Noch keine Bewertungen. Sei der Erste.',
    danke: 'Danke für Deine Bewertung.',
    schon: 'Danke, Du hast dieses Rezept bereits bewertet.',
    ladeFehler: 'Bewertung konnte nicht geladen werden.',
    speicherFehler: 'Bewertung konnte nicht gespeichert werden.'
  };

  const DEUTSCH = {
    ergebnisEins: '{schnitt} von 5 Sternen bei 1 Bewertung',
    ergebnisMehr: '{schnitt} von 5 Sternen bei {n} Bewertungen'
  };

  // Text aus data-text-* an der Box, sonst der deutsche.
  function texte(box) {
    const d = box.dataset;
    return {
      keine: d.textKeine || TEXT.keine,
      danke: d.textDanke || TEXT.danke,
      schon: d.textSchon || TEXT.schon,
      ladeFehler: d.textLadeFehler || TEXT.ladeFehler,
      speicherFehler: d.textSpeicherFehler || TEXT.speicherFehler,
      ergebnisEins: d.textErgebnisEins || DEUTSCH.ergebnisEins,
      ergebnisMehr: d.textErgebnisMehr || DEUTSCH.ergebnisMehr,
      dezimal: d.textDezimal || ','
    };
  }

  const komma = (zahl, dezimal = ',') => zahl.toFixed(1).replace('.', dezimal);
  const ergebnisText = (schnitt, anzahl, t) =>
    (anzahl === 1 ? t.ergebnisEins : t.ergebnisMehr)
      .replace('{schnitt}', komma(schnitt, t.dezimal))
      .replace('{n}', anzahl);

  function lesen(schluessel) {
    try { return localStorage.getItem(schluessel); } catch (e) { return null; }
  }
  function schreiben(schluessel, wert) {
    try { localStorage.setItem(schluessel, wert); } catch (e) { /* privat surfen */ }
  }

  function schemaNachfuehren(schnitt, anzahl) {
    document.querySelectorAll('script[type="application/ld+json"]').forEach((skript) => {
      try {
        const schema = JSON.parse(skript.textContent);
        if (!schema || schema['@type'] !== 'Recipe') return;
        if (anzahl) {
          schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Number(schnitt.toFixed(1)),
            ratingCount: anzahl,
            bestRating: '5',
            worstRating: '1'
          };
        } else {
          delete schema.aggregateRating;
        }
        skript.textContent = JSON.stringify(schema, null, 2);
      } catch (e) { /* fremdes JSON-LD bleibt unberührt */ }
    });
  }

  document.querySelectorAll('.rezept-bewertung').forEach((box) => {
    const schluessel = box.dataset.schluessel;
    if (!schluessel) return;

    const artikelId = box.dataset.artikelId || null;
    const t = texte(box);
    const knoepfe = Array.from(box.querySelectorAll('.bewertung-sterne button'));
    const ergebnis = box.querySelector('.bewertung-ergebnis');
    const speicher = 'beanwatch_recipe_rating_' + schluessel;
    const kurz = document.querySelectorAll('[data-bewertung-anzeige="kurz"]');
    const eckdaten = document.querySelectorAll('[data-bewertung-anzeige="eckdaten"]');

    let schnitt = parseFloat(box.dataset.schnitt) || 0;
    let anzahl = parseInt(box.dataset.anzahl, 10) || 0;
    let sendet = false;

    function malen(wert) {
      knoepfe.forEach((knopf) => {
        knopf.classList.toggle('ist-voll', Number(knopf.dataset.wert) <= wert);
      });
    }

    function anzeigen() {
      malen(Math.round(schnitt));
      ergebnis.textContent = anzahl ? ergebnisText(schnitt, anzahl, t) : t.keine;
      kurz.forEach((el) => { el.textContent = anzahl ? `★ ${komma(schnitt)} von 5` : '★ Jetzt bewerten'; });
      eckdaten.forEach((el) => { el.textContent = anzahl ? `★ ${komma(schnitt)} / 5` : 'Noch keine'; });
      const eigene = lesen(speicher);
      knoepfe.forEach((knopf) => {
        knopf.setAttribute('aria-pressed', String(eigene !== null && knopf.dataset.wert === eigene));
      });
    }

    async function laden() {
      try {
        const antwort = await fetch(
          `${TABELLE}?select=rating&article_slug=eq.${encodeURIComponent(schluessel)}`,
          { headers: KOPF }
        );
        if (!antwort.ok) throw new Error('HTTP ' + antwort.status);
        const daten = await antwort.json();
        anzahl = daten.length;
        schnitt = anzahl ? daten.reduce((summe, e) => summe + Number(e.rating), 0) / anzahl : 0;
        anzeigen();
        schemaNachfuehren(schnitt, anzahl);
      } catch (fehler) {
        console.warn('Bewertungen nicht geladen:', fehler);
        anzeigen();
        ergebnis.textContent = t.ladeFehler;
      }
    }

    async function abgeben(wert) {
      if (sendet) return;
      if (lesen(speicher)) {
        anzeigen();
        ergebnis.textContent = t.schon;
        return;
      }
      sendet = true;
      knoepfe.forEach((knopf) => { knopf.disabled = true; });
      try {
        const antwort = await fetch(TABELLE, {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, KOPF),
          body: JSON.stringify({ article_slug: schluessel, article_id: artikelId, rating: wert })
        });
        if (!antwort.ok) throw new Error('HTTP ' + antwort.status);
        schreiben(speicher, String(wert));
        await laden();
        ergebnis.textContent = t.danke;
      } catch (fehler) {
        console.warn('Bewertung nicht gespeichert:', fehler);
        anzeigen();
        ergebnis.textContent = t.speicherFehler;
      } finally {
        sendet = false;
        knoepfe.forEach((knopf) => { knopf.disabled = false; });
      }
    }

    knoepfe.forEach((knopf) => {
      const wert = Number(knopf.dataset.wert);
      knopf.addEventListener('mouseenter', () => malen(wert));
      knopf.addEventListener('focus', () => malen(wert));
      knopf.addEventListener('click', () => abgeben(wert));
    });
    const leiste = box.querySelector('.bewertung-sterne');
    leiste.addEventListener('mouseleave', () => malen(Math.round(schnitt)));
    leiste.addEventListener('focusout', (e) => {
      if (!leiste.contains(e.relatedTarget)) malen(Math.round(schnitt));
    });

    anzeigen();
    laden();
  });
})();
