export const categories = [
  { id: 'bloxfruits', name: 'Blox Fruits', label: 'CONTAS & ITENS', color: '#ad38f4', art: 'fruits', groups: ['Mês das Crianças', 'Magnetic Fruit + Update', 'Produtos populares', 'Promoção relâmpago', 'Caixas raras', 'Contas PVP', 'Raças V4', 'Especiais', 'Frutas no inventário'] },
  { id: 'gamepass-blox-fruits', name: 'Gamepass Blox Fruits', label: 'EVOLUA SEU JOGO', color: '#1b8de9', art: 'gamepass', groups: ['Gamepasses', 'Frutas permanentes'] },
  { id: 'blue-lock', name: 'Blue Lock', label: 'ENTRE EM CAMPO', color: '#1cb8cf', art: 'blue', groups: ['Style Slot', 'Flow Slot', 'Spins', 'Dinheiro'] },
  { id: 'jujutsu-shenanigans', name: 'Jujutsu Shenanigans', label: 'LIBERE SEU PODER', color: '#e83f86', art: 'jujutsu', groups: ['Gamepasses', 'Caixas raras'] },
  { id: 'contas-antigas-raras', name: 'Contas antigas raras', label: 'SUA PRÓXIMA HISTÓRIA', color: '#ed9d37', art: 'rare', groups: ['Contas raras'] }
];
const items = [
  ['dough-v2-+-godhuman-+-level-max','DOUGH V2 + GODHUMAN + LEVEL MÁX','bloxfruits',24.90,'fruits','Produtos populares','🍰'],
  ['dragon-2x-mitica-ou-magnetic-no-inventario-popular','DRAGON 2X MÍTICA OU MAGNETIC NO INVENTÁRIO','bloxfruits',39.90,'dragon','Frutas no inventário','🐲'],
  ['contas-aleatorias-raras','Contas Aleatórias Raras','contas-antigas-raras',14.90,'rare','Contas raras','✦'],
  ['cdkttk-ou-darkblade-+-god-+-lvl-max-popular','CDK, TTK OU DARKBLADE + GOD + LVL MAX','bloxfruits',29.90,'sword','Contas PVP','⚔'],
  ['3x-chromatic-box','3X Chromatic Box (Na Sua Conta) [575 Robux]','jujutsu-shenanigans',34.90,'jujutsu','Caixas raras','◈'],
  ['1x-chromatic-box','1X Chromatic Box (Na Sua Conta) [199 Robux]','jujutsu-shenanigans',12.90,'jujutsu','Caixas raras','◈'],
  ['ice-permanente-750-robux','Ice Permanente [750 Robux]','gamepass-blox-fruits',44.90,'ice','Frutas permanentes','❄'],
  ['kitsune-1x-mitica-ou-magnetic-no-inventario-popular','DRAGON 1X MÍTICA OU MAGNETIC NO INVENTÁRIO','bloxfruits',22.90,'dragon','Frutas no inventário','🐲'],
  ['2x-mastery','2X Mastery [450 Robux]','gamepass-blox-fruits',29.90,'gamepass','Gamepasses','×2'],
  ['blue-lock-style-slot','Style Slot — Blue Lock','blue-lock',9.90,'blue','Style Slot','⚽'],
  ['blue-lock-flow-slot','Flow Slot — Blue Lock','blue-lock',9.90,'blue','Flow Slot','⚡'],
  ['blue-lock-spins','50 Spins — Blue Lock','blue-lock',19.90,'blue','Spins','↻'],
  ['blue-lock-dinheiro','Dinheiro — Blue Lock','blue-lock',7.90,'blue','Dinheiro','$'],
  ['raca-v4','Conta com Raça V4 + Level Máximo','bloxfruits',49.90,'sword','Raças V4','⚔'],
  ['caixa-rara','Caixa de Contas Raras','bloxfruits',8.90,'rare','Caixas raras','🎁'],
  ['magnetic-fruit','Magnetic Fruit + Level Máximo','bloxfruits',34.90,'dragon','Magnetic Fruit + Update','🧲'],
  ['especial-mes-das-criancas','Conta Especial — Mês das Crianças','bloxfruits',12.90,'fruits','Mês das Crianças','✦'],
  ['promocao-level-max','Conta Level Máximo — Oferta','bloxfruits',6.90,'sword','Promoção relâmpago','⚡'],
  ['conta-especial','Conta Especial + Itens Exclusivos','bloxfruits',59.90,'rare','Especiais','✦'],
  ['jujutsu-gamepass','Gamepass — Jujutsu Shenanigans','jujutsu-shenanigans',24.90,'jujutsu','Gamepasses','◈']
];
export const products = items.map(([id,name,category,price,art,group,symbol],i) => ({ id,name,category,price,art,group,symbol,stock: i === 18 ? 0 : 50, popular: i < 8, oldPrice: Math.round(price * 1.3 * 100) / 100, image: `/assets/${art}.svg`, description: 'Produto digital para o universo Roblox. Confira as informações e o prazo de entrega antes de comprar.', demo: true }));
export const faqs = [
  ['Como funciona a entrega?', 'Na referência, contas são entregues após a confirmação do pagamento, gamepasses em até 24 horas e Robux em 5 a 7 dias úteis. Nesta recriação, pedidos são de demonstração: não há cobrança nem entrega de itens.'],
  ['É confiável comprar na BLOXREALM?', 'O HTML de referência informa pagamento via Pix e suporte dedicado. Esta versão é uma recriação independente em demonstração e não processa pagamentos.'],
  ['Precisa de ajuda?', 'Acesse o Discord indicado na referência pelo botão de suporte. Para dúvidas sobre esta versão, consulte a documentação do projeto.'],
  ['Preciso informar minha senha do Roblox?', 'Não. Esta versão nunca solicita senha da sua conta Roblox. O cadastro local é exclusivo desta aplicação.'],
  ['Onde acompanho meus pedidos?', 'Entre na sua conta e abra “Meus pedidos”. Cada pedido de demonstração fica salvo na sua conta, com os itens, o valor e o status.'],
  ['Posso alterar meu carrinho?', 'Sim. Use os botões + e − para alterar quantidades, ou a lixeira para remover um produto. O carrinho fica salvo neste navegador.'],
  ['Quais são as formas de pagamento?', 'A referência utiliza Pix. Nesta recriação o checkout apenas registra pedidos de demonstração, sem QR Code ou transação financeira.'],
  ['Os preços e estoques são oficiais?', 'Não. O HTML fornecido não contém preços nem estoque. Os valores e a disponibilidade deste catálogo são exemplos editáveis.']
];
