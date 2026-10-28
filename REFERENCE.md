# Correspondência com a referência

Referência: https://bloxrealm.com.br/ e o HTML da página inicial fornecido pelo usuário.

## Layout

A página inicial segue a estrutura do HTML: navegação flutuante com fundo de vidro, banner 1400 × 460, quatro cartões de categoria, títulos de categoria centralizados, subtítulos entre linhas roxas, grades com cinco produtos no desktop/três no tablet/dois no celular, bloco em degradê de mais vendidos, avaliações, benefícios, FAQ e sobre nós. O tema, os espaçamentos e o rodapé foram aproximados das classes e estilos presentes no documento.

O CSS original `/styles/c3fd1105fae74f1b.css` não estava acessível, portanto não há equivalência pixel a pixel confirmada.

## Imagens

`public/reference-assets.js` registra 14 URLs extraídas do HTML: oito imagens únicas de produtos, quatro de categorias, marca e banner. A interface tenta essas imagens originais. Produtos agora têm artes locais específicas, em public/assets/products/: frutas diferentes, espadas, raças, gamepasses, avatares de contas e itens de Blue Lock/Jujutsu. Essas artes também são usadas se uma foto original falhar. Marca, categorias e banner mantêm as reservas SVG. As artes criadas são ilustrativas e não são capturas oficiais dos jogos.

Para guardar as imagens no próprio projeto, depois de liberar `bloxrealm.com.br` e `gnr-assets.centralcart.ai` na rede do ambiente:

```sh
npm run assets:sync
```

O script preserva a verificação TLS, verifica status, tipo e assinatura do arquivo e só então grava o recurso local e atualiza `public/reference-cache.js`. As imagens passam a ser servidas de `public/assets/reference/`. O download local ainda não foi confirmado neste ambiente, pois os domínios continuam bloqueados pelo proxy.

## Catálogo

O catálogo inicial foi preparado com nomes identificados no HTML e entradas adicionais para chegar aos 121 produtos informados pelo usuário. Posteriormente, o usuário confirmou que os 121 produtos, os preços com 75% OFF e as quantidades foram conferidos para venda real.

A interface atual não apresenta avisos de demonstração, depoimentos copiados ou contadores de clientes da referência. Os IDs novos não usam `demo-`; links e carrinhos antigos são compatíveis. O histórico de preparação permanece nesta documentação e no Git.

A entrega imediata no e-mail após confirmação de pagamento foi definida pelo usuário. Pagamento e envio automático ainda precisam de integração; a finalização permanece indisponível. Veja OPERACAO.md.

## Identidade REALBUX

A marca visível foi substituída por REALBUX em todas as páginas, no logotipo, no banner, nos títulos, no favicon e nos textos. A interface usa os recursos locais para não reintroduzir a identidade anterior por imagens externas. As URLs acima e em `public/reference-assets.js` ficam somente como registro da origem do material; não representam um domínio da REALBUX. Não foram criados perfis sociais ou domínios fictícios.
