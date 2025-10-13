ï»¿// Forensic rules rendering per brand (skeleton; to be enriched with your domain notes)
(function(){
  const q = new URLSearchParams(location.search);
  const initial = q.get('brand') || '';
  const rulesDiv = document.getElementById('rules');
  const pick = document.getElementById('brandPick');
  if(initial){ pick.value = initial; }
  pick.addEventListener('change', render);
  render();

  function render(){
    const b = pick.value;
    rulesDiv.innerHTML = '';
    if(!b){ return; }
    const frag = document.createDocumentFragment();
    frag.appendChild(card('Identificaï¿½ï¿½o principal / Primary identification', primary(b)));
    frag.appendChild(card('Padrï¿½es & cï¿½digos / Patterns & codes', patterns(b)));
    frag.appendChild(card('Observaï¿½ï¿½es periciais / Forensic notes', notes(b)));
    frag.appendChild(card('Red flags / Inconsistï¿½ncias', redflags(b)));
    rulesDiv.appendChild(frag);
  }

  function card(title, bodyHtml){
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<h3>${title}</h3>${bodyHtml}`;
    return el;
  }

  function primary(brand){
    switch(brand){
      case 'Yamaha':
        return `<ul>
          <li><b>Placa lateral do motor</b> ï¿½ Modelo, Cï¿½digo (ex.: <span class="mono">6D0</span>), Letra, Nï¿½ Sï¿½rie.<span class="sub-en">(Side tag ï¿½ Model, Code, Letter, S/N.)</span></li>
          <li><b>Bloco</b> ï¿½ carimbos em zonas crï¿½ticas.<span class="sub-en">(Stamped areas on block.)</span></li>
        </ul>`;
      case 'Honda':
        return `<ul>
          <li><b>Placa</b> ï¿½ Modelo (ex.: <span class="mono">BF90D</span>), Frame/Cï¿½digo, Nï¿½ Sï¿½rie.<span class="sub-en">(Tag ï¿½ Model, Frame/Code, S/N.)</span></li>
        </ul>`;
      case 'Mercury':
        return `<ul>
          <li><b>Etiqueta</b> ï¿½ Nï¿½ Sï¿½rie (ex.: <span class="mono">1B123456</span>), Modelo.<span class="sub-en">(Sticker ï¿½ Serial, Model.)</span></li>
        </ul>`;
      case 'Suzuki':
        return `<ul>
          <li><b>Placa</b> ï¿½ Modelo (ex.: <span class="mono">DF90A</span>), Nï¿½ Sï¿½rie.<span class="sub-en">(Tag ï¿½ Model, S/N.)</span></li>
        </ul>`;
      case 'Volvo Penta':
        return `<ul>
          <li><b>Plate</b> ï¿½ Modelo, <b>N.ï¿½ Produto (P/N)</b>, Nï¿½ Sï¿½rie.<span class="sub-en">(Model, Product No, Serial)</span></li>
          <li><b>Localizaï¿½ï¿½o</b>: placa lateral/bloco; alguns modelos tï¿½m etiqueta extra no corpo de borboleta.<span class="sub-en">(Plate on side/block; some models have extra label on throttle body.)</span></li>
        </ul>`;
      case 'Evinrude':
        return `<ul>
          <li><b>Placa</b> ï¿½ Modelo (ex.: <span class="mono">E90DPXSUR</span>), Tipo/BOM, Nï¿½ Sï¿½rie.<span class="sub-en">(Model, Type/BOM, Serial)</span></li>
        </ul>`;
      case 'Selva':
        return `<ul><li><b>Placa</b> ï¿½ Modelo, Nï¿½ Sï¿½rie.</li></ul>`;
      case 'Tohatsu':
        return `<ul><li><b>Placa</b> ï¿½ Modelo, Nï¿½ Sï¿½rie.</li></ul>`;
    }
    return '';
  }

  function patterns(brand){
    switch(brand){
      case 'Mercury':
        return `<p>Prefixos de sï¿½rie comuns: <span class="mono">0C, 0D, 0G, 0T, 1A, 1B, 1C, 1D, 2B</span> ï¿½ sugerem faixa de anos.<span class="sub-en">(Common serial prefixes ï¿½ suggest year ranges.)</span></p>`;
      case 'Suzuki':
        return `<p>Modelos tï¿½picos: <span class="mono">DF/DT</span> + potï¿½ncia (ex.: <span class="mono">DF90A</span>).<span class="sub-en">(Model pattern: DF/DT + power.)</span></p>`;
      case 'Volvo Penta':
        return `<p>Diesel: <span class="mono">D4, D6, TAMD, TMD, AD, AQD, KADï¿½</span><br>Gasolina: <span class="mono">4.3GL/GXi, 5.0GXi, 5.7GXi, V6-240/V8-280ï¿½</span><span class="sub-en">(Common model families)</span></p>`;
      default:
        return `<p class="muted">A definir.<span class="sub-en">(To be defined.)</span></p>`;
    }
  }

  function notes(brand){
    return `<p class="muted">Notas periciais por marca a preencher.<span class="sub-en">(Brand-specific forensic notes to fill.)</span></p>`;
  }

  function redflags(brand){
    return `<ul>
      <li>Remarcaï¿½ï¿½es, desalinhamentos, corrosï¿½o seletiva.<span class="sub-en">(Re-stamping, misalignment, selective corrosion.)</span></li>
      <li>Incoerï¿½ncia entre <b>Modelo</b> e <b>N.ï¿½ Sï¿½rie</b> / ano.<span class="sub-en">(Model vs Serial/year inconsistency.)</span></li>
    </ul>`;
  }

  // If brand passed in URL, render immediately
  if(initial){ render(); }
})();


