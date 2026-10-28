# Hospedar na Vercel

O projeto já contém `vercel.json`, a função `api/index.js`, o cliente de banco remoto e as regras para as páginas internas. O frontend é servido de `public/`; todas as rotas `/api/*` usam a mesma lógica do servidor local. Runtime: **Node.js 24.x**.

## Pré-requisitos

1. Uma conta Vercel autenticada. A CLI pode criar o projeto durante o primeiro deploy; não é necessário criá-lo previamente.
2. Um banco **Turso/libSQL persistente**, com URL `libsql://...` ou `https://...` e token de acesso de leitura/escrita.

O SQLite local não deve ser enviado para a Vercel: o sistema de arquivos das funções não fornece persistência compartilhada entre instâncias. Nesta versão, cadastro e login exigem banco remoto configurado. Os links externos Velani funcionam sem credenciais de pagamento no site; o histórico local ainda não sincroniza essas compras. O catálogo e a navegação permanecem acessíveis. Nunca utilize `/tmp` como substituto de um banco persistente.

## Configurar e publicar

Em uma máquina com acesso à Vercel:

```sh
cd /workspace/roblox
npm ci
npm run build
npm test
npx vercel login
npx vercel link
```

Em **Project → Settings → Environment Variables**, adicione para Production e Preview:

| Variável | Conteúdo |
| --- | --- |
| `TURSO_DATABASE_URL` | URL do banco provisionado |
| `TURSO_AUTH_TOKEN` | Token secreto com acesso ao banco |
| `COOKIE_SECURE` | `true` (também ativado automaticamente na Vercel) |

Não envie os valores por chat nem os inclua no Git. O arquivo `.env.example` contém somente os nomes e um endereço fictício. A Vercel precisa de acesso HTTPS ao host do banco.

Depois de configurar as variáveis:

```sh
npx vercel deploy --prod
```

As tabelas são criadas automaticamente na primeira operação autenticada. O banco local existente não é migrado automaticamente: faça uma migração separada se precisar preservar contas e pedidos já criados no ambiente local. Não sobrescreva um banco remoto existente sem revisar seus dados.

## Verificação depois do deploy

- Abra a URL fornecida pela Vercel e acesse diretamente `/faq` e uma página `/package/...`; a atualização do navegador deve manter essas páginas funcionais.
- Confira `/api/catalog` (121 produtos) e `/api/me` (`user: null` sem sessão).
- Crie uma conta de teste e verifique login e histórico. Confirme os links de checkout Velani, os preços por unidade e a indicação de entrega manual. POST /api/orders não deve criar pedidos sem confirmação real de pagamento.
- Confirme que o cookie `realm_session` inclui HttpOnly, SameSite=Lax e Secure.
- Verifique novamente a conta após uma nova implantação para confirmar a persistência remota.

## Dados excluídos da publicação

`.vercelignore` exclui `.git`, `.env*`, bancos em `data/`, testes, relatórios, logs e `node_modules`. Somente o código e os recursos da aplicação são necessários. `.vercel/` não deve entrar no Git.

## Estado desta preparação

O build e o handler serverless podem ser testados sem conta Vercel. A conexão com Turso, a publicação e a URL pública só podem ser confirmadas após o provisionamento do banco, a autenticação e o acesso de rede necessários. Uma prévia sem banco não representa a loja completa em funcionamento.

Os links externos da Velani são definidos em public/velani-checkouts.js. Credenciais temporárias da conta Velani são usadas apenas na configuração administrativa e nunca devem ser publicadas. Consulte OPERACAO.md para os limites do fluxo de pagamento e a entrega manual.
