(function (w, d) {
  "use strict";

  function q(sel){ return d.querySelector(sel); }
  function qa(sel){ return d.querySelectorAll(sel); }

  // ===== GUARDAS DE PÁGINA =====
  // Só ativa se existirem elementos típicos do Validador Motor.
  function isMotorValidatorPage(){
    return !!(q("#engine-picker-hook") || q("#btn-validate-engine") || q("#engine-result-hook"));
  }

  // ===== UI: garantir campo e opções =====
  function ensureSNField(){
    if (!isMotorValidatorPage()) return;
    if (q("#engine-sn-raw")) return;

    const host = q("#engine-serial-field-hook") || q("#engine-picker-hook") || q("#engine-form");
    if (!host) return;

    const wrap = d.createElement("div");
    wrap.id = "engine-serial-field-hook";
    wrap.className = "form-row";
    wrap.innerHTML = [
      '<label for="engine-sn-raw">Nº do motor / Engine serial</label>',
      '<div class="row">',
      '  <input id="engine-sn-raw" type="text" placeholder="Ex.: BAAL-999123, 1B123456" autocomplete="off" />',
      '  <div class="sn-kind">',
      '    <label><input type="radio" name="engine-sn-kind" value="auto" checked> Auto</label>',
      '    <label><input type="radio" name="engine-sn-kind" value="exterior"> Exterior</label>',
      '    <label><input type="radio" name="engine-sn-kind" value="interior"> Interior</label>',
      '  </div>',
      '</div>',
      '<small class="muted" id="engine-sn-hints"></small>'
    ].join("");

    // inserir no topo do host (do lado do validador de motor)
    host.prepend(wrap);
  }

  function getSNKind(){
    const el = q('input[name="engine-sn-kind"]:checked');
    return el ? el.value : "auto";
  }

  function getSelection(){
    const brand  = (q("#engine-brand, #engine-picker-hook select[name='brand']")?.value || "").trim();
    const model  = (q("#engine-model-code, #engine-model")?.value || "").trim();
    const hpRaw  = (q("#engine-hp, input[name='engine-hp']")?.value || "").trim();
    const hp     = hpRaw ? parseInt(hpRaw.replace(/\D+/g,""),10) : null;
    const yearRaw= (q("#engine-year, input[name='engine-year']")?.value || "").trim();
    const year   = yearRaw ? parseInt(yearRaw.replace(/\D+/g,""),10) : null;
    return { brand, model, hp, year };
  }

  function appendNotes(notes){
    if (!isMotorValidatorPage()) return;
    const box = q("#engine-result-hook") || q("#engine-result") || d.body;
    const old = box.querySelector('[data-idmar-extra-notes="1"]'); if (old) old.remove();
    if (!notes || !notes.length) return;
    const ul = d.createElement("ul"); ul.setAttribute("data-idmar-extra-notes","1");
    notes.forEach(n => { const li = d.createElement("li"); li.textContent = n; ul.appendChild(li); });
    box.appendChild(ul);
  }

  async function runSNCheck(){
    if (!isMotorValidatorPage()) return;
    const input = q("#engine-sn-raw");
    if (!input) return;

    const sn = (input.value || "").trim();
    const kind = getSNKind();
    const sel = getSelection();
    const hintsEl = q("#engine-sn-hints");

    if (!sn){
      if (hintsEl) hintsEl.textContent = "";
      appendNotes([]);
      return;
    }

    // parser base (por marca)
    let parsed = w.IDMAR_EngineSN?.parse(sn, sel.brand) || null;

    // Honda: permitir distinção exterior/interior
    if ((sel.brand||"").toLowerCase() === "honda"){
      // “Exterior” = prefixo+serial tipo BAAL-xxxxxxx; “Interior” = nº bloco (só dígitos ou padrão sem prefixo)
      const hasPrefix = /^[A-Z0-9]+[-\s]?\d{4,}$/.test(sn) && /[A-Z]/.test(sn.charAt(0));
      if (kind === "exterior" && !hasPrefix){
        parsed = null;
      }
      if (kind === "interior" && hasPrefix){
        // força tratar como bloco interno (sem baliza por prefixo)
        parsed = { brand:"Honda", prefix:null, serial: parseInt(sn.replace(/\D+/g,""),10) || null, source:"interior" };
      }
    }

    // carregar balizas
    const ranges = await w.IDMAR_SerialRangeCheck.loadRanges();
    let res;

    if (parsed && parsed.brand === "Honda" && parsed.source === "interior"){
      // Sem prefixo: só coerência leve (não há faixa por prefixo)
      const notes = [];
      notes.push("ℹ️ Honda (interior): número de bloco interno. Validação por coerência — sem faixa de prefixo.");
      // opcional: cruzar hp/model se soubermos inferir algo do nº interno (normalmente não público)
      res = { ok:true, notes };
    } else {
      // checker normal (usa faixas se houver)
      res = w.IDMAR_SerialRangeCheck.checkAgainstSelection(parsed, sel, ranges);
      // afinar mensagem quando brand=Honda & kind=exterior mas sem match
      if ((sel.brand||"").toLowerCase()==="honda" && kind!=="interior" && parsed && (!parsed.prefix || !parsed.serial)){
        res.notes = (res.notes||[]).concat(["ℹ️ Honda: números exteriores costumam ter prefixo (ex.: BAAL-1234567)."]);
      }
    }

    // hints curtos
    if (hintsEl){
      const bits = [];
      if (parsed?.brand)  bits.push(`brand: ${parsed.brand}`);
      if (parsed?.prefix) bits.push(`prefix: ${parsed.prefix}`);
      if (parsed?.serial) bits.push(`serial: ${parsed.serial}`);
      if ((sel.brand||"").toLowerCase()==="honda") bits.push(`tipo: ${kind}`);
      hintsEl.textContent = bits.join(" · ");
    }

    // render notes
    if (typeof w.renderEngineResult === "function"){
      w.renderEngineResult(true, res.notes || []);
    } else {
      appendNotes(res.notes || []);
    }
  }

  d.addEventListener("DOMContentLoaded", () => {
    try {
      if (!isMotorValidatorPage()) return;  // nunca corre fora do Validador Motor
      ensureSNField();
      const input = q("#engine-sn-raw");
      if (input){
        input.addEventListener("input", runSNCheck, { passive:true });
        input.addEventListener("blur",  runSNCheck, { passive:true });
      }
      qa('input[name="engine-sn-kind"]').forEach(r => r.addEventListener("change", runSNCheck));
      q("#btn-validate-engine")?.addEventListener("click", runSNCheck);
      console.info("[IDMAR] Engine SN glue ativo (híbrido, page-guarded, Honda dual-SN).");
    } catch(e){}
  });

})(window, document);
