ï»¿
// IDMAR history bilingual enhancer v2
(function(){
  const mapReason = [
    [/^Estrutura vï¿½lida\.?$/i, "Structure valid"],
    [/Ano de produï¿½ï¿½o inconsistente/i, "Production year inconsistent"],
    [/fora de 1998\+/i, "outside 1998+"],
    [/Ano do modelo nï¿½o pode ser anterior/i, "Model year cannot be earlier than production year"],
    [/M[eï¿½]s invï¿½lido/i, "Invalid month code"],
    [/Tamanho invï¿½lido/i, "Invalid length"],
    [/Formato EUA nï¿½o admite 15/i, "US format does not allow 15"],
    [/Caracteres invï¿½lidos/i, "Invalid characters"],
    [/Pa[iï¿½]s invï¿½lido/i, "Invalid country code"],
    [/Fabricante invï¿½lido/i, "Invalid manufacturer code"],
    [/Ano do modelo fora do intervalo/i, "Model year out of allowed range"],
    [/Prï¿½-?1998.*DoC\/CE/i, "Pre-1998 with DoC/CE"],
    [/Prï¿½-?1998.*falta DoC\/CE/i, "Pre-1998: missing DoC/CE"],
  ];
  function trStatePTEN(text){
    const s = (text||"").toString().trim().toLowerCase();
    if (s.includes("prï¿½-1998") || s.includes("pre-1998")) return 'Prï¿½-1998 / <span class="en">Pre-1998</span>';
    if (s.includes("vï¿½lido")) return 'Vï¿½lido / <span class="en">Valid</span>';
    if (s.includes("invï¿½lido")) return 'Invï¿½lido / <span class="en">Invalid</span>';
    return text;
  }
  function trReasonPTEN(text){
    if(!text) return "";
    const s = (""+text).trim();
    for(const [re,en] of mapReason){
      if(re.test(s)) return s + ' / <span class="en">'+ en +'</span>';
    }
    return s + ' / <span class="en">'+ s +'</span>';
  }
  function patchTable(tbl){
    if(!tbl) return;
    const rows = tbl.querySelectorAll("tbody tr");
    rows.forEach(tr => {
      const tds = tr.querySelectorAll("td");
      if(tds.length < 5) return;
      // Heuristic: state is usually the 3rd/4th column; reason next
      const idxState = Array.from(tds).findIndex(td => /vï¿½lido|invï¿½lido|prï¿½-1998/i.test(td.textContent));
      if(idxState >= 0){
        tds[idxState].innerHTML = trStatePTEN(tds[idxState].textContent);
        if (tds[idxState+1]) tds[idxState+1].innerHTML = trReasonPTEN(tds[idxState+1].textContent);
      }
    });
  }
  function tryPatch(){
    document.querySelectorAll("table").forEach(patchTable);
  }
  const obs = new MutationObserver(tryPatch);
  window.addEventListener("DOMContentLoaded", ()=>{
    tryPatch();
    obs.observe(document.body, {subtree:true, childList:true});
  });
})();



