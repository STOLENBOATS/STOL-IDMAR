// idmar-version.v4.js — fixed safe footer injector
(function(w,d){
  function today(){
    const dt = new Date();
    const y  = dt.getFullYear();
    const m  = String(dt.getMonth()+1).padStart(2,'0');
    const da = String(dt.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  }
  function label(){
    return `IDMAR - POLÍCIA MARÍTIMA - ${w.IDMAR_VERSION||'Vs 1.3'} - ${today()}`;
  }
  function inject(){
    try{
      var f = d.getElementById('app-footer') || d.querySelector('footer');
      if(!f) return;
      var s = d.createElement('small');
      s.style.opacity='0.9';
      s.textContent = label();
      f.appendChild(document.createTextNode(' '));
      f.appendChild(s);
    }catch(e){}
  }
  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', inject); else inject();
})(window,document);
