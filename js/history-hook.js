/*! IDMAR history hook r2 */
document.addEventListener('DOMContentLoaded', ()=>{
  const winForm = document.querySelector('form#winForm, form[data-form="win"], form[action*="win"]');
  const winInput = document.querySelector('#winInput, input[name="win"], input[name="hin"]');
  const winBtn = document.querySelector('#btnWin, button[name="validate_win"], button#validateWin');
  function grabWinStatus(){
    const el = document.querySelector('#win-output .status, #win-output .resultado, #winResult .status, #winResult, .win-result .status');
    const txt = el && el.textContent || '';
    let status='';
    if(/inv[aá]lid/i.test(txt)) status='inválido';
    else if(/v[aá]lid/i.test(txt)) status='válido';
    return status;
  }
  function saveWin(){
    const val = (winInput && winInput.value || '').trim();
    if(!val) return;
    const status = grabWinStatus();
    window.IDMAR_HIST && IDMAR_HIST.save('win', { type:'win', win: val, status });
  }
  if(winForm){ winForm.addEventListener('submit', ()=> setTimeout(saveWin, 60)); }
  if(winBtn){ winBtn.addEventListener('click', ()=> setTimeout(saveWin, 60)); }

  const motorForm = document.querySelector('form#motorForm, form[data-form="motor"], form[action*="motor"]');
  const snInput = document.querySelector('#snInput, input[name="serial"], input[name="sn"], input[name="engine_sn"]');
  const brandSel = document.querySelector('#brandSelect, select[name="brand"], select[name="marca"]');
  const modelInput = document.querySelector('#modelInput, input[name="model"], input[name="modelo"]');
  const motorBtn = document.querySelector('#btnMotor, button[name="validate_motor"], button#validateMotor');
  function grabMotorStatus(){
    const el = document.querySelector('#motor-output .status, #motor-output .resultado, #motorResult .status, #motorResult, .motor-result .status');
    const txt = el && el.textContent || '';
    let status='';
    if(/inv[aá]lid/i.test(txt)) status='inválido';
    else if(/v[aá]lid/i.test(txt)) status='válido';
    return status;
  }
  function saveMotor(){
    const sn = (snInput && snInput.value || '').trim();
    if(!sn) return;
    const brand = (brandSel && brandSel.value) || '';
    const model = (modelInput && modelInput.value) || '';
    const status = grabMotorStatus();
    window.IDMAR_HIST && IDMAR_HIST.save('motor', { type:'motor', sn, brand, model, status });
  }
  if(motorForm){ motorForm.addEventListener('submit', ()=> setTimeout(saveMotor, 60)); }
  if(motorBtn){ motorBtn.addEventListener('click', ()=> setTimeout(saveMotor, 60)); }
});
