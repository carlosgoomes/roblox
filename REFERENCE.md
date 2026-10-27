# Correspondência com a referência

Referência: https://bloxrealm.com.br/ e o HTML da página inicial fornecido pelo usuário.

## Layout

A página inicial segue a estrutura do HTML: navegação flutuante com fundo de vidro, banner 1400 × 460, quatro cartões de categoria, títulos de categoria centralizados, subtítulos entre linhas roxas, grades com cinco produtos no desktop/três no tablet/dois no celular, bloco em degradê de mais vendidos, avaliações, benefícios, FAQ e sobre nós. O tema, os espaçamentos e o rodapé foram aproximados das classes e estilos presentes no documento.

O CSS original `/styles/c3fd1105fae74f1b.css` não estava acessível, portanto não há equivalência pixel a pixel confirmada.

## Imagens

`public/reference-assets.js` registra 14 URLs extraídas do HTML: oito imagens únicas de produtos, quatro de categorias, marca e banner. A interface tenta essas imagens originais; se falharem, usa os SVGs locais. Os demais produtos exibem ilustrações identificadas como tal.

Para guardar as imagens no próprio projeto, depois de liberar `bloxrealm.com.br` e `gnr-assets.centralcart.ai` na rede do ambiente:

```sh
npm run assets:sync
```

O script preserva a verificação TLS, verifica status, tipo e assinatura do arquivo e só então grava o recurso local e atualiza `public/reference-cache.js`. As imagens passam a ser servidas de `public/assets/reference/`. O download local ainda não foi confirmado neste ambiente, pois os domínios continuam bloqueados pelo proxy.

## Quantidade de produtos

O usuário informou **121 produtos** na loja original. O catálogo demonstrativo agora contém exatamente **121 itens**, preservando os IDs dos 20 itens que já existiam. Oito deles correspondem a produtos identificados no HTML pelas avaliações. Os outros **113 itens** são exemplos ilustrativos, com nomes e combinações de contas/gamepasses, não uma transcrição confirmada dos 113 produtos restantes da loja original.

O documento fornecido tem os contêineres das categorias, mas os produtos são carregados por JavaScript. Seus nomes, preços, estoques e URLs individuais não estão presentes. Para igualar os 121 produtos reais, ainda é necessário acessar o catálogo completo ou receber uma exportação. Não confunda os exemplos com ofertas, estoque ou preços oficiais.

O conteúdo fica em `public/catalog.js`; `source: 'reference-html'` identifica os oito itens encontrados e `demo`/`demo-generated` identifica os exemplos. Todos os preços, estoques e pedidos continuam de demonstração.
