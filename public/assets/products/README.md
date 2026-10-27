# Artes dos produtos

`fruits-atlas.png` e `equipment-atlas.png` são artes originais geradas com a ferramenta de imagens para este projeto. Cada arquivo contém uma grade de 6 × 6 imagens. Elas ilustram produtos do universo Roblox/Blox Fruits, gamepasses, armas, raças, contas e itens de Blue Lock/Jujutsu; não são capturas oficiais dos jogos nem fotos das contas vendidas.

`public/product-artwork.js` associa cada um dos 121 produtos à imagem pertinente. Frutas permanentes e frutas no inventário usam a mesma fruta, com indicação de permanente quando aplicável; quantidades e anos recebem seus próprios indicadores. Produtos compostos podem exibir uma segunda arte, como arma + Godhuman.

O recorte de cada imagem ocorre no navegador por uma janela SVG, sem deformar os objetos ou mostrar células vizinhas. Os dois arquivos são compartilhados entre todas as miniaturas, páginas de produto, carrinho e histórico. As oito imagens da referência continuam prioritárias quando acessíveis; as novas artes também são usadas como reserva para elas.
