# IDMAR Headers Pack v1

Quatro scripts prontos para injetar o header nas páginas:

- `js/header-validador.js` → **validador.html**
- `js/header-historico-win.js` → **historico_win.html**
- `js/header-historico-motor.js` → **historico_motor.html**
- `js/header-forense.js` → **forense.html**

## Como usar

1. Copia a pasta `js/` para o teu repositório (ou coloca os ficheiros no teu `js/`).
2. Em cada página, adiciona no `<head>` a linha correspondente, por ex. em `validador.html`:

```html
<script defer src="js/header-validador.js?v=1"></script>
```

3. Remove headers antigos/duplicados da página, se existirem.

> Os scripts usam o logo em `img/logo-pm.png`. Se o teu logo estiver noutra pasta, altera a linha `logo.src` nos scripts.
