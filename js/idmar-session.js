/*! IDMAR session gate r2 */
(function(){
  try {
    var p = location.pathname;
    var isLogin = /(?:^|\/)(login\.html)?$/i.test(p) || /(?:^|\/)index\.html$/i.test(p) && !/validador\.html|historico|forense\.html/i.test(p);
    var has = sessionStorage.getItem('IDMAR_SESSION') || sessionStorage.getItem('NAV_SESSION');
    if (!has && !isLogin) { location.replace('login.html'); }
  } catch(e) { /* ignore */ }
})();
