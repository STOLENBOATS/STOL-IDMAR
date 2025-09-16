/*! IDMAR history core r2 */
(function(global){
  const KEYS = { win:'hist_win', motor:'hist_motor' };
  function _now(){ return Date.now(); }
  function _iso(ts){ try{ return new Date(ts).toISOString(); }catch(e){ return ''; } }
  function save(type, rec){
    const key = KEYS[type]; if(!key) return;
    try{
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const ts = rec.ts || _now();
      const entry = Object.assign({ ts, when:_iso(ts) }, rec);
      list.push(entry);
      const trimmed = list.slice(-1000);
      localStorage.setItem(key, JSON.stringify(trimmed));
      return entry;
    }catch(e){ console.error('IDMAR history save error', e); }
  }
  function all(type){
    const key = KEYS[type]; if(!key) return [];
    try{ return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch(e){ return []; }
  }
  function clear(type){
    const key = KEYS[type]; if(!key) return;
    localStorage.removeItem(key);
  }
  function filter(list, opts){
    opts = opts||{};
    return list.filter(r=>{
      if(opts.query){
        const q = opts.query.toLowerCase();
        const hay = [r.win||'',r.nuipc||'',r.sn||'',r.brand||'',r.model||'',r.notes||''].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      if(Array.isArray(opts.status) && opts.status.length){
        if(!opts.status.includes((r.status||'').toLowerCase())) return false;
      }
      if(opts.brand && r.brand && r.brand!==opts.brand) return false;
      if(opts.from || opts.to){
        const ts = r.ts||0;
        if(opts.from && ts < opts.from) return false;
        if(opts.to && ts > opts.to) return false;
      }
      return true;
    });
  }
  function toCSV(type, list){
    const cols = ['when','type','win','sn','brand','model','status','photo','notes'];
    const hdr = cols.join(',');
    const rows = list.map(r=>cols.map(k=>JSON.stringify(r[k]||'')).join(','));
    const blob = [hdr].concat(rows).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([blob], {type:'text/csv;charset=utf-8;'}));
    a.download = 'idmar_'+type+'_historico.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  global.IDMAR_HIST = { save, all, clear, filter, toCSV };
})(window);
