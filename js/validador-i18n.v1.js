// validador-i18n.v1.js — overlay PT/EN para a página Validador
(function () {
  "use strict";

  // helper para aplicar "PT / EN" sem partir HTML interno
  function setDual(el, pt, en) {
    if (!el) return;
    const onlyText = el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3;
    if (onlyText) {
      el.innerHTML = `${pt} <span class="small">/ ${en}</span>`;
    } else {
      // não sobrescrever conteúdo rico: meter fallback no title
      const base = (el.textContent || "").trim();
      el.title = base ? `${base} — ${pt} / ${en}` : `${pt} / ${en}`;
    }
  }

  // mapeamento simples "por texto exato" (para etiquetas fixas)
  function byText(root, selector, map) {
    root.querySelectorAll(selector).forEach((el) => {
      const t = (el.textContent || "").trim();
      const key = Object.keys(map).find((k) => {
        if (k.endsWith("*")) return t.toLowerCase().startsWith(k.slice(0, -1).toLowerCase());
        return t.toLowerCase() === k.toLowerCase();
      });
      if (!key) return;
      const val = map[key];
      if (typeof val === "string") {
        el.textContent = val;
      } else {
        setDual(el, val.pt, val.en);
      }
    });
  }

  function apply() {
    const root = document;

    // ---- Títulos
    const h1 = root.querySelector("main h1");
    setDual(h1, "Validador", "Validator");

    setDual(root.querySelector("#card-win h2"), "Validador WIN", "WIN validator");
    setDual(root.querySelector("#card-motor h2"), "Validador Motor", "Engine validator");
    setDual(root.querySelector("#card-serial h2"), "Nº do motor", "Engine serial");

    // ---- Cartão Motor: rótulos mais comuns que às vezes ficam só PT
    byText(root, "#card-motor label", {
      "Marca": { pt: "Marca", en: "Brand" },
      "Família": { pt: "Família", en: "Family" },
      "Potência (hp)": { pt: "Potência (hp)", en: "Power (hp)" },
      "Comando / Rigging": { pt: "Comando", en: "Rigging" },
      "Altura de coluna / Shaft": { pt: "Altura de coluna", en: "Shaft" },
      "Rotação / Rotation (hélice / propeller)*": { pt: "Rotação (hélice / propeller)", en: "Rotation (propeller)" },
      "Cor / Color": { pt: "Cor", en: "Color" },
      "Caixa de engrenagens / Gearcase": { pt: "Caixa de engrenagens", en: "Gearcase" },
      "Ano / Year": { pt: "Ano", en: "Year" },
      "Modelo / Model code": { pt: "Modelo", en: "Model code" },
      "Modelo (pesquisa)": { pt: "Modelo (pesquisa)", en: "Model (search)" },
      "Origem": { pt: "Origem", en: "Origin" },
      "Cilindrada (cc)": { pt: "Cilindrada (cc)", en: "Displacement (cc)" },
    });

    // ---- Cartão Nº do motor
    const snInput = root.getElementById("engine-sn-raw");
    if (snInput) {
      snInput.placeholder = "Ex.: BF40A-BAAL-1234567, BAAL-1234567, 1B123456";
    }

    // Radio labels: Auto / Exterior / Interior (bilíngue)
    const kindWrap = root.querySelector("#card-serial .sn-kind");
    if (kindWrap) {
      const labs = kindWrap.querySelectorAll("label");
      // ordem esperada: auto, exterior, interior
      const lbls = [
        { pt: "Auto", en: "Auto" },
        { pt: "Exterior", en: "External" },
        { pt: "Interior", en: "Internal" },
      ];
      labs.forEach((lab, i) => {
        const inp = lab.querySelector("input");
        const txt = lab.querySelector("span") || document.createElement("span");
        txt.className = "sn-kind-text";
        setDual(txt, lbls[i]?.pt || lab.textContent.trim(), lbls[i]?.en || "");
        if (!lab.querySelector("span")) {
          // reconstruir label mantendo o input
          lab.textContent = "";
          if (inp) lab.appendChild(inp);
          lab.appendChild(txt);
        }
      });
    }

    // Mensagens fixas do painel de série (quando não há ranges)
    const hints = root.getElementById("engine-sn-hints");
    if (hints && !hints.dataset.i18nApplied) {
      // se o painel JS meter PT apenas, nós garantimos a forma PT/EN
      const txt = (hints.textContent || "").trim();
      if (!txt || /Sem janelas/i.test(txt)) {
        hints.innerHTML =
          'Sem janelas conhecidas para a seleção atual. <span class="small">/ No known ranges for the current selection.</span>';
      }
      hints.dataset.i18nApplied = "1";
    }

    // Se o JS do painel escrever “Dentro da faixa…” / “Fora da faixa…”, aplicamos dual a seguir
    const res = root.getElementById("engine-sn-result");
    if (res && !res.dataset.i18nHooked) {
      const mo = new MutationObserver(() => {
        res.querySelectorAll("*").forEach((el) => {
          const t = (el.textContent || "").trim().toLowerCase();
          if (/dentro da faixa/.test(t)) {
            setDual(el, el.textContent.trim(), "Within the expected range.");
          } else if (/fora da faixa|não reconhecido|nao reconhecido/.test(t)) {
            setDual(el, el.textContent.trim(), "Outside expected range / Not recognized.");
          }
        });
      });
      mo.observe(res, { childList: true, subtree: true });
      res.dataset.i18nHooked = "1";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();
