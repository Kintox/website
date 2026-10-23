/*!
 * Google Ads Conversion-Tracking - cedricnitsch.de
 * Stand: 14.09.2026
 *
 * EINBINDUNG in index.html, direkt VOR futtercheck.js:
 *   <script src="assets/js/conversions.js" defer></script>
 *
 * Danach sind KEINE weiteren Aenderungen noetig - weder am HTML noch an
 * futtercheck.js. Zu pflegen ist nur der Block LABELS weiter unten.
 *
 * Grundsatz dieser Datei: Tracking darf die Seite niemals kaputtmachen.
 * Jeder Link funktioniert weiter, auch wenn gtag fehlt, blockiert ist
 * oder ein Label noch nicht eingetragen wurde.
 */
(function () {
  'use strict';

  /* ==================================================================
   * 1. KONFIGURATION
   * ==================================================================
   * Das Label ist der Teil NACH dem Schraegstrich in "send_to":
   *
   *   send_to: 'AW-565697665/-708CNbdvfccEIG5340C'
   *             \___ AW_ID ___/\_____ Label _____/
   *
   * Fuer jede Conversion-Aktion in Google Ads gibt es ein eigenes Label.
   * Leer lassen = diese Conversion wird (noch) nicht gemeldet, der Link
   * funktioniert aber ganz normal weiter.
   */
  var AW_ID = 'AW-565697665';

  var LABELS = {
    kundenzugang: 'o1eRCM6_wPgcEIG5340C', // "Neukunde werden A"
    handbuch:     '0XF0CNG_wPgcEIG5340C', // "Handbuch angefordert A"
    whatsapp:     'hiHaCNS_wPgcEIG5340C', // "Klick auf WhatsApp A"
    futtercheck:  'o93iCNe_wPgcEIG5340C', // "Futtercheck abgeschlossen A"
    telefon:      '3qI7CP7hw_gcEIG5340C'  // "Klick auf Telefonnummer A"
  };

  /* Formular-Erfolgsmeldungen -> welche Conversion sie ausloesen.
   * futtercheck.js blendet diese Elemente erst ein, wenn der Versand an
   * Brevo tatsaechlich rausging. Genau dort - und nur dort - ist ein Lead
   * ein Lead. Die drei IDs bitte einmal im Quelltext gegenpruefen. */
  var SUCCESS_ELEMENTS = {
    hbSuccess: 'handbuch',
    kzSuccess: 'kundenzugang',
    fcResult:  'futtercheck'
  };

  /* Klassenname, den futtercheck.js zum Einblenden setzt. */
  var SUCCESS_CLASS = 'show';

  /* ---- Erweiterte Conversions (Enhanced Conversions) ----------------
   * futtercheck.js ruft form.reset() AUF, BEVOR die Erfolgsmeldung
   * eingeblendet wird. Zum Zeitpunkt der Conversion ist das Formular
   * also leer und ausgeblendet - Googles "automatische Erkennung"
   * durchsucht die Seite genau in diesem Moment und findet nichts.
   * Deshalb merken wir uns die E-Mail beim Tippen und uebergeben sie
   * bewusst und ausschliesslich diese.
   *
   * Auf false setzen, solange "Erweiterte Conversions" im Google-Ads-
   * Konto nicht aktiviert ist. */
  var SEND_USER_DATA = true;

  /* Nur E-Mail, bewusst keine Adresse: bestes Matching pro uebertragenem
   * Datenfeld, kleinste Datenschutz-Angriffsflaeche (Datenminimierung).
   * IDs bitte einmal im Quelltext gegenpruefen. */
  var EMAIL_FIELDS = {
    handbuch:     '#hb-email',
    kundenzugang: '#kz-email',
    futtercheck:  '#fc-email'
  };

  /* Link-Muster -> Conversion. Faengt automatisch ALLE passenden Links
   * ab, egal ob in Navigation, Hero oder schwebendem Button. */
  var LINK_RULES = [
    { test: /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i, name: 'whatsapp' },
    { test: /^tel:/i,                                    name: 'telefon'  }
  ];

  /* ==================================================================
   * 2. AUSLOESER - ab hier nichts mehr aendern
   * ================================================================== */

  var fired = {};   // jede Conversion hoechstens einmal pro Seitenaufruf
  var emails = {};  // zuletzt getippte E-Mail je Conversion, ueberlebt form.reset()

  /* Merkt sich Eingaben, solange sie noch im Feld stehen. Laeuft rein
   * lokal im Browser - hier wird nichts gesendet. */
  function rememberEmails() {
    Object.keys(EMAIL_FIELDS).forEach(function (name) {
      var field = document.querySelector(EMAIL_FIELDS[name]);
      if (!field) return;
      field.addEventListener('input', function () {
        var v = (field.value || '').trim();
        if (v.indexOf('@') > 0) emails[name] = v;
      });
    });
  }

  function report(name) {
    if (fired[name]) return;

    var label = LABELS[name];
    if (!label) return;                            // Label noch nicht gepflegt
    if (typeof window.gtag !== 'function') return; // Consent abgelehnt o. blockiert

    fired[name] = true;

    try {
      /* Erweiterte Conversions: gtag normalisiert und hasht die Adresse
       * per SHA-256 IM BROWSER, bevor sie Google erreicht. Google sieht
       * nie die Klartext-Adresse. Uebertragen wird nur, wenn das
       * Consent-Signal ad_user_data auf "granted" steht - darum kuemmert
       * sich das Consent-Banner. */
      if (SEND_USER_DATA && emails[name]) {
        window.gtag('set', 'user_data', { email: emails[name] });
      }

      window.gtag('event', 'conversion', {
        send_to: AW_ID + '/' + label,
        event_timeout: 1000
      });
    } catch (err) {
      fired[name] = false; // beim naechsten Mal erneut versuchen
    }
  }

  // oeffentlich, falls du sie irgendwo manuell aufrufen willst
  window.trackConversion = report;

  /* ---- 2a. Klicks auf WhatsApp- und Telefon-Links --------------------
   * Bewusst OHNE preventDefault: der Browser navigiert normal weiter,
   * gtag schickt den Ping per keepalive-Transport hinterher. Ein leicht
   * untererfasster Klick kostet Daten - ein blockierter WhatsApp-Button
   * kostet Leads. Das Risiko ist asymmetrisch, also optimieren wir gegen
   * den schlimmeren Fehler.
   */
  document.addEventListener('click', function (ev) {
    var el = ev.target;
    var link = (el && el.closest) ? el.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    for (var i = 0; i < LINK_RULES.length; i++) {
      if (LINK_RULES[i].test.test(href)) {
        report(LINK_RULES[i].name);
        return;
      }
    }
  }, true);

  /* ---- 2b. Formular-Erfolge ------------------------------------------
   * Beobachtet, wann futtercheck.js einer Erfolgsmeldung die Klasse
   * "show" gibt. Dadurch muss futtercheck.js nicht angefasst werden -
   * das getestete, funktionierende Formular bleibt unberuehrt.
   */
  function watchSuccessElements() {
    var ids = Object.keys(SUCCESS_ELEMENTS);

    ids.forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;

      // Falls beim Laden schon sichtbar (z. B. Zurueck-Navigation)
      if (node.classList.contains(SUCCESS_CLASS)) {
        report(SUCCESS_ELEMENTS[id]);
        return;
      }

      var obs = new MutationObserver(function () {
        if (node.classList.contains(SUCCESS_CLASS)) {
          report(SUCCESS_ELEMENTS[id]);
          obs.disconnect();
        }
      });

      obs.observe(node, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function init() {
    watchSuccessElements();
    if (SEND_USER_DATA) rememberEmails();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- 2c. Selbsttest -------------------------------------------------
   * In der Browser-Konsole  cnDebugConversions()  eingeben. Zeigt an,
   * was gefunden wurde und was noch fehlt.
   */
  window.cnDebugConversions = function () {
    var out = {
      gtag_geladen: typeof window.gtag === 'function',
      aw_id: AW_ID,
      erweiterte_conversions: SEND_USER_DATA ? 'an' : 'aus',
      labels_gepflegt: {},
      erfolgs_elemente_gefunden: {},
      email_felder_gefunden: {},
      bereits_gefeuert: Object.keys(fired)
    };
    Object.keys(LABELS).forEach(function (k) {
      out.labels_gepflegt[k] = LABELS[k] ? 'ja' : 'FEHLT';
    });
    Object.keys(SUCCESS_ELEMENTS).forEach(function (id) {
      out.erfolgs_elemente_gefunden[id] =
        document.getElementById(id) ? 'ja' : 'NICHT GEFUNDEN';
    });
    Object.keys(EMAIL_FIELDS).forEach(function (name) {
      out.email_felder_gefunden[name] =
        document.querySelector(EMAIL_FIELDS[name]) ? 'ja' : 'NICHT GEFUNDEN';
    });
    console.table(out.labels_gepflegt);
    console.table(out.erfolgs_elemente_gefunden);
    console.table(out.email_felder_gefunden);
    return out;
  };
})();
