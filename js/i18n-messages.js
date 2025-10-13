ï»¿// js/i18n-messages.js (patched loader)
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
      portuguese: "Portuguï¿½s",
      english: "Inglï¿½s"
    },
    nav: {
      validator: "Validador",
      forensics: "Forense",
      history: "Histï¿½rico"
    },
    validator: {
      title: "Validador de HIN/WIN",
      inputPlaceholder: "Introduz o HIN/WIN aqui",
      validateBtn: "Validar",
      ok: "Nï¿½mero vï¿½lido.",
      nok: "Nï¿½mero invï¿½lido: {reason}",
      saved: "Registo guardado no histï¿½rico."
    },
    engine: {
      title: "Validador de Motor",
      brand: "Marca",
      serialPlaceholder: "N.ï¿½ de sï¿½rie do motor",
      validateBtn: "Validar Motor",
      nok: "S/N invï¿½lido: {reason}"
    },
    forensics: {
      title: "Validaï¿½ï¿½o Forense Visual",
      drop: "Larga a fotografia aqui ou clica para escolherï¿½",
      analyzing: "A analisar imagemï¿½",
      result_ok: "Padrï¿½es e layout consistentes.",
      result_nok: "Inconsistï¿½ncias detetadas: {reason}"
    },
    history: {
      title: "Histï¿½rico de Verificaï¿½ï¿½es",
      empty: "Sem registos ainda.",
      winTab: "HIN/WIN",
      motorTab: "Motores",
      back: "Voltar ao Validador"
    },
    toast: {
      syncOn: "Sincronizaï¿½ï¿½o ativa.",
      syncOff: "Sem sessï¿½o: em modo offline.",
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
      drop: "Drop a photo here or click to selectï¿½",
      analyzing: "Analyzing imageï¿½",
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


