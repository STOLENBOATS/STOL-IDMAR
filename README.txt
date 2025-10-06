
IDMAR — Drop-in bilingual & Pre-1998 add-on (v4)
================================================
Include:

Historico pages (WIN & Motor):
  <script defer src="js/history-bilingual.v3.js"></script>

Validador page:
  <script defer src="js/validator-enhancements.v4.js"></script>

Notes:
- v4 no longer hooks internal functions; it watches the DOM instead.
- It appends rows to the Campo/Valor/Interpretação table with:
  * Justificação (PT+EN translation)
  * Base legal (PT/EN), Regime, Organismo notificado (when Pré‑1998)
  * Evidências (file name + preview thumbnail)
  * Checklist forense (summary of checked labels)
- Forensic labels in the validator show EN on a new line under PT.
