(function(){
// ============================================================
  // FUTTERCHECK -- interaktiver Kurz-Check mit Score & personalisierter
  // WhatsApp-Uebergabe. Angelehnt an das bewaehrte Futtercheck-Konzept,
  // ohne Blur-Teaser-Mechanik und ohne separate Vertriebspartner-Werbebox
  // (Frage 10 bleibt im Flow, ihr Ergebnis fliesst nur in die interne
  // Anfrage-Notiz, nicht in eine Werbeflaeche fuer Kunden).
  // ============================================================
  const WA_NUMBER = "4915678516818";

  // ============================================================
  // BREVO-ANBINDUNG
  // ------------------------------------------------------------
  // Am Ende von index.html liegt ein verstecktes Formular mit den
  // Brevo-Feldnamen. Es wird hier befuellt und per form.submit()
  // in ein verstecktes iframe geschickt. Brevo antwortet mit
  // {"success":true} und verschickt die Double-Opt-in-Mail.
  //
  // Kein API-Key im Quelltext, kein Fremdskript, kein Fremd-CSS.
  //
  // Feldnamen = Kontakt-Attribute in Brevo:
  //   EMAIL, VORNAME, HUND_KATZE, TIERNAME, FUTTERCHECK_SCORE,
  //   FUTTERCHECK_FARB_SCORE, FUTTERCHECK_FUTTER, PARTNER_INTERESSE,
  //   SMS, SMS__COUNTRY_CODE, email_address_check, locale
  // ============================================================

  // Uebersetzt die internen Futter-Werte in lesbaren Text fuer Brevo
  const FC_FUTTER_LABELS = {
    premiumnass:     'Hochwertiges Nassfutter',
    barf:            'BARF / Rohfuetterung',
    selbstgekocht:   'Selbstgekocht',
    premiumtrocken:  'Trockenfutter (Premium)',
    standardtrocken: 'Trockenfutter (Standard)',
    misch:           'Mischfuetterung (Nass + Trocken)',
    unsicher:        'Unsicher / wechselt oft'
  };

  // Quiz-Antwort auf die Partnerfrage -> Brevo-Wert
  const FC_PARTNER_MAP = {
    ja_interesse: 'Stark',
    vielleicht:   'Leicht',
    nein:         'Kunde'
  };

  // Uebergibt einen Datensatz an Brevo.
  //
  // Bewusst form.submit() und nicht submitBtn.click():
  //   * click() loest zuerst die HTML5-Validierung aus. Bei einem
  //     ausgeblendeten Formular bricht Chrome dann mit
  //     "not focusable" ab und sendet gar nichts - genau daran ist
  //     die vorherige Fassung gescheitert.
  //   * form.submit() ueberspringt die Validierung und postet direkt.
  // Das Ziel ist ein verstecktes iframe, damit die Seite stehen
  // bleibt und der Besucher sein Ergebnis sieht.
  // Erzeugt fuer jedes Absenden ein frisches, eigenes Ziel-iframe statt immer
  // dasselbe "brevo_sink" wiederzuverwenden.
  //
  // Grund: Alle drei Formulare (Futtercheck, Handbuch, Kundenzugang) teilen
  // sich ein gemeinsames iframe-Ziel. Wenn zwei Formulare kurz hintereinander
  // abgeschickt werden (z.B. beim Testen), startet die zweite Navigation im
  // selben iframe, waehrend die erste Anfrage noch unterwegs ist - der
  // Browser bricht die erste dann einfach ab, ohne Fehler, ohne Konsolen-
  // Meldung. Genau das erklaert ein "kommt manchmal an, manchmal nicht".
  // Mit einem eigenen iframe pro Absenden kann sich das nicht mehr
  // gegenseitig ins Gehege kommen.
  function brevoNeuesZielIframe(){
    const name = 'brevo_sink_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
    const iframe = document.createElement('iframe');
    iframe.name = name;
    iframe.title = 'Brevo-Uebermittlung';
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    document.body.appendChild(iframe);
    // Nach 20s wieder entfernen, genug Zeit fuer eine langsame Verbindung.
    setTimeout(function(){
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 20000);
    return name;
  }

  function brevoSubmit(data){
    const form = document.getElementById('brevoForm');
    if (!form) {
      console.error('[Brevo] Formular #brevoForm fehlt auf dieser Seite.');
      return false;
    }
    form.target = brevoNeuesZielIframe();

    const werte = {
      EMAIL:                  data.email,
      VORNAME:                data.vorname,
      HUND_KATZE:             data.tierart,
      TIERNAME:               data.tiername,
      FUTTERCHECK_SCORE:      data.score,
      FUTTERCHECK_FARB_SCORE: data.farbe,
      FUTTERCHECK_FUTTER:     data.futter,
      PARTNER_INTERESSE:      data.interesse,
      SMS:                    data.telefon,
      SMS__COUNTRY_CODE:      '+49',
      email_address_check:    '',
      // Zusaetzliches, sauberes Quell-Attribut (futtercheck / handbuch /
      // kundenzugang). Existiert das Brevo-Attribut QUELLE noch nicht, wird
      // dieses Feld von Brevo einfach ignoriert - das Absenden bleibt davon
      // unberuehrt (getestet: unbekannte/leere Felder liefern weiterhin
      // {"success":true}). Sobald QUELLE in Brevo angelegt ist, greift die
      // Segmentierung automatisch, ganz ohne Code-Aenderung.
      QUELLE:                 data.quelle || ''
    };

    Object.keys(werte).forEach(function(name){
      let feld = form.querySelector('[name="' + name + '"]');
      if (!feld) {
        // Feld (noch) nicht im Formular vorhanden - z.B. QUELLE, solange das
        // Attribut in Brevo nicht angelegt ist. Wird dynamisch ergaenzt,
        // damit es automatisch mitgesendet wird, sobald Brevo das Attribut
        // kennt; schadet nicht, falls nicht.
        feld = document.createElement('input');
        feld.type = 'hidden';
        feld.name = name;
        form.appendChild(feld);
      }
      feld.value = werte[name] == null ? '' : String(werte[name]);
    });

    try {
      form.submit();
      return true;
    } catch (err) {
      console.error('[Brevo] Absenden fehlgeschlagen:', err);
      return false;
    }
  }

  function fcValidEmail(value){
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test((value || "").trim());
  }

  // Echte Telefonnummer-Pruefung statt "irgendwas eingetragen":
  // Leerzeichen/Bindestriche/Schraegstriche/Klammern werden entfernt, danach
  // muss ein optionales fuehrendes + und 6-15 Ziffern uebrig bleiben. Das
  // laesst "0176 12345678", "+49 176 12345678" oder "0170-1234567" durch,
  // blockiert aber "1" oder "ASDF".
  function fcValidPhone(value){
    const bereinigt = (value || '').trim().replace(/[\s\-\/()]/g, '');
    return /^\+?[0-9]{6,15}$/.test(bereinigt);
  }

  const FC_GEWICHT_HUND = [
    { v:'klein', l:'🐕 Klein (bis 10 kg)', pts:10 },
    { v:'mittel', l:'🐕 Mittel (10–25 kg)', pts:10 },
    { v:'gross', l:'🐕 Groß (25–40 kg)', pts:10 },
    { v:'sehrgross', l:'🐕 Sehr groß (über 40 kg)', pts:5 },
  ];
  const FC_GEWICHT_KATZE = [
    { v:'normal', l:'😺 Normalgewichtig', pts:10 },
    { v:'leichtueber', l:'😸 Etwas zu schwer', pts:5 },
    { v:'deutlichueber', l:'🐱 Deutlich übergewichtig', pts:0 },
    { v:'unter', l:'🐱 Untergewichtig', pts:0 },
  ];

  const FC_QUESTIONS = [
    { id:'tierart', type:'choice',
      title: 'Welches Tier möchtest du checken?',
      options: [ {v:'hund', l:'🐕 Hund'}, {v:'katze', l:'🐱 Katze'} ] },
    { id:'tiername', type:'text',
      title: a => `Wie heißt dein ${a.tierart === 'katze' ? 'Katze' : 'Hund'}?`,
      placeholder: 'Name deines Tieres' },
    { id:'alter', type:'choice',
      title: a => `Wie alt ist ${a.tiername || 'dein Tier'}?`,
      options: [
        {v:'welpe', l:'👶 Welpe / Kitten (unter 1 Jahr)', pts:10},
        {v:'jung', l:'🐾 Jung (1–3 Jahre)', pts:10},
        {v:'erwachsen', l:'💪 Erwachsen (4–7 Jahre)', pts:10},
        {v:'senior', l:'👴 Senior (8+ Jahre)', pts:5},
      ] },
    { id:'groesse', type:'choice',
      title: a => `Wie groß / schwer ist ${a.tiername || 'dein Tier'}?`,
      options: a => a.tierart === 'katze' ? FC_GEWICHT_KATZE : FC_GEWICHT_HUND },
    { id:'aktivitaet', type:'choice',
      title: a => `Wie aktiv ist ${a.tiername || 'dein Tier'}?`,
      options: [
        {v:'sehraktiv', l:'🏃 Sehr aktiv (viel Bewegung/Sport)', pts:10},
        {v:'normal', l:'🚶 Normal aktiv', pts:10},
        {v:'ruhig', l:'🛋️ Eher ruhig / wenig Bewegung', pts:5},
        {v:'kaum', l:'😴 Kaum Bewegung', pts:0},
      ] },
    { id:'futter', type:'choice',
      title: a => `Was fütterst du ${a.tiername || 'dein Tier'} hauptsächlich?`,
      options: [
        {v:'premiumnass', l:'🥩 Hochwertiges Nassfutter (hoher Fleischanteil)', pts:15},
        {v:'barf', l:'🦴 BARF / Rohfütterung', pts:12},
        {v:'selbstgekocht', l:'🍳 Selbstgekocht', pts:10},
        {v:'premiumtrocken', l:'🏷️ Trockenfutter (Premium, getreidefrei)', pts:8},
        {v:'misch', l:'🔄 Mischfütterung (Nass + Trocken)', pts:6},
        {v:'standardtrocken', l:'🛒 Trockenfutter (Standard / Supermarkt)', pts:3},
        {v:'unsicher', l:'❓ Ich bin unsicher / wechsle oft', pts:2},
      ] },
    { id:'symptome', type:'multi',
      title: a => `Zeigt ${a.tiername || 'dein Tier'} eines dieser Anzeichen?`,
      hint: 'Mehrfachauswahl möglich.',
      exclusive: 'keine',
      options: [
        {v:'keine', l:'✅ Keine – alles prima!'},
        {v:'juckreiz', l:'🐾 Juckreiz / häufiges Kratzen'},
        {v:'stumpfesfell', l:'🪮 Stumpfes / schuppiges Fell'},
        {v:'verdauung', l:'💩 Verdauungsprobleme'},
        {v:'mundgeruch', l:'😮‍💨 Mundgeruch'},
        {v:'uebergewicht', l:'⚖️ Übergewicht'},
        {v:'energielos', l:'😴 Energielosigkeit'},
        {v:'haut', l:'🩹 Hautprobleme'},
        {v:'ohren', l:'👂 Ohrenprobleme'},
        {v:'allergie', l:'🤧 Allergien'},
      ] },
    { id:'allergien', type:'choice',
      title: a => `Hat ${a.tiername || 'dein Tier'} bekannte Allergien?`,
      options: [
        {v:'nein', l:'✅ Nein, keine bekannt', pts:10},
        {v:'imgriff', l:'⚠️ Ja, aber wir haben es im Griff', pts:5},
        {v:'problem', l:'❌ Ja, und es ist ein Problem', pts:0},
        {v:'unsicher', l:'🤷 Ich bin mir nicht sicher', pts:3},
      ] },
    { id:'leckerlis', type:'choice',
      title: a => `Wie oft bekommt ${a.tiername || 'dein Tier'} Leckerlis oder Tischreste?`,
      options: [
        {v:'selten', l:'🥕 Selten / gesunde Leckerlis', pts:10},
        {v:'gelegentlich', l:'🍖 Gelegentlich Leckerlis', pts:7},
        {v:'taeglich', l:'🍬 Täglich mehrere Leckerlis', pts:3},
        {v:'tischreste', l:'🍕 Regelmäßig Tischreste', pts:0},
      ] },
    { id:'zufriedenheit', type:'choice',
      title: 'Wie zufrieden bist du aktuell mit der Ernährung?',
      options: [
        {v:'sehr', l:'😊 Sehr zufrieden – alles top', pts:10},
        {v:'okay', l:'😐 Ganz okay, aber unsicher', pts:5},
        {v:'nicht', l:'😕 Nicht wirklich zufrieden', pts:2},
        {v:'suche', l:'😟 Unzufrieden – suche bessere Lösung', pts:0},
      ] },
    { id:'partner', type:'choice',
      title: 'Noch eine letzte Frage, bevor wir auswerten: Viele unserer Kunden empfehlen Reico weiter – und verdienen dabei.',
      hint: 'Würde dich das auch interessieren?',
      options: [
        {v:'ja_interesse', l:'💡 Ja, klingt spannend – ich möchte mehr erfahren'},
        {v:'vielleicht', l:'🤔 Vielleicht – zeigt mir erstmal das Ergebnis'},
        {v:'nein', l:'🐾 Nein danke, nur für mein eigenes Tier'},
      ] },
    { id:'vorname', type:'text',
      title: 'Wie heißt du? Damit ich dein Ergebnis persönlich gestalten kann.',
      placeholder: 'Dein Vorname' },
    { id:'lead', type:'lead' },
  ];

  const FC_MAX_RAW = 85;
  const fcState = { step: 0, answers: {} };
  const fcStepArea = document.getElementById('fcStepArea');
  if (!fcStepArea) return;
  const fcProgressBar = document.getElementById('fcProgressBar');
  const fcProgressLabel = document.getElementById('fcProgressLabel');
  const fcProgressPct = document.getElementById('fcProgressPct');
  const FC_TOTAL = FC_QUESTIONS.length;
  // Der letzte Schritt ist das Kontaktformular, keine Frage.
  // Die Anzeige zaehlt deshalb nur die echten Fragen - sonst steht
  // ueber dem Formular "Frage 13 von 13", was schlicht nicht stimmt.
  const FC_FRAGEN = FC_QUESTIONS.filter(function(q){ return q.type !== 'lead'; }).length;

  function fcResolve(val, answers){
    return typeof val === 'function' ? val(answers) : val;
  }

  function fcUpdateProgress(){
    const isLead = FC_QUESTIONS[fcState.step] && FC_QUESTIONS[fcState.step].type === 'lead';
    const current = Math.min(fcState.step + 1, FC_FRAGEN);
    const pct = Math.round((fcState.step / FC_TOTAL) * 100);
    fcProgressBar.style.width = pct + '%';
    fcProgressLabel.textContent = isLead
      ? 'Alle ' + FC_FRAGEN + ' Fragen beantwortet'
      : 'Frage ' + current + ' von ' + FC_FRAGEN;
    fcProgressPct.textContent = pct + '%';
  }

  function fcGoTo(stepIndex){
    fcState.step = stepIndex;
    fcRenderStep();
  }

  function fcNext(){
    if (fcState.step < FC_QUESTIONS.length - 1) {
      fcGoTo(fcState.step + 1);
    } else {
      fcShowResult();
    }
  }

  function fcBack(){
    if (fcState.step > 0) fcGoTo(fcState.step - 1);
  }

  function fcRenderStep(){
    const q = FC_QUESTIONS[fcState.step];
    fcProgressWrap_show();
    fcUpdateProgress();

    if (q.type === 'lead') { fcRenderLead(q); return; }

    const title = fcResolve(q.title, fcState.answers);
    let html = '<div class="fc-step"><h2>' + title + '</h2>';

    if (q.hint) html += '<p class="fc-hint">' + q.hint + '</p>';

    if (q.type === 'choice') {
      const opts = fcResolve(q.options, fcState.answers);
      html += '<div class="fc-choice-grid">';
      opts.forEach(function(opt){
        const selected = fcState.answers[q.id] === opt.v ? ' selected' : '';
        html += '<button type="button" class="fc-choice' + selected + '" data-value="' + opt.v + '">' + opt.l + '</button>';
      });
      html += '</div>';
      html += '<div class="fc-nav">' + (fcState.step > 0 ? '<button type="button" class="fc-back" id="fcBackBtn">← Zurück</button>' : '<span></span>') + '</div>';
    }

    if (q.type === 'multi') {
      const opts = fcResolve(q.options, fcState.answers);
      const current = fcState.answers[q.id] || [];
      html += '<div class="fc-choice-grid">';
      opts.forEach(function(opt){
        const selected = current.indexOf(opt.v) !== -1 ? ' selected' : '';
        html += '<button type="button" class="fc-choice' + selected + '" data-value="' + opt.v + '">' + opt.l + '</button>';
      });
      html += '</div>';
      html += '<div class="fc-nav">' +
        (fcState.step > 0 ? '<button type="button" class="fc-back" id="fcBackBtn">← Zurück</button>' : '<span></span>') +
        '<button type="button" class="btn btn-primary fc-next" id="fcNextBtn">Weiter →</button>' +
        '</div>';
    }

    if (q.type === 'text') {
      const val = fcState.answers[q.id] || '';
      html += '<input type="text" class="fc-text-input" id="fcTextInput" placeholder="' + q.placeholder + '" value="' + val.replace(/"/g,'&quot;') + '">';
      html += '<div class="fc-nav">' +
        (fcState.step > 0 ? '<button type="button" class="fc-back" id="fcBackBtn">← Zurück</button>' : '<span></span>') +
        '<button type="button" class="btn btn-primary fc-next" id="fcNextBtn">Weiter →</button>' +
        '</div>';
    }

    html += '</div>';
    fcStepArea.innerHTML = html;
    fcBindStep(q);
  }

  function fcProgressWrap_show(){
    document.getElementById('fcProgressWrap').style.display = 'block';
  }

  function fcBindStep(q){
    const backBtn = document.getElementById('fcBackBtn');
    if (backBtn) backBtn.addEventListener('click', fcBack);

    if (q.type === 'choice') {
      document.querySelectorAll('.fc-choice').forEach(function(btn){
        btn.addEventListener('click', function(){
          fcState.answers[q.id] = btn.getAttribute('data-value');
          fcNext();
        });
      });
    }

    if (q.type === 'multi') {
      const nextBtn = document.getElementById('fcNextBtn');
      document.querySelectorAll('.fc-choice').forEach(function(btn){
        btn.addEventListener('click', function(){
          const val = btn.getAttribute('data-value');
          let current = fcState.answers[q.id] || [];
          if (q.exclusive && val === q.exclusive) {
            current = current.indexOf(val) !== -1 ? [] : [val];
          } else {
            current = current.filter(function(v){ return v !== q.exclusive; });
            const idx = current.indexOf(val);
            if (idx === -1) current.push(val); else current.splice(idx, 1);
          }
          fcState.answers[q.id] = current;
          fcRenderStep();
        });
      });
      if (nextBtn) nextBtn.addEventListener('click', fcNext);
    }

    if (q.type === 'text') {
      const input = document.getElementById('fcTextInput');
      const nextBtn = document.getElementById('fcNextBtn');
      input.addEventListener('input', function(){ fcState.answers[q.id] = input.value; });
      input.focus();
      input.addEventListener('keydown', function(e){ if (e.key === 'Enter') fcNext(); });
      if (nextBtn) nextBtn.addEventListener('click', fcNext);
    }
  }

  function fcRenderLead(q){
    let html = '<div class="fc-step">' +
      '<h2>Fast geschafft \u2013 wohin darf ich dein Ergebnis schicken?</h2>' +
      '<p class="lead" style="margin-bottom:22px;">Deine Auswertung und eine erste pers\u00f6nliche Einsch\u00e4tzung schicke ich dir per E-Mail. Ohne E-Mail-Adresse kann ich dir das Ergebnis leider nicht zeigen.</p>' +
      '<form id="fcLeadForm" novalidate>' +
      '<div class="fc-lead-fields two">' +
      '<div><label for="fcEmail">E-Mail-Adresse *</label><input type="email" class="fc-text-input" id="fcEmail" autocomplete="email" required></div>' +
      '<div><label for="fcTelefon">Telefon / WhatsApp *</label><input type="tel" class="fc-text-input" id="fcTelefon" autocomplete="tel" required></div>' +
      '</div>' +
      '<div class="checkbox-row"><input type="checkbox" id="fcDsgvo" required><label for="fcDsgvo">Ja, ich m\u00f6chte mein Ergebnis per E-Mail erhalten und bin mit der Verarbeitung meiner Daten zu diesem Zweck einverstanden. Die Einwilligung kann ich jederzeit widerrufen. Mehr dazu in der <a href=\'datenschutz.html\' target=\'_blank\' style=\'color:var(--chloro-dunkel);text-decoration:underline;\'>Datenschutzerkl\u00e4rung</a>. *</label></div>' +
      '<div class="form-error" id="fcLeadError"></div>' +
      '<div class="fc-nav"><button type="button" class="fc-back" id="fcBackBtn">\u2190 Zur\u00fcck</button>' +
      '<button type="submit" class="btn btn-primary fc-next">Ergebnis anzeigen \u2192</button></div>' +
      '</form></div>';
    fcStepArea.innerHTML = html;
    document.getElementById('fcBackBtn').addEventListener('click', fcBack);

    const errEl = document.getElementById('fcLeadError');
    function showErr(msg){
      errEl.textContent = msg;
      errEl.classList.add('show');
    }

    document.getElementById('fcLeadForm').addEventListener('submit', function(e){
      e.preventDefault();
      errEl.classList.remove('show');

      const email = document.getElementById('fcEmail').value.trim();
      const tel = document.getElementById('fcTelefon').value.trim();
      const dsgvo = document.getElementById('fcDsgvo').checked;

      if (!fcValidEmail(email)) {
        showErr('Bitte gib eine g\u00fcltige E-Mail-Adresse ein \u2013 dorthin schicke ich dir die Auswertung.');
        document.getElementById('fcEmail').focus();
        return;
      }
      if (!fcValidPhone(tel)) {
        showErr('Bitte gib eine g\u00fcltige Telefonnummer ein (mindestens 6 Ziffern), damit ich dich bei R\u00fcckfragen erreichen kann.');
        document.getElementById('fcTelefon').focus();
        return;
      }
      if (!dsgvo) {
        showErr('Bitte best\u00e4tige noch kurz, dass ich dir das Ergebnis schicken darf.');
        return;
      }

      fcState.answers.email = email;
      fcState.answers.telefon = tel;
      fcSubmitLead();
      fcShowResult();
    });
  }

  function fcSubmitLead(){
    const a = fcState.answers;
    const score = fcComputeScore();

    return brevoSubmit({
      email:     a.email || '',
      vorname:   a.vorname || '',
      tierart:   a.tierart === 'katze' ? 'katze' : 'hund',
      tiername:  a.tiername || '-',
      score:     String(score.final),
      farbe:     fcFarbScore(score.final),
      futter:    FC_FUTTER_LABELS[a.futter] || a.futter || '-',
      interesse: FC_PARTNER_MAP[a.partner] || 'Kunde',
      telefon:   a.telefon || '',
      quelle:    'futtercheck'
    });
  }

  // Brevo erwartet in FUTTERCHECK_FARB_SCORE gruen / gelb / rot
  function fcFarbScore(score){
    if (score >= 75) return 'gruen';
    if (score >= 40) return 'gelb';
    return 'rot';
  }

  function fcProfileLabel(score){
    if (score >= 75) return 'Gute Basis';
    if (score >= 40) return 'Verbesserungspotenzial';
    return 'Handlungsbedarf';
  }

  function fcComputeScore(){
    const a = fcState.answers;
    let raw = 0;

    const altersPts = { welpe:10, jung:10, erwachsen:10, senior:5 };
    raw += altersPts[a.alter] || 0;

    const groesseOpts = a.tierart === 'katze' ? FC_GEWICHT_KATZE : FC_GEWICHT_HUND;
    const groesseOpt = groesseOpts.find(function(o){ return o.v === a.groesse; });
    raw += groesseOpt ? groesseOpt.pts : 0;

    const aktivPts = { sehraktiv:10, normal:10, ruhig:5, kaum:0 };
    raw += aktivPts[a.aktivitaet] || 0;

    const futterPts = { premiumnass:15, barf:12, selbstgekocht:10, premiumtrocken:8, misch:6, standardtrocken:3, unsicher:2 };
    raw += futterPts[a.futter] || 0;

    const symptome = a.symptome || [];
    let symptomScore = 10;
    if (!(symptome.length === 1 && symptome[0] === 'keine') && symptome.length > 0) {
      symptomScore = Math.max(0, 10 - symptome.length * 6);
    }
    raw += symptomScore;

    const allergiePts = { nein:10, imgriff:5, problem:0, unsicher:3 };
    raw += allergiePts[a.allergien] || 0;

    const leckerliPts = { selten:10, gelegentlich:7, taeglich:3, tischreste:0 };
    raw += leckerliPts[a.leckerlis] || 0;

    const zufriedenPts = { sehr:10, okay:5, nicht:2, suche:0 };
    raw += zufriedenPts[a.zufriedenheit] || 0;

    const normalized = Math.round((raw / FC_MAX_RAW) * 100);
    return { raw: raw, final: Math.min(100, Math.max(0, normalized)) };
  }

  const FC_THEMEN_LABEL = {
    juckreiz: 'Juckreiz', stumpfesfell: 'Fell & Haut', verdauung: 'Verdauung', mundgeruch: 'Mundgeruch',
    uebergewicht: 'Gewicht', energielos: 'Energielevel', haut: 'Hautbild', ohren: 'Ohren', allergie: 'Allergien'
  };

  function fcShowResult(){
    const a = fcState.answers;
    const score = fcComputeScore();
    const tiername = a.tiername || 'dein Tier';
    const vorname = a.vorname || '';

    let profile, badgeClass, headline, teaser;
    if (score.final >= 75) {
      profile = fcProfileLabel(score.final); badgeClass = 'good';
      headline = (vorname ? vorname + ', d' : 'D') + 'as sieht schon richtig gut aus 🎉';
      teaser = 'Die Grundlage für ' + tiername + ' passt bereits gut. Ein kurzer Check mit mir zeigt dir, wo sich noch Feinschliff lohnt.';
    } else if (score.final >= 40) {
      profile = fcProfileLabel(score.final); badgeClass = 'mid';
      headline = (vorname ? vorname + ', bei' : 'Bei') + ' ' + tiername + ' geht sicher noch etwas mehr ⚡';
      teaser = 'Ein paar Stellschrauben könnten die Fütterung von ' + tiername + ' spürbar verbessern. Lass uns gemeinsam draufschauen.';
    } else {
      profile = fcProfileLabel(score.final); badgeClass = 'low';
      headline = (vorname ? vorname + ', f' : 'F') + 'ür ' + tiername + ' lohnt sich ein genauerer Blick 🚨';
      teaser = 'Dein Ergebnis zeigt deutlichen Handlungsbedarf. Wichtig: Das ist keine Diagnose – nur eine erste Einordnung. Lass uns persönlich draufschauen.';
    }

    const symptome = (a.symptome || []).filter(function(s){ return s !== 'keine'; });
    const symptomeLabels = symptome.map(function(s){ return FC_THEMEN_LABEL[s] || s; });

    document.documentElement.style.setProperty('--fc-score', score.final);
    const scoreColor = badgeClass === 'good' ? 'var(--chloro-hell)' : (badgeClass === 'mid' ? 'var(--kalk)' : 'var(--kristall)');
    document.documentElement.style.setProperty('--fc-score-color', scoreColor);

    let html = '<div class="fc-step">' +
      '<div class="fc-result-head">' +
      '<div class="fc-score-circle"><div class="fc-score-circle-inner"><span class="fc-score-num">' + score.final + '</span><span class="fc-score-max">von 100</span></div></div>' +
      '<span class="fc-result-badge ' + badgeClass + '">' + profile + '</span>' +
      '<h2>' + headline + '</h2>' +
      '<p>' + teaser + '</p>' +
      '</div>';

    html += '<div class="fc-result-topics"><h3>Das bespreche ich gerne persönlich mit dir:</h3><ul>';
    if (symptomeLabels.length) {
      symptomeLabels.forEach(function(l){ html += '<li>• Thema: ' + l + '</li>'; });
    }
    html += '<li>• Passende Fütterung für ' + tiername + '’s aktuelle Lebensphase</li>';
    html += '<li>• Konkrete, individuelle Empfehlung – keine Standardlösung</li>';
    html += '</ul></div>';

    const waMsg = 'Hallo Cedric, ich habe gerade den Futtercheck für ' + tiername +
      ' gemacht (Score: ' + score.final + '/100' + (symptomeLabels.length ? ', Thema: ' + symptomeLabels.join(', ') : '') +
      '). Magst du kurz mit mir draufschauen?';

    html += '<div class="fc-result-cta">' +
      '<a href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waMsg) + '" target="_blank" rel="noopener" class="btn btn-primary"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Jetzt per WhatsApp beraten lassen</a>' +
      '<p class="fc-result-note">Die ausführliche Auswertung bekommst du gleich per E-Mail. Das ist keine tierärztliche Diagnose – bei Beschwerden wende dich bitte an deine Tierarztpraxis.</p>' +
      '</div></div>';

    fcStepArea.innerHTML = html;
    document.getElementById('fcProgressWrap').style.display = 'none';
  }

  fcRenderStep();

  // Lead-Formulare (Kundenzugang sichern / Produkthandbuch anfordern)
  // laufen ueber dieselbe Brevo-Anbindung wie der Futtercheck.

  // Pflichtfelder je Formular (Feldname im FormData -> Fehlertext).
  // handbuchForm: Name, E-Mail, Straße, Ort, Telefon sind Pflicht, damit ein
  // Handbuch ueberhaupt zugestellt werden kann.
  // kundenzugangForm: Name, Tierart, E-Mail, Telefon sind Pflicht; die
  // Nachricht bleibt bewusst optional.
  const FC_LEAD_REQUIRED_FIELDS = {
    handbuch: [
      { name: 'Name',    label: 'deinen Namen' },
      { name: 'Strasse', label: 'deine Straße & Hausnummer' },
      { name: 'Ort',     label: 'PLZ & Ort' },
      { name: 'Telefon', label: 'deine Telefonnummer' }
    ],
    kundenzugang: [
      { name: 'Name',    label: 'deinen Namen' },
      { name: 'Tierart', label: 'die Tierart' },
      { name: 'Telefon', label: 'deine Telefonnummer' }
    ]
  };

  function setupLeadForm(formId, successId, errorId, anfrageart){
    const form = document.getElementById(formId);
    if (!form) return;
    const successEl = document.getElementById(successId);
    const errorEl = document.getElementById(errorId);

    form.addEventListener('submit', function(e){
      e.preventDefault();
      errorEl.classList.remove('show');

      const data = new FormData(form);
      const email = (data.get('E-Mail') || '').toString().trim();

      if (!fcValidEmail(email)) {
        errorEl.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        errorEl.classList.add('show');
        return;
      }

      const pflichtfelder = FC_LEAD_REQUIRED_FIELDS[anfrageart] || [];
      for (let i = 0; i < pflichtfelder.length; i++) {
        const feld = pflichtfelder[i];
        const wert = (data.get(feld.name) || '').toString().trim();
        if (!wert) {
          errorEl.textContent = 'Bitte trag noch ' + feld.label + ' ein.';
          errorEl.classList.add('show');
          const input = form.querySelector('[name="' + feld.name + '"]');
          if (input) input.focus();
          return;
        }
        if (feld.name === 'Telefon' && !fcValidPhone(wert)) {
          errorEl.textContent = 'Bitte gib eine gültige Telefonnummer ein (mindestens 6 Ziffern).';
          errorEl.classList.add('show');
          const input = form.querySelector('[name="' + feld.name + '"]');
          if (input) input.focus();
          return;
        }
      }

      if (!form.querySelector('input[type="checkbox"]').checked) {
        errorEl.textContent = 'Bitte bestätige noch kurz die Angabe darunter.';
        errorEl.classList.add('show');
        return;
      }

      // Tierart aus dem Formular, sonst Hund als neutraler Standard.
      // Brevo verlangt in HUND_KATZE einen Wert; leer wuerde abgelehnt.
      const tierartRoh = (data.get('Tierart') || '').toString().toLowerCase();
      const tierart = tierartRoh.indexOf('katze') !== -1 ? 'katze' : 'hund';

      const sent = brevoSubmit({
        email:     email,
        vorname:   (data.get('Name') || '').toString() || '-',
        tierart:   tierart,
        tiername:  '-',
        score:     '0',
        farbe:     anfrageart,
        futter:    anfrageart === 'handbuch'
                     ? 'Produkthandbuch angefordert'
                     : 'Kundenzugang angefragt',
        interesse: 'Kunde',
        telefon:   (data.get('Telefon') || '').toString(),
        quelle:    anfrageart
      });

      if (!sent) {
        errorEl.textContent = 'Der Versand hat nicht geklappt. Schreib mir bitte kurz per WhatsApp.';
        errorEl.classList.add('show');
        return;
      }

      form.reset();
      form.style.display = 'none';
      successEl.classList.add('show');
    });
  }

  setupLeadForm('kundenzugangForm', 'kzSuccess', 'kzError', 'kundenzugang');
  setupLeadForm('handbuchForm', 'hbSuccess', 'hbError', 'handbuch');

})();
