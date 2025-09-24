# Kit de labels para GitHub (IDMAR)

Script para criar/atualizar **labels** no repositório GitHub usando o **GitHub CLI (`gh`)**.

## O que cria
- **Priority:** `Priority:P0` (vermelho), `Priority:P1` (amarelo), `Priority:P2` (verde).
- **Epic:** `Epic:Reconstruction`, `Epic:Graph`, `Epic:Checklists`, `Epic:Offline`, `Epic:Forensics`, `Epic:Gateway LEA`, `Epic:Photo Reuse`, `Epic:Intel`, `Epic:Passport`, `Epic:Security`, `Epic:QA`, `Epic:DevOps` (com cores distintas e descrições).

## Pré-requisitos
- GitHub CLI instalado: https://cli.github.com/
- Autenticação ativa: `gh auth login`

## Como usar
```bash
# opção A: via variável de ambiente
REPO=owner/nome-do-repo ./create_labels.sh

# opção B: como argumento
./create_labels.sh owner/nome-do-repo
```

> Podes correr isto **antes** do kit de importação de issues, para os labels já existirem no repositório.
