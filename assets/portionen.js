/* ==========================================================================
   Beanwatch · Portionen umrechnen
   Nachgebaut nach dem Portionsrechner im Theme des bisherigen Shops. Dort
   stehen die Daten im Metaobjekt recipe_base (Basisportionen, Einheit in
   Einzahl und Mehrzahl) und je Zutat im Metaobjekt step_ingredient (Menge
   als Zahl, Einheit, skalierbar ja oder nein).

     Rechnung    Menge × aktuelle Portionen / Basisportionen. Ganze Zahlen
                 bleiben ganz, sonst höchstens zwei Stellen mit Komma.
     Fest        Zutaten mit data-fest rechnen nicht mit, Zeilen ohne Zahl
                 bleiben ohnehin stehen.
     Grenze      Weniger als eine Portion geht nicht.
     Hinweis     Weicht die Anzahl vom Original ab, steht darunter, wofür
                 das Rezept geschrieben wurde.
     Ohne Skript Die Knöpfe bleiben verborgen, es steht die Basisportion da.
     Sprachen    Im Shopify-Theme stehen die Titel übersetzt im Block:
                 data-text-titel-eins (ganzer Titel für eine Portion) und
                 data-text-titel-mehr ({n} für die Anzahl). Fehlen sie, gilt
                 der deutsche Wortlaut wie bisher.
   ========================================================================== */

(function () {
  'use strict';

  function zahlText(wert) {
    if (Number.isInteger(wert)) return String(wert);
    return String(Math.round(wert * 100) / 100).replace('.', ',');
  }

  document.querySelectorAll('[data-portionen]').forEach((block) => {
    const basis = parseInt(block.dataset.basis, 10) || 1;
    const einzahl = block.dataset.einheit || '';
    const mehrzahl = block.dataset.einheitMehrzahl || einzahl;
    const artikel = block.dataset.artikel || 'ein';
    const titelEins = block.dataset.textTitelEins || `Zutaten für ${artikel} ${einzahl}`;
    const titelMehr = block.dataset.textTitelMehr || `Zutaten für {n} ${mehrzahl}`;

    const titel = block.querySelector('.zutaten-kopf h3');
    const knoepfe = block.querySelector('.portionen');
    const weniger = block.querySelector('[data-schritt="-1"]');
    const mehr = block.querySelector('[data-schritt="1"]');
    const hinweis = block.querySelector('.portionen-hinweis');
    const zahlen = Array.from(block.querySelectorAll('.zahl[data-basis]'));
    if (!titel || !knoepfe || !weniger || !mehr) return;

    let aktuell = basis;
    knoepfe.hidden = false;

    function zeichnen() {
      const faktor = aktuell / basis;
      zahlen.forEach((el) => {
        if (el.hasAttribute('data-fest')) return;
        el.textContent = zahlText(parseFloat(el.dataset.basis) * faktor);
      });
      titel.textContent = aktuell === 1 ? titelEins : titelMehr.replace('{n}', aktuell);
      weniger.disabled = aktuell <= 1;
      if (hinweis) hinweis.hidden = aktuell === basis;
    }

    weniger.addEventListener('click', () => {
      if (aktuell > 1) { aktuell -= 1; zeichnen(); }
    });
    mehr.addEventListener('click', () => {
      aktuell += 1;
      zeichnen();
    });

    zeichnen();
  });
})();
