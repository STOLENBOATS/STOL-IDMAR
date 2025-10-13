// utf8-sweep.v1.js — tenta reparar mojibake visível no DOM (labels, placeholders, options)
(function () {
  "use strict";

  // Só tenta quando há sinais de mojibake
  const hasMojibake = (s) => /Ã|�/.test(s);

  // Converte string latin-1 -> bytes -> decode como UTF-8
  function latin1ToUtf8Once(s) {
    try {
      const bytes = new Uint8Array([...s].map(ch => ch.charCodeAt(0) & 0xFF));
      const decoded = new TextDecoder("utf-8").decode(bytes);
      return decoded;
    } catch (e) { return s; }
  }

  // Corrige um nó de texto se detetar mojibake
  function fixTextNode(node) {
    const src = node.nodeValue;
    if (!src || !hasMojibake(src)) return;
    const fix = latin1ToUtf8Once(src);
    // só aplica se parecer português real (evita mexer em JS inline, etc.)
    if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(fix)) node.nodeValue = fix;
  }

  function sweep(root) {
    // 1) todos os textNodes em cartões e labels
    const scope = root.querySelectorAll(
      "#card-win, #card-motor, #card-serial, main h1, h2, label, button, summary, th, td"
    );
    scope.forEach(el => {
      el.childNodes.forEach(n => { if (n.nodeType === 3) fixTextNode(n); });
    });

    // 2) placeholders
    root.querySelectorAll("input, textarea").forEach(el => {
      const p = el.getAttribute("placeholder");
      if (p && hasMojibake(p)) {
        const fix = latin1ToUtf8Once(p);
        if (/[áàâãéêíóôõúç]/i.test(fix)) el.setAttribute("placeholder", fix);
      }
    });

    // 3) <option> de <select>
    root.querySelectorAll("select option").forEach(op => {
      const t = op.textContent || "";
      if (hasMojibake(t)) {
        const fix = latin1ToUtf8Once(t);
        if (/[áàâãéêíóôõúç]/i.test(fix)) op.textContent = fix;
      }
    });

    // 4) correções pontuais que queremos garantir (ex.: rotação/hélice)
    root.querySelectorAll("#card-motor label").forEach(lab => {
      const t = (lab.textContent || "").toLowerCase();
      if (t.includes("rota") && (t.includes("hlice") || t.includes("h�lice") || t.includes("hélice") || t.includes("propeller"))) {
        lab.innerHTML = 'Rotação (hélice / propeller) <span class="small">/ Rotation (propeller)</span>';
      }
    });
  }

  function run() {
    sweep(document);

    // Se scripts posteriores mudarem texto, observamos e reaplicamos onde necessário
    const mo = new MutationObserver((muts) => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) sweep(n); // elemento
          else if (n.nodeType === 3) fixTextNode(n); // texto
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();

