// Normaliza histórico Motor: garante .foto e .thumb no nível raiz
(() => {
  const K1 = 'history_motor', K2 = 'historyMotor';
  const raw = localStorage.getItem(K1) || localStorage.getItem(K2) || '[]';
  let list; try { list = JSON.parse(raw) || []; } catch { list = []; }

  let changed = false;
  list = list.map(x => {
    const foto  = x.foto  || x.fotoNome || x.meta?.foto  || '';
    const thumb = x.thumb || x.meta?.thumb || x.meta?.thumbnail || '';
    if (foto !== x.foto || thumb !== x.thumb) {
      changed = true;
      return { ...x, foto, thumb };
    }
    return x;
  });

  if (changed) {
    try {
      const s = JSON.stringify(list);
      localStorage.setItem(K1, s);
      localStorage.setItem(K2, s);
    } catch (_) {}
  }
  console.log('[sanitize-motor.r1] OK');
})();
