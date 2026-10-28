# REALBUX

Loja de produtos digitais para o universo Roblox, com catálogo de 121 produtos confirmado pelo usuário, descontos de até 75% OFF, interface responsiva, artes locais, botões neon, fundo animado, contas e carrinho persistente.

Os 121 produtos têm checkouts cadastrados na Velani com os preços promocionais do catálogo. Há 120 ativos e um inativo por falta de estoque. O carrinho gera um único Pix pela API Velani para todos os produtos e quantidades. O vendedor entrega manualmente no e-mail da conta do comprador após confirmar o pagamento. Veja [OPERACAO.md](OPERACAO.md).

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
- Descrição de entrega manual pelo vendedor no e-mail informado na compra, após confirmação do pagamento.
- Promoção de 75% OFF com arredondamento em centavos; por solicitação do vendedor, os 32 itens que ficavam abaixo de R$ 5,00 custam R$ 6,00. Seus selos mostram o desconto efetivo.
- Carrinho persistente com adição, quantidades e remoção.
- Cadastro, login, logout, atualização de nome e senha, cookie HttpOnly e senhas protegidas com scrypt.
- Histórico com isolamento por usuário e exclusão de registros de teste na resposta pública.
- Artes temáticas, logotipo e favicon R, banners REALBUX e de promoção, efeitos com suporte a movimento reduzido.
- Pagamento do carrinho em um único Pix pela API Velani, com valores calculados no servidor, QR Code e copia e cola.
- Pedido persistente, prevenção de duplicidade, consulta autenticada do pagamento e retomada após recarregar a página.

Rotas: `/`, `/catalog`, `/search?q=...`, `/category/:id`, `/package/:id`, `/faq`, `/terms`, `/privacidade`, `/login`, `/register`, `/checkout`, `/account`, `/account/orders`, `/account/orders/:id`.

## Arquivos principais

| Arquivo | Finalidade |
| --- | --- |
| `public/catalog.js` | Produtos, categorias e FAQ |
| `public/store-policy.js` | Condição de entrega por e-mail |
| `public/velani-checkouts.js` | Links, preços conferidos e situação dos 121 checkouts |
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

Os testes de API usam banco temporário e verificam contas, descrições, preços, links Velani, isolamento do histórico e preservação dos registros antigos. Os testes Playwright cobrem desktop e celular, incluindo Pix único com produtos e quantidades, retomada após recarregar e limpeza do carrinho somente após confirmação. As APIs do provedor são simuladas nos testes.

Chromium em `/usr/bin/chromium` é detectado automaticamente; outro executável pode ser indicado por `CHROMIUM_PATH`. O servidor dos testes usa a porta 3100 e banco próprio em `/tmp/realm-browser-test.sqlite`.

## Retomar o ambiente

Use o checkout existente: cada tarefa em nuvem já é isolada. Não crie worktrees sem solicitação. Inicie com `npm start` e confira `/api/catalog`, `/api/me` e os fluxos necessários. Processos precisam ser reiniciados após restaurar o ambiente.

A origem do layout e o histórico de preparação estão em [REFERENCE.md](REFERENCE.md). A confirmação do catálogo não substitui a integração real de pagamento e entrega.
