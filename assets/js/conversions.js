/*!
 * Google Ads Conversion-Tracking - cedricnitsch.de
 * Stand: 15.09.2026
 *
 * EINBINDUNG - nur in index.html, direkt vor futtercheck.js:
 *   <script src="assets/js/conversions.js" defer></script>
 *
 * NICHT in partner.html einbinden: Beide Seiten nutzen dieselbe WhatsApp-
 * und Telefonnummer. Dort wuerden Partner-Anfragen als Kunden-Leads gezaehlt.
 *
 * Grundsatz: Tracking darf die Seite niemals kaputtmachen. Jeder Link
 * funktioniert weiter, auch wenn gtag fehlt, blockiert ist oder ein Label
 * noch nicht eingetragen wurde.
 */
(function () {
  'use strict';

  var AW_ID = 'AW-565697665';

  var LABELS = {
    kundenzugang: 'o1eRCM6_wPgcEIG5340C', // "Neukunde werden A"
    handbuch:     '0XF0CNG_wPgcEIG5340C', // "Handbuch angefordert A"
    whatsapp:     'hiHaCNS_wPgcEIG5340C', // "Klick auf WhatsApp A"
    futtercheck:  'o93iCNe_wPgcEIG5340C', // "Futtercheck abgeschlossen A"
    telefon:      '3qI7CP7hw_gcEIG5340C'  // "Klick auf Telefonnummer A"
  };

  /* Erweiterte Conversions: auf false setzen, solange die Funktion im
   * Google-Ads-Konto nicht aktiviert und die Datenschutzerklaerung nicht
   * ergaenzt ist. */
  var SEND_USER_DATA = true;

  /* Nur die E-Mail wird uebergeben, keine Adresse: bestes Matching je
   * uebertragenem Feld, kleinste Datenschutzflaeche. fcEmail erzeugt
   * futtercheck.js erst zur Laufzeit - daher Event-Delegation. */
  var EMAIL_FIELDS = {
    'hb-email': 'handbuch',
    'kz-email': 'kundenzugang',
    'fcEmail':  'futtercheck'
  };

  var SUCCESS_ELEMENTS = { hbSuccess: 'handbuch', kzSuccess: 'kundenzugang' };
  var SUCCESS_CLASS = 'show';

  /* Futtercheck hat keine eigene Erfolgsmeldung. Ablauf:
   *   Absenden -> fcSubmitLead() -> bei Erfolg fcShowResult()
   * fcShowResult() ersetzt den Inhalt von #fcStepArea komplett.
   * Verschwindet #fcLeadForm, war der Versand erfolgreich. Bei einem
   * Fehler bleibt das Formular stehen. */
  var FC_AREA = 'fcStepArea';
  var FC_FORM = 'fcLeadForm';

  var LINK_RULES = [
    { test: /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i, name: 'whatsapp' },
    { test: /^tel:/i,                                    name: 'telefon'  }
  ];

  var fired  = {};
  var emails = {};

  function report(name) {
    if (fired[name]) return;
    var label = LABELS[name];
    if (!label) return;
    if (typeof window.gtag !== 'function') return;

    fired[name] = true;
    try {
      /* gtag normalisiert und hasht die Adresse per SHA-256 IM BROWSER.
       * Google sieht nie die Klartextadresse. Uebertragen wird nur, wenn
       * ad_user_data auf "granted" steht. */
      if (SEND_USER_DATA && emails[name]) {
        window.gtag('set', 'user_data', { email: emails[name] });
      }
      window.gtag('event', 'conversion', {
        send_to: AW_ID + '/' + label,
        event_timeout: 1000
      });
    } catch (err) {
      fired[name] = false;
    }
  }

  window.trackConversion = report;

  /* E-Mail merken - laeuft rein lokal im Browser, hier wird nichts gesendet. */
  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (!el || !el.id) return;
    var name = EMAIL_FIELDS[el.id];
    if (!name) return;
    var v = (el.value || '').trim();
    if (v.indexOf('@') > 0) emails[name] = v;
  }, true);

  /* Klicks auf WhatsApp und Telefon. Bewusst OHNE preventDefault: der
   * Browser navigiert normal weiter, gtag sendet per keepalive hinterher.
   * Ein untererfasster Klick kostet Daten - ein blockierter WhatsApp-Button
   * kostet Leads. */
  document.addEventListener('click', function (ev) {
    var el = ev.target;
    var link = (el && el.closest) ? el.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    for (var i = 0; i < LINK_RULES.length; i++) {
      if (LINK_RULES[i].test.test(href)) { report(LINK_RULES[i].name); return; }
    }
  }, true);

  function watchSuccessElements() {
    Object.keys(SUCCESS_ELEMENTS).forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      if (node.classList.contains(SUCCESS_CLASS)) { report(SUCCESS_ELEMENTS[id]); return; }
      var obs = new MutationObserver(function () {
        if (node.classList.contains(SUCCESS_CLASS)) {
          report(SUCCESS_ELEMENTS[id]);
          obs.disconnect();
        }
      });
      obs.observe(node, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function watchFuttercheck() {
    var area = document.getElementById(FC_AREA);
    if (!area) return;
    var formWasThere = false;
    var obs = new MutationObserver(function () {
      if (document.getElementById(FC_FORM)) { formWasThere = true; return; }
      if (formWasThere) { report('futtercheck'); obs.disconnect(); }
    });
    obs.observe(area, { childList: true, subtree: true });
  }

  function init() { watchSuccessElements(); watchFuttercheck(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Selbsttest: in der Browser-Konsole  cnDebugConversions()  eingeben. */
  window.cnDebugConversions = function () {
    var out = {
      gtag_geladen: typeof window.gtag === 'function',
      aw_id: AW_ID,
      erweiterte_conversions: SEND_USER_DATA ? 'an' : 'aus',
      bereits_gefeuert: Object.keys(fired)
    };
    var labels = {}, elems = {}, felder = {};
    Object.keys(LABELS).forEach(function (k) { labels[k] = LABELS[k] ? 'ja' : 'FEHLT'; });
    Object.keys(SUCCESS_ELEMENTS).forEach(function (id) {
      elems[id] = document.getElementById(id) ? 'ja' : 'NICHT GEFUNDEN';
    });
    elems[FC_AREA] = document.getElementById(FC_AREA) ? 'ja' : 'NICHT GEFUNDEN';
    Object.keys(EMAIL_FIELDS).forEach(function (id) {
      felder[id] = document.getElementById(id)
        ? 'ja' : (id === 'fcEmail' ? 'erst im Futtercheck sichtbar - ok' : 'NICHT GEFUNDEN');
    });
    console.table(labels); console.table(elems); console.table(felder);
    out.labels = labels; out.erfolgs_elemente = elems; out.email_felder = felder;
    return out;
  };
})();
