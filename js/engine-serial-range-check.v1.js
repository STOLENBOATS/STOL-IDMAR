ï»¿// js/engine-serial-range-check.v1.js (r8)
// - Lï¿½ data/engine_serial_ranges.json (cache)
// - Entrega janelas (intervalos) coerentes com a seleï¿½ï¿½o do cartï¿½o "Motor"
// - Valida nï¿½ de motor (dentro/fora) e devolve notas claras (inclui mismatch de potï¿½ncia/cï¿½digo)
(function(w){
  "use strict";

  const DS_URL = "data/engine_serial_ranges.json";
  let _cache = null; let _cacheAt = 0;

  function within(num, range){
    if (!range || range.length !== 2) return false;
    const n = +num; return Number.isFinite(n) && n >= range[0] && n <= range[1];
  }

  function arrHas(arr, v){
    if (!arr || !arr.length) return true; // sem filtro
    return arr.includes(v);
  }

  function yearsOk(selYear, rangeYears){
    if (!rangeYears || rangeYears.length !== 2) return true;
    if (!selYear) return true;
    return selYear >= rangeYears[0] && selYear <= rangeYears[1];
  }

  function hpOk(selHp, hpList){
    if (!hpList || !hpList.length) return true;
    if (!selHp) return true;
    return hpList.includes(selHp);
  }

  function normalizeSel(sel){
    // sel = {brand, family, code, hp, year}
    const out = Object.assign({}, sel);
    if (out.brand)  out.brand  = String(out.brand).trim();
    if (out.family) out.family = String(out.family).trim().toUpperCase();    // p.ex. BF40 / BF40A
    if (out.code)   out.code   = String(out.code).trim().toUpperCase();      // p.ex. BAAL / BALJ
    if (out.hp)     out.hp     = parseInt(out.hp, 10);
    if (out.year)   out.year   = parseInt(out.year, 10);
    // famï¿½lia: normalizar BF40A -> BF40 para lookup por famï¿½lia base
    if (out.family && /^BF\d+[A-Z]$/i.test(out.family)) {
      out.familyBase = out.family.replace(/([A-Z])$/,''); // BF40A -> BF40
    } else {
      out.familyBase = out.family || null;
    }
    return out;
  }

  async function loadRanges(){
    const now = Date.now();
    if (_cache && (now - _cacheAt) < 60_000) return _cache;
    const res = await fetch(DS_URL, {cache:"no-store"});
    if (!res.ok) throw new Error("Falha a carregar "+DS_URL);
    _cache = await res.json(); _cacheAt = now;
    return _cache;
  }

  // Seleciona janelas compatï¿½veis com a seleï¿½ï¿½o do cartï¿½o "Motor"
  function getWindowsForSelection(sel, all){
    const S = normalizeSel(sel);
    const brand = all?.[S.brand];
    if (!brand) return [];

    // HONDA: families ? codes
    if (S.brand && S.brand.toLowerCase()==="honda" && brand.families){
      const out = [];
      const famKey = S.familyBase || S.family;
      if (famKey && brand.families[famKey] && brand.families[famKey].codes){
        const codes = brand.families[famKey].codes;
        const keys = S.code && codes[S.code] ? [S.code] : Object.keys(codes);
        keys.forEach(k=>{
          const r = codes[k];
          if (hpOk(S.hp, r.hp) && yearsOk(S.year, r.years)){
            out.push(Object.assign({code:k, family:famKey}, r));
          }
        });
        return out;
      }

      // Se nï¿½o veio famï¿½lia, mas veio HP ? procurar em todas as famï¿½lias/cï¿½digos que aceitem este HP
      if (!famKey && S.hp){
        Object.entries(brand.families).forEach(([fam,def])=>{
          if (!def.codes) return;
          Object.entries(def.codes).forEach(([code, r])=>{
            if (hpOk(S.hp, r.hp) && yearsOk(S.year, r.years)){
              out.push(Object.assign({code, family:fam}, r));
            }
          });
        });
        return out;
      }

      // fallback: todas
      Object.entries(brand.families).forEach(([fam,def])=>{
        if (!def.codes) return;
        Object.entries(def.codes).forEach(([code, r])=>{
          if (hpOk(S.hp, r.hp) && yearsOk(S.year, r.years)){
            out.push(Object.assign({code, family:fam}, r));
          }
        });
      });
      return out;
    }

    // MERCURY: prefixes
    if (brand.prefixes){
      const out = [];
      Object.entries(brand.prefixes).forEach(([px, r])=>{
        if (hpOk(S.hp, r.hp) && yearsOk(S.year, r.years)){
          out.push(Object.assign({prefix:px}, r));
        }
      });
      return out;
    }

    return [];
  }

  // Validaï¿½ï¿½o do nï¿½ contra as janelas + notas (mismatch de potï¿½ncia/cï¿½digo)
  function checkAgainstSelection(parsed, sel, all){
    const notes = [];
    const S = normalizeSel(sel);

    if (!parsed || !parsed.serial){
      notes.push("Nï¿½mero invï¿½lido ou sem dï¿½gitos suficientes.");
      return { ok:false, notes };
    }

    // preparar janelas
    const wins = getWindowsForSelection(S, all);
    if (!wins.length){
      notes.push("Sem janelas oficiais para esta seleï¿½ï¿½o (usar coerï¿½ncia geral).");
      // Sem janelas ? nï¿½o bloqueamos, mas sinalizamos neutro
      return { ok:true, notes };
    }

    // tentar encontrar janela(s) coerentes tambï¿½m por cï¿½digo/prefixo quando possï¿½vel
    const codeLike = (parsed.code || parsed.prefix || "").toUpperCase();

    // Honda: se cï¿½digo explï¿½cito no SN, prioriza janelas desse cï¿½digo
    let candidates = wins;
    if (codeLike){
      const filtered = wins.filter(w => (w.code ? w.code.toUpperCase()===codeLike : false));
      if (filtered.length) candidates = filtered;
    }

    // Verificar pertenï¿½a a pelo menos uma janela
    const inSome = candidates.some(w => within(parsed.serial, w.range));
    let ok = inSome;

    // Notas de mismatch de potï¿½ncia quando aplicï¿½vel (ex.: BAAL=15/20 vs BF40 selecionado)
    if (S.brand && S.brand.toLowerCase()==="honda" && codeLike){
      // procurar definiï¿½ï¿½o do cï¿½digo no catï¿½logo, pela famï¿½lia selecionada (ou por todas)
      const brand = all?.[S.brand]; 
      const famKey = S.familyBase || S.family;
      let defs = [];
      if (famKey && brand?.families?.[famKey]?.codes?.[codeLike]){
        defs = [ brand.families[famKey].codes[codeLike] ];
      } else {
        // procurar em todas as famï¿½lias Honda por esse cï¿½digo
        Object.values(brand?.families || {}).forEach(def=>{
          if (def.codes?.[codeLike]) defs.push(def.codes[codeLike]);
        });
      }
      defs.forEach(def=>{
        if (def.hp && S.hp && !def.hp.includes(S.hp)){
          notes.push(`?? Cï¿½digo ${codeLike} estï¿½ associado a hp ${def.hp.join("/")} ï¿½ seleï¿½ï¿½o atual: ${S.hp} hp.`);
          ok = false;
        }
      });
    }

    if (!ok){
      notes.push("Nï¿½mero fora do(s) intervalo(s) esperado(s) para a seleï¿½ï¿½o atual.");
    } else {
      notes.push("Nï¿½mero dentro do(s) intervalo(s) esperado(s).");
    }

    return { ok, notes };
  }

  // API pï¿½blica
  w.IDMAR_SerialRangeCheck = {
    loadRanges,
    getWindowsForSelection,
    checkAgainstSelection
  };
})(window);



