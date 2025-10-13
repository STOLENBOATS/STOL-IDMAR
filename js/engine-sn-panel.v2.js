ï»¿// js/engine-sn-panel.v2.js  (r2)
// - Lï¿½ seleï¿½ï¿½o do cartï¿½o "Validador Motor"
// - Calcula janelas vï¿½lidas (ranges) para a seleï¿½ï¿½o
// - Valida o nï¿½ introduzido e MOSTRA tambï¿½m os intervalos esperados logo por baixo
(function(w,d){
  "use strict";
  const q = s => d.querySelector(s);
  const qa= s => d.querySelectorAll(s);

  // Mantemos as ï¿½ltimas janelas calculadas para mostrar no resultado
  let lastWindows = [];

  function readSelection(){
    const brand  = (q("#brand")?.value || "").trim();
    const model  = (q("#srch_model")?.value || "").trim();         // ex: "BF40A-BAAL" ou "DF140A"
    const hpRaw  = (q("#srch_power")?.value || "").trim();
    const hp     = hpRaw ? parseInt(hpRaw.replace(/\D+/g,""),10) : null;
    const yearRaw= (q("#srch_year")?.value || "").trim();
    const year   = yearRaw ? parseInt(yearRaw.replace(/\D+/g,""),10) : null;

    // tentar extrair famï¿½lia+subcï¿½digo do campo modelo (ex.: BF40A-BAAL)
    let family=null, code=null;
    const m1 = model.match(/^(BF\d+[A-Z]?)/i); // BF40 / BF40A
    if (m1) family = m1[1].toUpperCase();
    const m2 = model.match(/(?:-|\/|\s)([A-Z]{3,6})$/i); // BAAL / HALJ no fim
    if (m2) code = m2[1].toUpperCase();

    return { brand, family, code, hp, year, model_raw:model };
  }

  function chipText(r){
    const base = `${r.range?.[0] ?? "?"}ï¿½${r.range?.[1] ?? "?"}`;
    const yrs  = r.years ? ` ï¿½ ${r.years[0]}ï¿½${r.years[1]}` : "";
    const shaft= r.shaft?.length ? ` ï¿½ eixo ${r.shaft.join("/")}` : "";
    const hp   = r.hp?.length ? ` ï¿½ hp ${r.hp.join("/")}` : "";
    return base + yrs + shaft + hp;
  }

  function renderWindow(ranges, sel){
    const box = q("#engine-sn-window");
    if (!box) return;
    box.innerHTML = "";
    if (!ranges || !ranges.length){
      box.innerHTML = '<span class="muted">Sem janelas conhecidas para a seleï¿½ï¿½o atual.</span>';
      return;
    }
    const h = d.createElement("div");
    h.innerHTML = '<div class="muted">Janelas vï¿½lidas para '
      + [sel.brand, sel.family, sel.code].filter(Boolean).join(" ") + '</div>';
    box.appendChild(h);
    ranges.forEach(r=>{
      const chip = d.createElement("span");
      chip.className="chip";
      chip.textContent = chipText(r);
      box.appendChild(chip);
    });
  }

  function renderResult(ok, notes, serialPresent){
    const box = q("#engine-sn-result");
    if (!box) return;

    const cls = ok ? "good" : "bad";
    const lbl = ok ? "Dentro da(s) janela(s)" : "Fora da(s) janela(s)";
    let html = `<span class="badge ${cls}">${lbl}</span>`;
    if (notes?.length) html += `<ul>${notes.map(n=>`<li>${n}</li>`).join("")}</ul>`;

    // Mostra SEMPRE as janelas conhecidas por baixo do resultado (se houver)
    if (lastWindows && lastWindows.length){
      const title = serialPresent
        ? (ok ? "Intervalo(s) correspondente(s):" : "Intervalo(s) esperado(s):")
        : "Intervalo(s) esperado(s):";
      html += `<div class="mt-2 muted">${title}</div>`;
      html += `<div class="mt-2">` +
        lastWindows.map(r=>`<span class="chip">${chipText(r)}</span>`).join(" ") +
        `</div>`;
    }
    box.innerHTML = html;
  }

  async function recomputeWindows(){
    const sel = readSelection();
    const hints = q("#engine-sn-hints");
    if (hints) hints.textContent = [sel.brand, sel.family, sel.code, sel.hp?.toString(), sel.year?.toString()]
      .filter(Boolean).join(" ï¿½ ");

    // carregar dataset de faixas
    const all = await w.IDMAR_SerialRangeCheck.loadRanges();

    // pedir as janelas possï¿½veis para a seleï¿½ï¿½o atual (se a funï¿½ï¿½o existir)
    let cands = [];
    if (typeof w.IDMAR_SerialRangeCheck.getWindowsForSelection === "function"){
      cands = w.IDMAR_SerialRangeCheck.getWindowsForSelection(sel, all) || [];
    } else {
      cands = fallbackWindows(sel, all);
    }
    lastWindows = cands; // guarda para o renderResult

    renderWindow(cands, sel);

    // se jï¿½ tiver nï¿½ escrito, revalidar
    const sn = (q("#engine-sn-raw")?.value || "").trim();
    if (sn) runValidation();
  }

  // fallback: procurar por marca/famï¿½lia/cï¿½digo
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
    const serialPresent = !!raw;

    if (!serialPresent){
      renderResult(true, ["Introduza o nï¿½ para validar contra a(s) janela(s)."], false);
      return;
    }

    // parser por marca (mï¿½dulo existente)
    let parsed = w.IDMAR_EngineSN?.parse(raw, sel.brand) || null;

    // Honda: exterior/interior (dois nï¿½meros distintos)
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
      res = { ok:true, notes:["?? Honda (interior): nï¿½mero de bloco interno. Validaï¿½ï¿½o por coerï¿½ncia (sem faixa de prefixo)."] };
    } else {
      res = w.IDMAR_SerialRangeCheck.checkAgainstSelection(parsed, sel, ranges);
    }
    renderResult(!!res?.ok, res?.notes||[], serialPresent);
  }

  function wire(){
    // sempre que muda algo no cartï¿½o do Motor ? recalcula janelas
    ["#brand","#srch_model","#srch_power","#srch_year"].forEach(sel=>{
      q(sel)?.addEventListener("input", recomputeWindows, {passive:true});
      q(sel)?.addEventListener("change", recomputeWindows, {passive:true});
    });
    // nï¿½ do motor
    q("#engine-sn-raw")?.addEventListener("input", runValidation, {passive:true});
    qa('input[name="engine-sn-kind"]').forEach(r=>r.addEventListener("change", runValidation));

    // botï¿½o "Validar Motor" tambï¿½m dispara recalcular
    q("#btnMotor")?.addEventListener("click", ()=>{ setTimeout(recomputeWindows, 0); });
  }

  d.addEventListener("DOMContentLoaded", ()=>{
    if (!w.IDMAR_SerialRangeCheck || !w.IDMAR_EngineSN){
      console.warn("[IDMAR] Falta engine-serial-range-check ou engine-sn parser.");
      return;
    }
    wire();
    recomputeWindows();
    console.info("[IDMAR] engine-sn-panel v2 (r2) pronto.");
  });
})(window, document);



