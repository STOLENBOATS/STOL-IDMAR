# Import automático de issues no GitHub (IDMAR)

Este kit cria **milestones** e **issues** a partir do `IDMAR-backlog.csv` usando o **GitHub CLI (`gh`)**.

## Pré-requisitos
- GitHub CLI instalado: https://cli.github.com/
- Autenticação ativa: `gh auth login`
- Permissões para criar milestones e issues no repositório-alvo.

## Ficheiros
- `IDMAR-backlog.csv` — backlog com Epics, prioridade, estimativa e milestone.
- `create_github_issues.py` — script que chama o `gh` e cria tudo.
- `.env.example` — exemplo de variáveis de ambiente.

## Como correr
```bash
# 1) entrar na pasta
cd idmar_gh_import

# 2) autenticar no gh (se ainda não estiver)
gh auth login

# 3) dry-run (opcional: só mostra comandos)
DRY_RUN=1 REPO=owner/nome-do-repo python3 create_github_issues.py

# 4) executar a criação
REPO=owner/nome-do-repo python3 create_github_issues.py

# ou especificando CSV por argumento
REPO=owner/nome-do-repo python3 create_github_issues.py owner/nome-do-repo IDMAR-backlog.csv
```

## Notas
- O script cria **milestones**: Phase 1, Phase 2, Phase 3 (se não existirem).
- Cada issue recebe **labels**: `Epic:<nome>` e `Priority:<Px>`.
- O campo **Estimate** vai no corpo da issue (podes ligar com Projects depois).
- Usa `DRY_RUN=1` para testar sem criar nada.

## Dica
- Para ver resultados: `gh issue list --repo owner/nome-do-repo`
