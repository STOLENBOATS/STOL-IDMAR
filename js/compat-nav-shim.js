/*! IDMAR compat shim r3 ï¿½ fornece window.NAV para mï¿½dulos antigos */
(function (w) {
  w.IDMAR = w.IDMAR || {};
  w.NAV = w.NAV || w.IDMAR;

  // Utils mï¿½nimos (apenas se nï¿½o existirem)
  NAV.util = NAV.util || {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    on: (el, ev, fn) => el && el.addEventListener(ev, fn),
  };

  // Ponte para o histï¿½rico novo, se existir
  if (w.IDMAR_HIST && !NAV.history) NAV.history = w.IDMAR_HIST;

  // No-ops seguros
  NAV.toast = NAV.toast || function(){/* noop */};
  NAV.log = NAV.log || function(){/* noop */};
})(window);




