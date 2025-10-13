/*! IDMAR compat shim r3 � fornece window.NAV para m�dulos antigos */
(function (w) {
  w.IDMAR = w.IDMAR || {};
  w.NAV = w.NAV || w.IDMAR;

  // Utils m�nimos (apenas se n�o existirem)
  NAV.util = NAV.util || {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    on: (el, ev, fn) => el && el.addEventListener(ev, fn),
  };

  // Ponte para o hist�rico novo, se existir
  if (w.IDMAR_HIST && !NAV.history) NAV.history = w.IDMAR_HIST;

  // No-ops seguros
  NAV.toast = NAV.toast || function(){/* noop */};
  NAV.log = NAV.log || function(){/* noop */};
})(window);

