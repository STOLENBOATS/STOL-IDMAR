// IDMAR validator enhancements v4 (DOM-observer based)
(function(){
  function enstyle(){ 
    if(!document.querySelector('style#idmar-en-style')){
      const st = document.createElement('style'); st.id='idmar-en-style';
      st.textContent = '.en{font-style:italic;opacity:.8} .en.sub{display:block;font-size:.85em;opacity:.65;margin-top:.15rem} .mini-evidence{max-width:96px;max-height:64px;border:1px solid var(--border,#e5e7eb);border-radius:6px}';
      document.head.appendChild(st);
    }
  }

  function i18nForense(){
    document.querySelectorAll("details summary").forEach(sum => {
      if(/Forense/.test(sum.textContent) && !/Forensic/.test(sum.innerHTML)){
        sum.innerHTML = sum.textContent.replace("Forense (opcional)", 'Forense (opcional) / <span class="en">Forensic (optional)</span>');
      }
    });
    const labelMap = {
      "Rebites": 'Rebites<br><span class="en sub">Rivets</span>',
      "Cord�es de solda": 'Cord�es de solda<br><span class="en sub">Weld beads</span>',
      "Placa remarcada": 'Placa remarcada<br><span class="en sub">Re-stamped plate</span>',
      "Camadas de tinta/abras�es": 'Camadas de tinta/abras�es<br><span class="en sub">Paint layers/abrasions</span>',
      "Etiqueta adulterada/ausente (motor)": 'Etiqueta adulterada/ausente (motor)<br><span class="en sub">Tampered/missing label (engine)</span>',
      "Core plug danificado/removido": 'Core plug danificado/removido<br><span class="en sub">Core plug damaged/removed</span>',
      "Solda/corros�o an�mala": 'Solda/corros�o an�mala<br><span class="en sub">Abnormal weld/corrosion</span>',
      "Remarca��o no bloco": 'Remarca��o no bloco<br><span class="en sub">Re-mark on engine block</span>',
    };
    document.querySelectorAll("label").forEach(lab=>{
      const t = lab.textContent.trim().replace(/\s+\/\s*$/,'');
      if(labelMap[t] && !/class="en sub"/.test(lab.innerHTML)){
        lab.innerHTML = labelMap[t];
      }
    });
    document.querySelectorAll("textarea, input[placeholder]").forEach(el=>{
      const ph = el.getAttribute("placeholder")||"";
      if(/Notas forenses/.test(ph) && !/Forensic notes/.test(ph)){
        el.setAttribute("placeholder", "Notas forenses� / Forensic notes�");
      }
    });
  }

  const mapReason = [
    [/^Estrutura v�lida\.?$/i, "Structure valid"],
    [/Ano de produ��o inconsistente/i, "Production year inconsistent"],
    [/fora de 1998\+/i, "outside 1998+"],
    [/Ano do modelo n�o pode ser anterior/i, "Model year cannot be earlier than production year"],
    [/M[e�]s inv�lido/i, "Invalid month code"],
    [/Tamanho inv�lido/i, "Invalid length"],
    [/Formato EUA n�o admite 15/i, "US format does not allow 15"],
    [/Caracteres inv�lidos/i, "Invalid characters"],
    [/Pa[i�]s inv�lido/i, "Invalid country code"],
    [/Fabricante inv�lido/i, "Invalid manufacturer code"],
    [/Ano do modelo fora do intervalo/i, "Model year out of allowed range"],
    [/Pr�-?1998.*DoC\/CE/i, "Pre-1998 with DoC/CE"],
    [/Pr�-?1998.*falta DoC\/CE/i, "Pre-1998: missing DoC/CE"],
  ];
  function trReasonPTEN(text){
    if(!text) return "";
    const s = (""+text).trim();
    for(const [re,en] of mapReason){
      if(re.test(s)) return s + ' / <span class="en">'+ en +'</span>';
    }
    return s + ' / <span class="en">'+ s +'</span>';
  }

  function findInterpBody(){
    const el = document.getElementById("interpWinBody") || document.querySelector("table tbody");
    return el || null;
  }
  function isPre98FromDOM(){
    const badges = Array.from(document.querySelectorAll(".badge, [class*=badge]")).map(b=>b.textContent.toLowerCase());
    if (badges.some(t=>t.includes("pr�")||t.includes("pre-1998"))) return true;
    const reasons = Array.from(document.querySelectorAll("#winResult, .result, .status, .msg")).map(e=>e.textContent.toLowerCase()).join(" ");
    if (/pr[e�]-?1998/.test(reasons)) return true;
    return false;
  }
  function extractReasonText(){
    const candidates = document.querySelectorAll("#winResult, .result, .status, .msg, main, body");
    for(const el of candidates){
      const txt = el.textContent || "";
      const m = txt.match(/([^\n\.]{8,}(v�lid|inv�lid|1998|inconsis)[^\n\.]*\.)/i);
      if(m) return m[1].trim();
    }
    return "";
  }
  function getDoCInfo(){
    const ce = !!document.getElementById("doc_ce")?.checked;
    const nb = (document.getElementById("notified_body")?.value || "").trim();
    return {hasCE: ce, notifiedBody: nb};
  }
  function getEvidence(){
    const winEl = document.getElementById("win");
    let file = null;
    if (winEl){
      const left = winEl.closest("section, form, div") || document;
      const f = left.querySelector('input[type="file"]');
      if (f && f.files && f.files[0]) file = f.files[0];
    }
    if (!file) return null;
    let url = null;
    try{ url = URL.createObjectURL(file); }catch(e){}
    return {name:file.name, url};
  }
  function getForensicFlags(){
    const flags = [];
    const checks = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
    for (const ch of checks){
      const lab = ch.closest("label");
      if (!lab) continue;
      let txt = lab.textContent.trim().replace(/\s+\/\s*$/,'');
      if (/Certificado de Conformidade|Declaration of Conformity/i.test(txt)) continue;
      flags.push(txt);
    }
    return flags;
  }
  function pushRow(tbody, label, value, meaning){
    const tr = document.createElement("tr");
    tr.className = "idmar-extra";
    tr.innerHTML = `<td>${label}</td><td>${value}</td><td>${meaning}</td>`;
    tbody.appendChild(tr);
  }
  function enrichInterpretation(){
    const tbody = findInterpBody();
    if (!tbody) return;
    tbody.querySelectorAll("tr.idmar-extra").forEach(tr=>tr.remove());

    const reasonPT = extractReasonText();
    const reasonPTEN = trReasonPTEN(reasonPT);
    if (reasonPTEN) pushRow(tbody, "Justifica��o", reasonPT, reasonPTEN);

    const pre98 = isPre98FromDOM();
    const {hasCE, notifiedBody} = getDoCInfo();
    if (pre98){
      pushRow(tbody, "Base legal",
        "Avalia��o p�s-constru��o (Diretiva 94/25/CE alterada por 2003/44/CE)",
        "Post-construction assessment (EU RCD 94/25/EC amended by 2003/44/EC) � DoC/CE required");
      pushRow(tbody, "Regime", "Pr�-1998", "Pr�-1998 / <span class='en'>Pre-1998</span>");
      const nb = (notifiedBody||"-");
      pushRow(tbody, "Organismo notificado", nb, `DoC/CE${nb && nb!=="-" ? " � "+nb : ""} / <span class='en'>DoC/CE</span>`);
    }
    const ev = getEvidence();
    if (ev){
      const preview = ev.url ? `<div style="display:flex;gap:.5rem;align-items:center"><img class="mini-evidence" src="${ev.url}" alt="evidence"/><span>${ev.name}</span></div>` : ev.name;
      pushRow(tbody, "Evid�ncias", preview, "Fotografia / <span class='en'>Photo evidence</span>");
    }
    const flags = getForensicFlags();
    if (flags.length){
      pushRow(tbody, "Checklist forense", flags.join(" � "), "Checklist forense / <span class='en'>Forensic checklist</span>");
    }
  }

  function observeInterp(){
    const obs = new MutationObserver(()=>{
      clearTimeout(observeInterp._t);
      observeInterp._t = setTimeout(enrichInterpretation, 60);
    });
    obs.observe(document.body, {subtree:true, childList:true, characterData:true});
    enrichInterpretation();
  }

  document.addEventListener("DOMContentLoaded", function(){
    enstyle();
    i18nForense();
    observeInterp();
  });
})();
