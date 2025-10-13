(function (w) {
  "use strict";

  function norm(x){ return (x||"").trim().toUpperCase(); }

  function splitPrefixNumber(sn){
    // BAAL-999123 / BAAL999123 / BAAL 999123 / 6C1-1234567 �
    const s = norm(sn).replace(/\s+/g,'');
    const m = s.match(/^([A-Z0-9]+)[-\s]?(\d{4,})$/);
    if (m) return { prefix: m[1], serial: parseInt(m[2],10) };
    return { prefix: null, serial: null };
  }

  const BRAND = {
    Honda: {
      parse(sn){
        const { prefix, serial } = splitPrefixNumber(sn);
        if (!prefix || !serial) return null;
        return { brand:"Honda", prefix, serial, source: (/[A-Z]/.test(String(sn||"").charAt(0)) ? "exterior" : "interior") };
      }
    },
    Mercury: {
      parse(sn){
        const { prefix, serial } = splitPrefixNumber(sn);
        if (!prefix || !serial) return null;
        return { brand:"Mercury", prefix, serial };
      }
    }
    // TODO: Yamaha, Suzuki, Honda extra (model code), etc.
  };

  function parse(sn, brandHint){
    sn = norm(sn);
    if (!sn) return null;

    if (brandHint && BRAND[brandHint]) {
      const r = BRAND[brandHint].parse(sn);
      if (r) return r;
    }
    for (const k of Object.keys(BRAND)){
      const r = BRAND[k].parse(sn);
      if (r) return r;
    }
    return { ok:false, raw: sn };
  }

  w.IDMAR_EngineSN = { parse, splitPrefixNumber };
})(window);

