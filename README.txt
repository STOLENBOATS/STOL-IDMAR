IDMAR — i18n + Forense r5 pack
Arquivos incluídos (colocar em /js):
- idmar-i18n.js        → motor de traduções PT/EN
- idmar-header-only.all.v4.js → header com toggle de idioma (usa i18n)
- forense-r5.js        → versão consolidada do Forense (r1a+r2+r3+r4)

Como integrar (ordem no <head>):
1) <script defer src="js/idmar-i18n.js?v=1"></script>
2) <script defer src="js/idmar-header-only.all.v4.js?v=4"></script>
3) (na forense.html) <script defer src="js/forense-r5.js?v=r5"></script>

No HTML, opcionalmente marca elementos com:
- data-i18n="forense.title" (texto)
- data-i18n-placeholder="forense.notes" (placeholder de inputs/textarea)
- data-i18n-aria="..." (aria-label)

A navegação e o título/subtítulo do header são traduzidos automaticamente.
