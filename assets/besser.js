/* ==========================================================================
   Beanwatch · Kaffee besser machen (Startseite)
   Brew Guides haben kein Foto. Wie auf der Wissensseite (karte() in wissen.js)
   steht an seiner Stelle die Illustration des Geräts, gezeichnet von
   bwGeraet() aus illustrationen.js. Barista Guides tragen seit 30.09.2026
   ein Foto im Markup. Der Zweig für [data-maschine] bleibt für den Fall,
   dass eine Karte ohne Foto dazukommt.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('.besser-bild[data-geraet]').forEach((el) => {
    if (window.bwGeraet) el.insertAdjacentHTML('beforeend', bwGeraet(el.dataset.geraet));
  });
  document.querySelectorAll('.besser-bild[data-maschine]').forEach((el) => {
    if (window.bwMaschine) el.insertAdjacentHTML('beforeend', bwMaschine(el.dataset.maschine));
  });
})();
