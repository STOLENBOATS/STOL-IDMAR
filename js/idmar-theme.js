/*! IDMAR theme r2 */
(function(){
  try{
    var pref = localStorage.getItem('idmar-theme') || 'light';
    document.documentElement.dataset.theme = pref;
    window.IDMAR_setTheme = function(next){
      if(!next){ next = (localStorage.getItem('idmar-theme')==='dark')?'light':'dark'; }
      localStorage.setItem('idmar-theme', next);
      document.documentElement.dataset.theme = next;
    };
  }catch(e){}
})();
