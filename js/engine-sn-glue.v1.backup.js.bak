(function (w, d) {
  "use strict";

  function q(sel){ return d.querySelector(sel); }

  function ensureSNField(){
    if (q("#engine-sn-raw")) return;
    // tenta inserir perto do picker do motor
    const hook = q("#engine-picker-hook") || q("#engine-form") || q("main") || d.body;
    const wrap = d.createElement("div");
    wrap.className = "form-row";
    wrap.innerHTML = [
      '<label for="engine-sn-raw">Nº do motor / Engine serial</label>',
      '<input id="engine-sn-raw" type="text" placeholder="Ex.: BAAL-999123, 1B123456">',
      '<small class="muted" id="engine-sn-hints"></small>'
    ].join("");
    hook.prepend(wrap);
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
    const box = q("#engine-result-hook") || q("#engine-result") || q("footer") || d.body;
    const ul = d.createElement("ul"); ul.setAttribute("data-idmar-extra-notes","1");
    notes.forEach(n => { const li = d.createElement("li"); li.textContent = n; ul.appendChild(li); });
    // remove um bloco antigo para não duplicar
    const old = box.querySelector('[data-idmar-extra-notes="1"]'); if (old) old.remove();
    box.appendChild(ul);
  }

  async function runSNCheck(){
    const input = q("#engine-sn-raw");
    if (!input) return;
    const sn = input.value;
    if (!sn) { q("#engine-sn-hints") && (q("#engine-sn-hints").textContent = ""); return; }

    const sel = getSelection();
    const parsed = w.IDMAR_EngineSN?.parse(sn, sel.brand);
    const ranges = await w.IDMAR_SerialRangeCheck.loadRanges();
    const res = w.IDMAR_SerialRangeCheck.checkAgainstSelection(parsed, sel, ranges);

    // hints curtos por baixo do campo
    const hintsEl = q("#engine-sn-hints");
    if (hintsEl){
      const bits = [];
      if (parsed?.brand)  bits.push(`brand: ${parsed.brand}`);
      if (parsed?.prefix) bits.push(`prefix: ${parsed.prefix}`);
      if (parsed?.serial) bits.push(`serial: ${parsed.serial}`);
      hintsEl.textContent = bits.join(" · ");
    }

    // mostra notas no resultado
    if (typeof w.renderEngineResult === "function"){
      w.renderEngineResult(true, res.notes);
    } else {
      appendNotes(res.notes || []);
    }

    // drive-first: se ainda não escolheram modelo/hp e houver apenas 1 hit
    if ((!sel.model || !sel.hp) && res.hits?.length === 1){
      const h = res.hits[0];
      if (!sel.hp && h.hp) q("#engine-hp")?.setAttribute("placeholder", String(h.hp));
    }
  }

  d.addEventListener("DOMContentLoaded", () => {
    try {
      ensureSNField();
      const input = q("#engine-sn-raw");
      if (input){
        input.addEventListener("input", runSNCheck, { passive:true });
        input.addEventListener("blur",  runSNCheck, { passive:true });
      }
      // ligar também ao botão "Validar Motor", se existir
      q("#btn-validate-engine")?.addEventListener("click", runSNCheck);
      console.info("[IDMAR] Engine SN glue ativo (híbrido).");
    } catch(e){}
  });

})(window, document);
