/* theme */
(function(){try{var pref=localStorage.getItem('idmar-theme')||'light';document.documentElement.setAttribute('data-theme',pref);window.IDMAR_setTheme=function(next){if(!next){next=(localStorage.getItem('idmar-theme')==='dark')?'light':'dark';}localStorage.setItem('idmar-theme',next);document.documentElement.setAttribute('data-theme',next);};}catch(e){}})();
