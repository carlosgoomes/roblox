# REALBUX

Loja de produtos digitais para o universo Roblox, com catálogo de 121 produtos confirmado pelo usuário, promoção de 75% OFF, interface responsiva, artes locais, botões neon, fundo animado, contas e carrinho persistente.

**As vendas ainda não estão ativadas.** O provedor de pagamento não foi definido e o envio automático de e-mails ainda não está integrado. O checkout mostra “Pagamento indisponível no momento” e não cria compras fictícias. Veja [OPERACAO.md](OPERACAO.md).

## Executar

Requer Node.js 24.x.

```sh
cd /workspace/roblox
npm ci
npm run dev
```

O servidor usa a porta 3000. `npm start` executa sem watch; `npm run build` verifica a sintaxe. O banco local é criado em `data/store.sqlite` quando uma operação de conta precisa dele. Preserve esse diretório.

Variáveis opcionais: `PORT`, `HOST`, `DB_PATH` e `COOKIE_SECURE=true` sob HTTPS. Na Vercel, a persistência exige `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`; veja [CADASTRO.md](CADASTRO.md) para criar o banco e liberar contas, e [DEPLOY.md](DEPLOY.md) para a implantação. Não coloque credenciais em arquivos versionados.

## Funcionalidades

- Início, categorias, catálogo, busca, filtros, ordenação, páginas de produto, FAQ, termos e privacidade.
- Descrição de entrega imediata no e-mail cadastrado após confirmação do pagamento, conforme a condição comercial fornecida pelo usuário.
- 75% OFF nos 121 produtos, calculados a partir do preço original, com arredondamento em centavos.
- Carrinho persistente com adição, quantidades e remoção.
- Cadastro, login, logout, atualização de nome e senha, cookie HttpOnly e senhas protegidas com scrypt.
- Histórico com isolamento por usuário e exclusão de registros de teste na resposta pública.
- Artes temáticas, logotipo e favicon R, banners REALBUX e de promoção, efeitos com suporte a movimento reduzido.
- Finalização indisponível até integrar os serviços de operação comercial.

Rotas: `/`, `/catalog`, `/search?q=...`, `/category/:id`, `/package/:id`, `/faq`, `/terms`, `/privacidade`, `/login`, `/register`, `/checkout`, `/account`, `/account/orders`, `/account/orders/:id`.

## Arquivos principais

| Arquivo | Finalidade |
| --- | --- |
| `public/catalog.js` | Produtos, categorias e FAQ |
| `public/store-policy.js` | Condição de entrega por e-mail |
| `public/promotion.js` | Promoção de 75% |
| `public/app.js` | Páginas e navegação |
| `public/product-artwork.js` | Associação das artes aos produtos |
| `public/neon.css`, `public/effects.js` | Efeitos e fundo animado |
| `src/server.js`, `src/database.js` | API, contas e persistência |

## Validar

```sh
npm run build
npm test
npm run test:e2e
```

Os testes de API usam banco temporário e verificam contas, descrições, preços, isolamento do histórico, preservação dos registros antigos e bloqueio da finalização. Os testes Playwright cobrem desktop e celular, incluindo catálogo, imagens, carrinho, cadastro e pagamento indisponível.

Chromium em `/usr/bin/chromium` é detectado automaticamente; outro executável pode ser indicado por `CHROMIUM_PATH`. O servidor dos testes usa a porta 3100 e banco próprio em `/tmp/realm-browser-test.sqlite`.

## Retomar o ambiente

Use o checkout existente: cada tarefa em nuvem já é isolada. Não crie worktrees sem solicitação. Inicie com `npm start` e confira `/api/catalog`, `/api/me` e os fluxos necessários. Processos precisam ser reiniciados após restaurar o ambiente.

A origem do layout e o histórico de preparação estão em [REFERENCE.md](REFERENCE.md). A confirmação do catálogo não substitui a integração real de pagamento e entrega.
