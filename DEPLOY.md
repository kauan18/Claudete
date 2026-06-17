# 🚀 Guia de Lançamento — OdontoApp

Este guia cobre três formas de acessar/publicar o SaaS, da mais simples à definitiva.

---

## 1. Acesso local rápido (1 clique) — para usar e demonstrar agora

Já existe um atalho pronto: **`OdontoApp.bat`** na sua Área de Trabalho.

- **Dê dois cliques** → o servidor sobe e o navegador abre em `http://localhost:3000/c/sorriso-perfeito`.
- Para **parar**, feche a janela preta do terminal.
- Funciona apenas **neste PC** e **enquanto o PC estiver ligado**.

> O launcher real fica em `odontoapp/start-local.bat` (versionado no projeto). O `.bat` da Área de Trabalho apenas o chama.

**Login do painel:** `http://localhost:3000/login`
- Admin da clínica: `admin@sorrisoperfeito.com.br` / `Admin@123`
- Super-admin: `super@odontoapp.com` / `SuperAdmin@123`

---

## 2. Modo produção local (mais rápido que o dev)

Para rodar otimizado na própria máquina:

```powershell
cd odontoapp
npm run build
npm run start   # sobe em http://localhost:3000
```

Use isto quando quiser performance de produção sem publicar online.

---

## 3. Publicar online (Vercel + PostgreSQL na nuvem) — o caminho definitivo

Deixa o app no ar 24/7 com URL pública, acessível de qualquer lugar (inclusive celular).

### Passo 1 — Banco de dados na nuvem (grátis)
Crie um PostgreSQL gerenciado em **[Neon](https://neon.tech)** ou **[Supabase](https://supabase.com)**.
Copie a connection string (formato `postgresql://user:senha@host/db?sslmode=require`).

### Passo 2 — Subir o código pro GitHub
O repositório já está em `github.com/kauan18/Claudete`. Garanta que está atualizado:
```powershell
git push origin master
```

### Passo 3 — Importar na Vercel
1. Em **[vercel.com](https://vercel.com)** → *New Project* → importe o repositório.
2. **Root Directory:** selecione a pasta `odontoapp`.
3. Framework: *Next.js* (detectado automaticamente).

### Passo 4 — Variáveis de ambiente (Project Settings → Environment Variables)
Use o `odontoapp/.env.example` como referência. Mínimo para subir:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | string do Neon/Supabase (passo 1) |
| `AUTH_SECRET` | gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | a URL pública da Vercel (ex: `https://seuapp.vercel.app`) |
| `ANTHROPIC_API_KEY` | sua chave da Anthropic (opcional — sem ela o chat usa fallback) |
| `CRON_SECRET` | gere com `openssl rand -base64 32` (lembretes WhatsApp) |

### Passo 5 — Migrar o schema e popular dados
Localmente, apontando o `DATABASE_URL` para o banco da nuvem:
```powershell
cd odontoapp
npx prisma db push          # cria as tabelas
npx tsx prisma/seed.ts      # cria clínica demo + usuários (TROQUE as senhas depois!)
```

### Passo 6 — Deploy
A Vercel faz o build e publica. Pronto: `https://seuapp.vercel.app/c/sorriso-perfeito`.

---

## ⚠️ Antes de vender de verdade (checklist de produção)

- [ ] **Trocar as senhas do seed** — `admin@sorrisoperfeito.com.br` e `super@odontoapp.com` usam senhas públicas deste repositório.
- [ ] **Inserir `ANTHROPIC_API_KEY`** para ativar o agente de IA real (hoje em modo fallback).
- [ ] **Upload de imagens em produção:** na Vercel o sistema de arquivos é efêmero — uploads gravados em `public/uploads/` **não persistem**. Para produção, migrar o `POST /api/upload` para **Vercel Blob** ou **Cloudflare R2** (o código está isolado em `src/app/api/upload/route.ts`, troca só a parte de gravação). Em VPS/servidor próprio, a gravação em disco funciona normalmente.
- [ ] **Domínio próprio** (ex: `app.suaclinica.com.br`) nas configurações de domínio da Vercel.
- [ ] **WhatsApp Cloud API:** cada clínica configura o próprio token em *Admin → Configurações*.

---

## Como funciona o multi-tenant (resumo)

Uma única instância serve **todas** as clínicas. Cada clínica é uma linha na tabela `Clinic` com `slug`, cores e logo próprios. A URL pública é `/c/<slug>`; o admin só enxerga dados da própria clínica (filtro por `clinicId`); o super-admin cria e gerencia todas. Escala do 1º ao milésimo dentista sem mudar código.
