// js/i18n-messages.js (patched loader)
(function queueLoad(dict){
  function doLoad() {
    if (!window.I18N) return setTimeout(doLoad, 0); // wait for core
    window.I18N.load(dict);
  }
  doLoad();
})({
  pt: {
    app: {
      name: "IDMAR",
      subtitle: "Maritime Identification & Engine Checker",
      language: "Idioma",
      portuguese: "Portugu�s",
      english: "Ingl�s"
    },
    nav: {
      validator: "Validador",
      forensics: "Forense",
      history: "Hist�rico"
    },
    validator: {
      title: "Validador de HIN/WIN",
      inputPlaceholder: "Introduz o HIN/WIN aqui",
      validateBtn: "Validar",
      ok: "N�mero v�lido.",
      nok: "N�mero inv�lido: {reason}",
      saved: "Registo guardado no hist�rico."
    },
    engine: {
      title: "Validador de Motor",
      brand: "Marca",
      serialPlaceholder: "N.� de s�rie do motor",
      validateBtn: "Validar Motor",
      nok: "S/N inv�lido: {reason}"
    },
    forensics: {
      title: "Valida��o Forense Visual",
      drop: "Larga a fotografia aqui ou clica para escolher�",
      analyzing: "A analisar imagem�",
      result_ok: "Padr�es e layout consistentes.",
      result_nok: "Inconsist�ncias detetadas: {reason}"
    },
    history: {
      title: "Hist�rico de Verifica��es",
      empty: "Sem registos ainda.",
      winTab: "HIN/WIN",
      motorTab: "Motores",
      back: "Voltar ao Validador"
    },
    toast: {
      syncOn: "Sincroniza��o ativa.",
      syncOff: "Sem sess�o: em modo offline.",
      photoSaved: "Fotografia associada ao registo."
    }
  },

  en: {
    app: {
      name: "IDMAR",
      subtitle: "Maritime Identification & Engine Checker",
      language: "Language",
      portuguese: "Portuguese",
      english: "English"
    },
    nav: {
      validator: "Validator",
      forensics: "Forensics",
      history: "History"
    },
    validator: {
      title: "HIN/WIN Validator",
      inputPlaceholder: "Enter HIN/WIN here",
      validateBtn: "Validate",
      ok: "Valid number.",
      nok: "Invalid number: {reason}",
      saved: "Record saved to history."
    },
    engine: {
      title: "Engine Validator",
      brand: "Brand",
      serialPlaceholder: "Engine serial number",
      validateBtn: "Validate Engine",
      nok: "Invalid S/N: {reason}"
    },
    forensics: {
      title: "Visual Forensic Validation",
      drop: "Drop a photo here or click to select�",
      analyzing: "Analyzing image�",
      result_ok: "Patterns and layout consistent.",
      result_nok: "Inconsistencies found: {reason}"
    },
    history: {
      title: "Verification History",
      empty: "No records yet.",
      winTab: "HIN/WIN",
      motorTab: "Engines",
      back: "Back to Validator"
    },
    toast: {
      syncOn: "Sync is on.",
      syncOff: "No session: offline mode.",
      photoSaved: "Photo attached to record."
    }
  }
});
