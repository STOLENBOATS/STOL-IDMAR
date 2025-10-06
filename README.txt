
IDMAR — Drop-in bilingual & Pre-1998 add-on (v2)
================================================

This patch DOES NOT replace your existing files. Just include the two scripts
*after* your current ones, and they will enhance the UI on top of what you have.

Files:
- js/history-bilingual.v2.js
- js/validator-enhancements.v2.js

How to include:

A) Historico WIN & Historico Motor (both pages)
-----------------------------------------------
Add the following line at the end of <body>, after your existing JS includes:

  <script defer src="js/history-bilingual.v2.js"></script>

B) Validador (validador.html)
-----------------------------
Add the following line at the end of <body>, after your existing JS includes:

  <script defer src="js/validator-enhancements.v2.js"></script>

What you get:
- History pages: "Estado" shows "Válido / Valid", "Inválido / Invalid", "Pré‑1998 / Pre‑1998".
  "Justificação" becomes bilingual (PT + EN). Works on existing rows and keeps watching for changes.
- Validator page:
  * Forensic blocks (both WIN and Motor panels) get bilingual labels and placeholders.
  * Pre‑1998 interpretation gains:
      • Base legal (PT/EN) about Post‑construction assessment (EU RCD 94/25/EC amended by 2003/44/EC)
      • Organismo notificado (shown if provided)
      • Evidências: shows the uploaded photo name and an inline thumbnail (object URL) if available
      • Checklist forense: lists the checked items as a summary (PT/EN heading)

No other behaviour is changed.
