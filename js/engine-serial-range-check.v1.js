(function (w, d) {
  "use strict";

  async function loadRanges(){
    if (w.__IDMAR_SERIAL_RANGES__) return w.__IDMAR_SERIAL_RANGES__;
    const res = await fetch("data/engine_serial_ranges.json", { cache:"no-store" });
    const json = await res.json();
    w.__IDMAR_SERIAL_RANGES__ = json;
    return json;
  }

  function matchHonda(ranges, prefix, serial){
    const list = (ranges?.Honda?.prefixes?.[prefix]) || [];
    const hits = list.filter(x => typeof x.from === "number" && typeof x.to === "number" &&
                                  serial >= x.from && serial <= x.to);
    return { hits, candidates: list };
  }

  function checkAgainstSelection(parsed, selection, ranges){
    const notes = [];
    let ok = true;

    if (!parsed?.brand || !parsed?.prefix || !parsed?.serial){
      return { ok:false, notes:["Número de motor inválido ou não reconhecido."] };
    }

    const brand = parsed.brand;
    let hits = [], candidates = [];

    if (brand === "Honda"){
      const m = matchHonda(ranges, parsed.prefix, parsed.serial);
      hits = m.hits; candidates = m.candidates;
    } else if (brand === "Mercury"){
      // regra simples por prefixo/anos (exemplo)
      const rules = ranges?.Mercury?.serialRules || [];
      const pfx = String(parsed.prefix||"");
      const rs = rules.filter(r => pfx.startsWith(r.prefix));
      candidates = rs;
      // sem range numérico -> coerência apenas
      if (!rs.length) { ok = false; notes.push(`⚠️ Sem regras conhecidas para prefixo ${pfx} (Mercury).`); }
      else {
        // comparar modelos/anos (se fornecidos na seleção)
        const wantModel = (selection.model||"").toUpperCase();
        const wantHp = selection.hp!=null ? parseInt(selection.hp,10) : null;
        if (wantModel && !rs.some(r => r.models?.some(m => wantModel.includes(String(m))))){
          ok = false; notes.push(`⚠️ Prefixo ${pfx} não costuma mapear para o modelo ${selection.model}.`);
        }
        if (selection.year && !rs.some(r => selection.year >= r.yearFrom && selection.year <= r.yearTo)){
          ok = false; notes.push(`⚠️ Ano ${selection.year} fora do intervalo comum para ${pfx}.`);
        }
        notes.push(`ℹ️ Regras Mercury para ${pfx}: ${rs.map(r=>`${r.models?.join("/")||'?' } @ ${r.yearFrom}-${r.yearTo}`).join("; ")}`);
      }
    }
    // TODO: Yamaha/Suzuki → coerência por model code/ano (quando não houver ranges públicos)

    if (brand === "Honda"){
      if (hits.length === 0){
        notes.push(`⚠️ Série ${parsed.prefix}-${parsed.serial} não encontrada nas faixas conhecidas para Honda.`);
        if (candidates.length){
          const models = [...new Set(candidates.map(c => c.model + (c.hp ? ` (${c.hp}hp)` : "")))].slice(0,6);
          notes.push(`Este prefixo costuma corresponder a: ${models.join(", ")}.`);
        }
        ok = false;
      } else {
        const wantModel = (selection.model||"").toUpperCase();
        const wantHp    = selection.hp!=null ? parseInt(selection.hp,10) : null;

        const modelMismatch = wantModel && !hits.some(h => (h.model||"").toUpperCase().includes(wantModel));
        const hpMismatch    = (wantHp!=null) && !hits.some(h => h.hp === wantHp);

        if (modelMismatch){
          ok = false;
          const models = [...new Set(hits.map(h => h.model))].join(", ");
          notes.push(`⚠️ Prefixo ${parsed.prefix} mapeia para ${models}; selecionaste ${selection.model || "(vazio)"}.`);
        }
        if (hpMismatch){
          ok = false;
          const hps = [...new Set(hits.map(h => h.hp))].join(", ");
          notes.push(`⚠️ Faixa indica HP ${hps}; tens ${selection.hp || "(vazio)"} hp.`);
        }

        hits.forEach(h=>{
          const yr = h.years ? ` [${h.years[0]}–${h.years[1]}]` : "";
          notes.push(`✅ Dentro da faixa conhecida: ${h.model}${h.hp?` ${h.hp}hp`:''}${yr} (${h.from}–${h.to}).`);
        });
      }
    }

    return { ok, notes, hits, candidates };
  }

  w.IDMAR_SerialRangeCheck = { loadRanges, checkAgainstSelection };
})(window, document);
