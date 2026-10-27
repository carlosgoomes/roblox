# REALBUX — recriação

Aplicação independente criada do zero a partir do HTML enviado. Interface escura com destaque roxo, navegação responsiva, catálogo de produtos Roblox e backend local em Node.js/SQLite. Não depende do site original para funcionar e não inclui pixels de rastreamento.

Para hospedar, consulte [DEPLOY.md](DEPLOY.md). A configuração Vercel já está incluída, com função serverless e suporte a Turso/libSQL para preservar usuários e pedidos. A publicação ainda exige autenticação Vercel e provisionamento do banco remoto.

## Executar

Requer **Node.js 24 ou superior** (usa `node:sqlite`).

```sh
cd /workspace/roblox
npm ci
npm run dev
```

O servidor usa a porta **3000**. `npm start` executa sem o modo watch. Não há compilação: os módulos do navegador são servidos diretamente. `npm run build` verifica a sintaxe para a implantação. O banco local é criado automaticamente em `data/store.sqlite`; se `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estiverem definidos, a aplicação utiliza o banco remoto.

Variáveis opcionais: `PORT` (3000), `HOST` (`0.0.0.0`), `DB_PATH` (caminho do SQLite) e `COOKIE_SECURE=true` para enviar o cookie apenas por HTTPS em produção. Configure HTTPS no proxy de entrada e mantenha o diretório `data/` em armazenamento persistente. Não exponha a aplicação de demonstração como loja comercial sem integrar e revisar os serviços descritos abaixo.

## Funcionalidades implementadas

- Início com banner, categorias, destaques, comunidade, avaliações de referência, benefícios, FAQ e sobre nós.
- Catálogo, cinco categorias, busca sem distinção de acentos, filtro por subcategoria e ordenação por popularidade, nome e preço.
- 121 produtos demonstrativos com páginas individuais, abas de descrição/entrega/avaliações, quantidade, estado de esgotado e itens relacionados.
- Carrinho lateral com adição, alteração de quantidade, remoção, total e persistência no navegador.
- Cadastro, login, logout, sessão por cookie HttpOnly, edição de nome e troca de senha. Senhas protegidas com scrypt e salt individual.
- Checkout de demonstração, cálculo de preços no servidor, validação de estoque e quantidades, registro de pedidos em SQLite e histórico exclusivo por usuário.
- Termos e privacidade próprios para a demonstração, página 404, links sociais, menus com teclado, Escape e contenção de foco.

Rotas: `/`, `/catalog`, `/search?q=...`, `/category/:id`, `/package/:id`, `/faq`, `/terms`, `/privacidade`, `/login`, `/register`, `/checkout`, `/account`, `/account/orders`, `/account/orders/:id`.

## Origem e limites

O material fornecido contém **apenas o HTML da página inicial**. Categorias, oito produtos, textos institucionais e alguns depoimentos foram extraídos dele. Os demais itens são demonstrativos; o total de 121 foi informado pelo usuário. O HTML não inclui os preços, o estoque, os documentos legais completos, as páginas internas ou o backend original.

Por isso:

- Valores, estoques e os detalhes das páginas internas são de demonstração e estão identificados na interface.
- Não existe integração com Roblox, CentralCart, Pix ou entrega real. O checkout não gera QR Code nem solicita dados financeiros. Pedidos têm status `demo`.
- As 14 URLs de imagens presentes no HTML (oito produtos, quatro categorias, marca e banner) estão associadas à interface. A identidade visível é REALBUX. O site usa imagens locais de marca, banner, categorias e produtos para evitar o reaparecimento da marca antiga em imagens externas. Todos os 121 produtos têm uma arte correspondente, incluindo frutas, equipamentos, raças, passes e contas; as URLs originais permanecem documentadas somente como referência histórica. O acesso de rede do ambiente ainda bloqueia o download local. Os outros 113 produtos usam ilustrações locais e dados de demonstração; não há garantia de equivalência do catálogo completo ou dos pixels. Consulte REFERENCE.md.
- Os botões flutuantes e os links de redes sociais foram removidos; a navegação de ajuda permanece na página de FAQ.
- Os textos de termos e privacidade são próprios desta demonstração e precisam de revisão antes de uso comercial.

Para transformar em loja comercial, ainda são necessários os dados reais dos produtos, as imagens autorizadas, um provedor de pagamento com webhooks verificados, estoque e entrega, recuperação de senha com serviço de e-mail e políticas comerciais revisadas. Não substitua o status `demo` por pagamento aprovado sem verificar o pagamento no servidor.

## Personalizar

- Produtos, categorias, valores de exemplo e FAQ: `public/catalog.js`.
- Páginas, navegação e ações: `public/app.js`.
- Estilos responsivos: `public/style.css`.
- Ilustrações: `public/assets/`.
- Servidor, autenticação e pedidos: `src/server.js`.

## Validar

```sh
npm test
npm run test:e2e
```

O teste de API usa um banco temporário isolado e verifica autenticação, alteração de senha, cálculo de preços, validação, origem das requisições e separação de pedidos entre usuários.

Os testes Playwright verificam desktop (1440 px) e celular (390 px): catálogo, busca, produto, abas, carrinho, persistência, FAQ, páginas institucionais, cadastro/login, checkout e consulta do pedido. Capturas são geradas em `test-results/`.

O ambiente atual fornece Chromium em `/usr/bin/chromium`, detectado pela configuração de testes. Em outro sistema, defina `CHROMIUM_PATH` ou instale o navegador Playwright com `npx playwright install chromium` e as dependências oficiais do seu sistema. O teste de navegador usa seu próprio servidor na porta 3100 e um banco de teste em `/tmp/realm-browser-test.sqlite`, sem alterar os dados da aplicação.

## Retomar o ambiente

Cada tarefa em nuvem já é isolada; utilize o checkout existente e não crie worktrees, a menos que solicitado. Depois da restauração do ambiente, dependências e banco podem persistir, mas processos precisam ser iniciados novamente. Execute `npm start`, verifique `/api/catalog` e teste o fluxo necessário. Não há credenciais ou serviços externos obrigatórios para o modo demonstração.

A identidade atual usa o banner `public/assets/realbux-banner.png`, o logotipo `public/assets/realbux-brand.svg` e o ícone R `public/assets/realbux-icon.svg`. O título da página inicial é REALBUX; as páginas internas mantêm a marca no início do título da guia.
