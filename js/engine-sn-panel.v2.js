// js/engine-sn-panel.v2.js
(function(w,d){
  "use strict";
  const q = s => d.querySelector(s);
  const qa= s => d.querySelectorAll(s);

  // Lê a seleção do cartão do Motor (sem mexer nele)
  function readSelection(){
    const brand  = (q("#brand")?.value || "").trim();
    const model  = (q("#srch_model")?.value || "").trim();         // ex: "BF40A" ou "DF140A"
    const hpRaw  = (q("#srch_power")?.value || "").trim();
    const hp     = hpRaw ? parseInt(hpRaw.replace(/\D+/g,""),10) : null;
    const yearRaw= (q("#srch_year")?.value || "").trim();
    const year   = yearRaw ? parseInt(yearRaw.replace(/\D+/g,""),10) : null;

    // tentar extrair família+subcódigo do campo modelo (ex.: BF40A-BAAL)
    let family=null, code=null;
    const m1 = model.match(/^(BF\d+[A-Z]?)/i); // BF40 / BF40A
    if (m1) family = m1[1].toUpperCase();
    const m2 = model.match(/(?:-|\/|\s)([A-Z]{3,6})$/i); // BAAL / HALJ no fim
    if (m2) code = m2[1].toUpperCase();

    return { brand, family, code, hp, year, model_raw:model };
  }

  function renderWindow(ranges, sel){
    const box = q("#engine-sn-window");
    box.innerHTML = "";
    if (!ranges || !ranges.length){
      box.innerHTML = '<span class="muted">Sem janelas conhecidas para a seleção atual.</span>';
      return;
    }
    const h = d.createElement("div");
    h.innerHTML = '<div class="muted">Janelas válidas para '
      + [sel.brand, sel.family, sel.code].filter(Boolean).join(" ") + '</div>';
    box.appendChild(h);
    ranges.forEach(r=>{
      const chip = d.createElement("span");
      const yrs = r.years ? ` — ${r.years[0]}–${r.years[1]}` : "";
      const shaft = r.shaft?.length ? ` — eixo ${r.shaft.join("/")}` : "";
      chip.className="chip";
      chip.textContent = `${r.range[0]}–${r.range[1]}${yrs}${shaft}`;
      box.appendChild(chip);
    });
  }

  function renderResult(ok, notes){
    const box = q("#engine-sn-result");
    const cls = ok ? "good" : "bad";
    const lbl = ok ? "Dentro da(s) janela(s)" : "Fora da(s) janela(s)";
    box.innerHTML = `<span class="badge ${cls}">${lbl}</span>`
      + (notes?.length ? `<ul>${notes.map(n=>`<li>${n}</li>`).join("")}</ul>` : "");
  }

  async function recomputeWindows(){
    const sel = readSelection();
    const win = q("#engine-sn-window");
    const hints = q("#engine-sn-hints");
    if (hints) hints.textContent = [sel.brand, sel.family, sel.code, sel.hp?.toString(), sel.year?.toString()].filter(Boolean).join(" · ");

    // carregar dataset de faixas
    const all = await w.IDMAR_SerialRangeCheck.loadRanges();

    // pedir ao checker as janelas possíveis para a seleção atual
    const cands = w.IDMAR_SerialRangeCheck.getWindowsForSelection
      ? w.IDMAR_SerialRangeCheck.getWindowsForSelection(sel, all)
      : fallbackWindows(sel, all);

    renderWindow(cands, sel);

    // se já tiver nº escrito, revalidar
    const sn = (q("#engine-sn-raw")?.value || "").trim();
    if (sn) runValidation();
  }

  // fallback: procurar por marca/família/código
  function fallbackWindows(sel, all){
    const out = [];
    const b = all?.[sel.brand]; if (!b) return out;
    if (b.families && sel.family){
      const fam = b.families[sel.family];
      if (fam?.codes){
        if (sel.code && fam.codes[sel.code]) out.push(fam.codes[sel.code]);
        else out.push(...Object.values(fam.codes));
      }
    } else if (b.prefixes) {
      // mercury, etc.
      out.push(...Object.values(b.prefixes));
    }
    return out;
  }

  async function runValidation(){
    const sel = readSelection();
    const kind = (q('input[name="engine-sn-kind"]:checked')?.value)||"auto";
    const raw  = (q("#engine-sn-raw")?.value || "").trim();

    // parser por marca (já tens este módulo)
    let parsed = w.IDMAR_EngineSN?.parse(raw, sel.brand) || null;

    // Honda: exterior/interior
    if ((sel.brand||"").toLowerCase()==="honda"){
      const hasPrefix = /^[A-Z0-9]+[-\s]?\d{4,}$/.test(raw) && /[A-Z]/.test(raw.charAt(0));
      if (kind==="exterior" && !hasPrefix) parsed = null;
      if (kind==="interior" && hasPrefix){
        parsed = { brand:"Honda", prefix:null, serial: parseInt(raw.replace(/\D+/g,""),10) || null, source:"interior" };
      }
    }

    const ranges = await w.IDMAR_SerialRangeCheck.loadRanges();
    let res;
    if (parsed && parsed.brand==="Honda" && parsed.source==="interior"){
      res = { ok:true, notes:["ℹ️ Honda (interior): número de bloco interno. Validação por coerência (sem faixa de prefixo)."] };
    } else {
      res = w.IDMAR_SerialRangeCheck.checkAgainstSelection(parsed, sel, ranges);
    }
    renderResult(!!res?.ok, res?.notes||[]);
  }

  function wire(){
    // sempre que muda algo no cartão do Motor → recalcula janelas
    ["#brand","#srch_model","#srch_power","#srch_year"].forEach(sel=>{
      q(sel)?.addEventListener("input", recomputeWindows, {passive:true});
      q(sel)?.addEventListener("change", recomputeWindows, {passive:true});
    });
    // nº do motor
    q("#engine-sn-raw")?.addEventListener("input", runValidation, {passive:true});
    qa('input[name="engine-sn-kind"]').forEach(r=>r.addEventListener("change", runValidation));

    // botão "Validar Motor" também dispara recalcular
    q("#btnMotor")?.addEventListener("click", ()=>{ setTimeout(recomputeWindows, 0); });
  }

  d.addEventListener("DOMContentLoaded", ()=>{
    // garantir módulos base existem
    if (!w.IDMAR_SerialRangeCheck || !w.IDMAR_EngineSN){
      console.warn("[IDMAR] Falta engine-serial-range-check ou engine-sn parser.");
      return;
    }
    wire();
    recomputeWindows();
  });
})(window, document);
