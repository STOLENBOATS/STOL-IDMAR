// idmar-version.v4.js — safe footer injector (fixed)
(function (w, d) {
  function today() {
    const dt = new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const da = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }
  function label() {
    const ver = (w.IDMAR_VERSION && String(w.IDMAR_VERSION).trim()) || "Vs 1.3";
    return `IDMAR — POLÍCIA MARÍTIMA — ${ver} — ${today()}`;
  }
  function inject() {
    try {
      var f = d.getElementById("app-footer") || d.querySelector("footer");
      if (!f) return;
      var wrap = d.createElement("div");
      wrap.style.display = "flex";
      wrap.style.justifyContent = "space-between";
      wrap.style.alignItems = "center";
      var left = d.createElement("div");
      left.innerHTML = f.innerHTML;
      var right = d.createElement("small");
      right.textContent = label();
      right.style.opacity = "0.9";
      f.innerHTML = "";
      wrap.appendChild(left);
      wrap.appendChild(right);
      f.appendChild(wrap);
      // debug simples (podes tirar)
      console.log("[IDMAR] version footer injected");
    } catch (e) {
      console.warn("[IDMAR] version inject failed:", e);
    }
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", inject);
  else inject();
})(window, document);

