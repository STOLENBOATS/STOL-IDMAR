<section class="three">
  <!-- WIN -->
  <div class="panel" id="card-win">
    <h2>Validador WIN</h2>
    <form id="formWin">
      <label for="win">WIN / HIN</label>
      <input id="win" type="text" placeholder="Ex.: PT-ABC12345D404"/>
      <div style="margin:.5rem 0">
        <button id="btnWin" type="submit">Validar WIN</button>
      </div>
      <div style="margin-top:.5rem">
        <label for="winPhoto">Foto opcional / Optional photo</label>
        <input id="winPhoto" type="file" accept="image/*"/>
      </div>
      <div id="winOut" style="margin-top:.75rem"></div>
      <table>
        <thead>
          <tr><th>Campo / Field</th><th>Valor / Value</th><th>Interpretação / Meaning</th></tr>
        </thead>
        <tbody id="interpWinBody"></tbody>
      </table>
    </form>
  </div>

  <!-- MOTOR (como está) -->
  <div class="panel" id="card-motor">
    <h2>Validador Motor</h2>
    <form id="formMotor">
      <label for="brand">Marca</label>
      <select id="brand" data-engine-field="brand">
        <option>Yamaha</option><option>Honda</option><option>Suzuki</option><option>Tohatsu</option>
        <option>Mercury</option><option>MerCruiser</option><option>Volvo Penta</option>
        <option>Yanmar</option><option>Evinrude/Johnson</option>
      </select>

      <!-- aqui o JS (do teu picker) pode injetar campos dinâmicos -->
      <div id="brandDynamic"></div>

      <div style="margin-top:.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.5rem">
        <div>
          <label>Modelo (pesquisa)</label>
          <input id="srch_model" type="text" placeholder="Ex.: BF40A ou DF140A"
                 data-engine-field="model_code"/>
        </div>
        <div>
          <label>Potência (hp)</label>
          <input id="srch_power" type="text" placeholder="Ex.: 150"
                 data-engine-field="power"/>
        </div>
        <div>
          <label>Cilindrada (cc)</label>
          <input id="srch_disp" type="text" placeholder="Ex.: 2670"
                 data-engine-field="displacement"/>
        </div>
        <div>
          <label>Ano</label>
          <input id="srch_year" type="text" placeholder="Ex.: 2017"
                 data-engine-field="year"/>
        </div>
        <div>
          <label>Origem</label>
          <input id="srch_origin" type="text" placeholder="Ex.: Japão"
                 data-engine-field="origin"/>
        </div>
      </div>

      <div style="margin:.5rem 0">
        <button id="btnMotor" type="submit">Validar Motor</button>
      </div>

      <div style="margin-top:.5rem">
        <label for="motorPhoto">Foto opcional / Optional photo</label>
        <input id="motorPhoto" type="file" accept="image/*"/>
      </div>

      <div id="motorOut" style="margin-top:.75rem"></div>
    </form>
  </div>

  <!-- Nº de motor — interligado ao cartão do Motor -->
  <div class="panel" id="card-serial">
    <h2>Nº do motor / Engine serial</h2>

    <!-- Entrada única (auto-parse) -->
    <input id="engine-sn-raw" type="text"
           placeholder="Ex.: BF40A-BAAL-1234567, BAAL-1234567, 1B123456"
           autocomplete="off" />

    <!-- Honda: exterior/interior (dois números) -->
    <div class="sn-kind" style="margin-top:.5rem">
      <label><input type="radio" name="engine-sn-kind" value="auto" checked> Auto</label>
      <label><input type="radio" name="engine-sn-kind" value="exterior"> Exterior</label>
      <label><input type="radio" name="engine-sn-kind" value="interior"> Interior</label>
    </div>

    <!-- Janela(s) de intervalo calculadas a partir do cartão do Motor -->
    <div id="engine-sn-window" class="mt-2"></div>

    <!-- Resultado/Notas -->
    <small id="engine-sn-hints" class="muted"></small>
    <div id="engine-sn-result" class="mt-2"></div>
  </div>
</section>
