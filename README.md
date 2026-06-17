# Claudete

Repositório de testes e experimentos com Claude Code.

## Sobre

Este projeto foi criado para explorar o fluxo de trabalho com Claude Code, incluindo criação de repositórios, commits e pull requests.

## Como usar

Clone o repositório e explore os arquivos disponíveis:

```bash
git clone https://github.com/kauan18/Claudete.git
cd Claudete
```

## OdontoApp — SaaS odontológico

O principal projeto deste repositório é o **OdontoApp** (`odontoapp/`): um SaaS multi-tenant
para consultórios odontológicos (Next.js 15 + Prisma + PostgreSQL + NextAuth). Cada clínica
tem site público próprio em `/c/<slug>`, painel administrativo, agendamento online,
portfólio de casos (antes/depois), integração com WhatsApp e agente de IA.

### Rodar localmente
- **Atalho de 1 clique:** dê dois cliques em `OdontoApp.bat` (Área de Trabalho), ou rode
  `odontoapp/start-local.bat`.
- **Manual:**
  ```bash
  cd odontoapp
  npm install
  npx prisma db push
  npx tsx prisma/seed.ts
  npm run dev   # http://localhost:3000
  ```

### Publicar / lançar
Veja o guia completo em **[DEPLOY.md](DEPLOY.md)** (local, produção local e Vercel + Postgres na nuvem).

## Contribuindo

Sinta-se à vontade para abrir issues e pull requests.
