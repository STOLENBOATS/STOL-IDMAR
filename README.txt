IDMAR validators (v1) — drop-in
--------------------------------
Ficheiros:
- js/validators/hull-id.v1.js  →  window.IDMARValidators.validateHullId(input)  (alias: validateWin)
- js/validators/engine-sn.v1.js → window.IDMARValidators.validateEngineSN(input) (alias: validateMotor)

Integração (após idmar-i18n.js):
  <script defer src="js/validators/hull-id.v1.js"></script>
  <script defer src="js/validators/engine-sn.v1.js"></script>

Ambos devolvem: { ok, type/brand, normalized, flat?, parsed, errors[], warnings[], score }