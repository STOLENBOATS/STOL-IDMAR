/* IDMAR — patch-validador-foto.r1.js
   Após validares WIN/Motor, se houver ficheiro nos inputs #winPhoto/#motorPhoto,
   chama o ForenseAttachCompat para anexar ao registo mais recente.
*/
(function(){
  const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
  function byId(id){ return document.getElementById(id); }

  async function afterWinSubmit(){
    const inp = byId('winPhoto');
    if (inp && inp.files && inp.files[0]){
      await wait(30); // dá tempo ao r3b para escrever o histórico
      window.ForenseAttachCompat?.attachWIN(inp.files[0]);
    }
  }
  async function afterMotorSubmit(){
    const inp = byId('motorPhoto');
    if (inp && inp.files && inp.files[0]){
      await wait(30);
      window.ForenseAttachCompat?.attachMotor(inp.files[0]);
    }
  }

  function bind(){
    // WIN
    const fWin = byId('formWin');
    const btnW = byId('btnWin');
    if (fWin) fWin.addEventListener('submit', ()=> setTimeout(afterWinSubmit, 0));
    if (btnW) btnW.addEventListener('click', ()=> setTimeout(afterWinSubmit, 0));

    // Motor
    const fM = byId('formMotor');
    const btnM = byId('btnMotor');
    if (fM) fM.addEventListener('submit', ()=> setTimeout(afterMotorSubmit, 0));
    if (btnM) btnM.addEventListener('click', ()=> setTimeout(afterMotorSubmit, 0));
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

