import { deliveryDescription } from './store-policy.js';
import { applyPromotion } from './promotion.js';
import { referenceImage } from './reference-assets.js';

export const categories = [
  { id: 'bloxfruits', name: 'Blox Fruits', label: 'CONTAS & ITENS', color: '#ad38f4', art: 'fruits', groups: ['Mês das Crianças', 'Magnetic Fruit + Update', 'Produtos populares', 'Promoção relâmpago', 'Caixas raras', 'Gamepasses', 'Contas PVP', 'Raças V4', 'Especiais', 'Frutas no inventário'] },
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
const baseProducts = items.map(([id,name,category,price,art,group,symbol],i) => ({ id,name,category,price,art,group,symbol,stock: i === 18 ? 0 : 50, popular: i < 8, oldPrice: Math.round(price * 1.3 * 100) / 100, image: referenceImage(`product:${id}`, `/assets/${art}.svg`), fallbackImage: `/assets/${art}.svg`, description: 'Produto digital para o universo Roblox. Confira as informações e o prazo de entrega antes de comprar.' }));
// Merchant confirmed products, quantities and prices on 2026-10-27. Checkout still awaits payment integration; see OPERACAO.md.
const fruits = ['Rocket','Spin','Chop','Spring','Bomb','Smoke','Spike','Flame','Falcon','Sand','Dark','Diamond','Light','Rubber','Barrier','Ghost','Magma','Quake','Buddha','Love','Spider','Phoenix','Portal','Rumble'];
const generated=[];
function addProduct(id,name,category,group,art,label,price) {
  generated.push({id,name,category,group,art,thumbnailLabel:label,price,oldPrice:Math.round(price*1.3*100)/100,stock:50,popular:false,symbol:'',image:`/assets/${art}.svg`,fallbackImage:`/assets/${art}.svg`,description:'Produto digital para o universo Roblox. Confira os recursos incluídos e as condições de recebimento antes de comprar.'});
}
fruits.forEach((fruit,i)=>addProduct(`fruit-${fruit.toLowerCase()}`,`${fruit} no Inventário + Level Máximo`,'bloxfruits','Frutas no inventário','fruits',fruit,9.9+i));
['CDK + Soul Guitar','TTK + Godhuman','Darkblade + Godhuman','Shark Anchor + Godhuman','Dragon Trident + Godhuman','Spikey Trident + Godhuman','Hallow Scythe + Godhuman','Pole V2 + Godhuman'].forEach((name,i)=>addProduct(`pvp-${i}`,`Conta PVP — ${name}`,'bloxfruits','Contas PVP','sword',name,24.9+i*3));
['Human','Shark','Angel','Rabbit','Ghoul','Cyborg'].forEach((race,i)=>addProduct(`race-${race.toLowerCase()}`,`Raça ${race} V4 + Level Máximo`,'bloxfruits','Raças V4','sword',`${race} V4`,29.9+i*4));
fruits.forEach((fruit,i)=>addProduct(`permanent-${fruit.toLowerCase()}`,`${fruit} Permanente`,'gamepass-blox-fruits','Frutas permanentes',fruit==='Dark'?'dragon':'ice',`${fruit} Permanente`,14.9+i*5));
['2X Money','Fast Boats','2X Drop Chance','Fruit Notifier','Dark Blade','+1 Fruit Storage','2X Boss Drops','VIP Blox Fruits'].forEach((name,i)=>addProduct(`pass-${i}`,name,i<4?'gamepass-blox-fruits':'bloxfruits','Gamepasses','gamepass',name,19.9+i*7));
[['Style Slot','Slot de Estilo Adicional'],['Style Slot','Pacote 3 Slots de Estilo'],['Flow Slot','Slot de Flow Adicional'],['Flow Slot','Pacote 3 Slots de Flow'],['Spins','10 Lucky Style Spins'],['Spins','25 Lucky Style Spins'],['Spins','100 Style Spins'],['Spins','10 Lucky Flow Spins'],['Spins','25 Lucky Flow Spins'],['Dinheiro','Pacote de Dinheiro Pequeno'],['Dinheiro','Pacote de Dinheiro Médio'],['Dinheiro','Pacote de Dinheiro Grande']].forEach(([group,name],i)=>addProduct(`blue-${i}`,`${name} — Blue Lock`,'blue-lock',group,'blue',name,7.9+i*3));
[2010,2011,2012,2013,2014,2015,2016,2017].forEach((year,i)=>addProduct(`account-${year}`,`Conta Roblox de ${year}`,'contas-antigas-raras','Contas raras','rare',`Conta ${year}`,59.9-i*5));
[['Gamepasses','Early Access'],['Gamepasses','VIP'],['Gamepasses','Emote Slots'],['Caixas raras','5X Chromatic Box'],['Caixas raras','10X Chromatic Box'],['Caixas raras','Pacote de Caixas Especiais']].forEach(([group,name],i)=>addProduct(`jujutsu-${i}`,`${name} — Jujutsu Shenanigans`,'jujutsu-shenanigans',group,'jujutsu',name,9.9+i*8));
[['Mês das Crianças','Conta Especial — Pacote A','rare'],['Mês das Crianças','Conta Especial — Pacote B','rare'],['Promoção relâmpago','Conta Level Máximo + Magma','fruits'],['Caixas raras','Caixa de Contas Épicas','rare'],['Especiais','Conta Colecionador — Pacote Especial','sword']].forEach(([group,name,art],i)=>addProduct(`special-${i}`,name,'bloxfruits',group,art,name,8.9+i*9));
export const products=[...baseProducts,...generated].map(product=>({...applyPromotion(product),description:`${product.description} ${deliveryDescription}`}));
if(products.length!==121)throw new Error('O catálogo deve conter 121 produtos.');

export const faqs = [
  ['Como funciona a entrega?', deliveryDescription],
  ['Como protejo minha conta?', 'Use uma senha exclusiva para sua conta REALBUX. Nunca informe aqui a senha da sua conta Roblox.'],
  ['Precisa de ajuda?', 'Consulte as perguntas frequentes para informações sobre o catálogo, sua conta e seus pedidos.'],
  ['Preciso informar minha senha do Roblox?', 'Não. A REALBUX não solicita a senha da sua conta Roblox nesta aplicação.'],
  ['Onde acompanho meus pedidos?', 'Entre na sua conta e abra Meus pedidos para consultar as compras registradas.'],
  ['Posso alterar meu carrinho?', 'Sim. Use os botões + e − para alterar quantidades, ou remova um produto. O carrinho fica salvo neste navegador.'],
  ['Quais são as formas de pagamento?', 'As opções de pagamento são apresentadas no checkout quando o serviço está disponível. No momento, a finalização de compras está indisponível.'],
  ['O carrinho reserva os produtos?', 'Não. Adicionar um item ao carrinho não confirma uma compra nem garante sua disponibilidade. Confira as condições antes de concluir o pedido.']
];
