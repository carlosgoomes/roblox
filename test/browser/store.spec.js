import { test, expect } from '@playwright/test';
test.beforeEach(async({page})=>{
 // Exercise deterministic local image fallbacks; external originals remain network-dependent.
 await page.route('https://bloxrealm.com.br/**',route=>route.abort());
 await page.route('https://gnr-assets.centralcart.ai/**',route=>route.abort());
});
test('banner promocional à direita leva aos produtos com desconto no carrinho',async({page})=>{
 const {products}=await (await page.request.get('/api/catalog')).json();
 const offers=products.filter(p=>p.discountPercent===75);
 expect(offers).toHaveLength(89);
 await page.goto('/');
 await expect(page.locator('.promo-action-copy strong')).toHaveText('75% OFF em produtos selecionados');
 const banner=page.locator('.promo-banner');await expect(banner).toBeVisible();
 await expect(banner.locator('img')).toHaveJSProperty('complete',true);
 expect(await banner.locator('img').evaluate(i=>i.naturalWidth)).toBeGreaterThan(1000);
 const promoBox=await banner.boundingBox();const heroBox=await page.locator('.reference-hero').boundingBox();
 if(test.info().project.name==='desktop'){expect(promoBox.x).toBeGreaterThanOrEqual(heroBox.x+heroBox.width);expect(promoBox.y+promoBox.height).toBeLessThan(1000);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:`test-results/promotion-${test.info().project.name}.png`});
 await page.getByRole('link',{name:'Ver produtos com 75% OFF',exact:true}).click();
 await expect(page).toHaveURL(/\/catalog\?promo=75$/);
 await expect(page.locator('#results .product-card')).toHaveCount(offers.length);
 await expect(page.locator('#results .discount-pill')).toHaveCount(offers.length);
 await page.locator('#results .product-art').first().click();
 await expect(page.locator('.detail-price')).toHaveText(offers[0].price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}));
 await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
 await expect(page.getByRole('dialog').locator('.total-row')).toContainText(offers[0].price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}));
});
test('todos os produtos têm arte local e a imagem corresponde ao tipo do item',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#store .product-visual')).toHaveCount(121);
 const sheets=await page.locator('#store .product-visual image').evaluateAll(images=>[...new Set(images.map(i=>i.getAttribute('href')))]);
 expect(sheets).toHaveLength(2);
 for(const src of sheets){
  const response=await page.request.get(src);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/png');
  const decoded=await page.evaluate(async(src)=>{const i=new Image();i.src=src;await i.decode();return {width:i.naturalWidth,height:i.naturalHeight};},src);
  expect(decoded.width).toBeGreaterThan(1000);expect(decoded.height).toBe(decoded.width);
 }
 const cases=[['Magma Permanente','magma'],['Portal Permanente','portal'],['Dark Blade','dark-blade'],['Raça Shark V4 + Level Máximo','shark-v4'],['Flow Slot — Blue Lock','flow-slot'],['Conta Roblox de 2010','veteran-account']];
 for(const [name,key] of cases){
  const card=page.locator('#store .product-card').filter({has:page.getByRole('heading',{name,exact:true})});
  await expect(card.locator('.product-visual')).toHaveAttribute('data-artwork',key);
 }
 await page.goto('/category/gamepass-blox-fruits');
 await page.getByLabel('Categoria',{exact:true}).selectOption({label:'Frutas permanentes'});
 await page.screenshot({path:`test-results/product-images-${test.info().project.name}.png`});
 await page.goto('/package/permanent-portal');
 await expect(page.locator('.detail-art .product-visual')).toHaveAttribute('data-artwork','portal');
 await expect(page.locator('.detail-art .visual-variant')).toHaveText('PERMANENTE');
 await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
 await expect(page.getByRole('dialog').locator('.product-visual')).toHaveAttribute('data-artwork','portal');
});
test('busca, filtros, abas, carrinho persistente e navegação',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:'Escolha uma categoria'})).toBeVisible();
 await expect(page.locator('#store .product-card')).toHaveCount(121);
 await expect(page.locator('.category-grid>a')).toHaveCount(4);
 expect(await page.locator('.reference-products').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(test.info().project.name==='desktop'?5:2);
 await expect(page.locator('.reference-hero img')).toHaveJSProperty('complete',true);
 expect(await page.locator('.reference-hero img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(1000);
 await page.screenshot({path:`test-results/viewport-${test.info().project.name}.png`});
 await page.screenshot({path:`test-results/home-${test.info().project.name}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'Abrir menu'}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('dialog').getByRole('link',{name:'Todos os produtos'}).click();await expect(page).toHaveURL(/catalog/);
 await page.getByRole('textbox',{name:'Buscar nesta seleção'}).fill('ice');await expect(page.locator('#results .product-card')).toHaveCount(1);
 await page.locator('#results a').first().click();await expect(page.getByRole('heading',{name:'Ice Permanente [750 Robux]',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Entrega',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Informações de entrega');await expect(page.getByRole('tabpanel')).toContainText('será enviado manualmente pelo vendedor ao e-mail informado na compra');
 await page.getByRole('tab',{name:'Avaliações',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('ainda não recebeu');
 await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Ice Permanente');
 await page.getByRole('button',{name:'Aumentar quantidade'}).click();await expect(page.getByRole('dialog').locator('.quantity-controls>span')).toHaveText('2');
 await page.getByRole('button',{name:'Fechar carrinho'}).click();await page.reload();await page.getByRole('button',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('dialog').locator('.quantity-controls>span')).toHaveText('2');
 await page.getByRole('button',{name:'Diminuir quantidade'}).click();await page.getByRole('button',{name:/Remover Ice/}).click();await expect(page.getByRole('dialog')).toContainText('Seu carrinho está vazio.');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.goto('/faq');await page.locator('summary').first().click();await expect(page.locator('details').first()).toHaveAttribute('open','');
 for(const path of ['/terms','/privacidade','/category/blue-lock','/category/jujutsu-shenanigans','/category/gamepass-blox-fruits','/category/contas-antigas-raras','/missing']){await page.goto(path);await expect(page.locator('main')).not.toBeEmpty();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 expect(errors).toEqual([]);
});
test('vários produtos e quantidades são pagos em um Pix, persistem e só limpam o carrinho após confirmação',async({page})=>{
 const email='payment-'+Date.now()+'-'+test.info().project.name+'@example.test';
 await page.request.post('/api/register',{data:{name:'Comprador Teste',email,password:'safe-browser-payment'}});
 const catalog=(await (await page.request.get('/api/catalog')).json()).products;
 const ice=catalog.find(p=>p.id==='ice-permanente-750-robux'),style=catalog.find(p=>p.id==='blue-lock-style-slot');
 let paid=false,created=0;
 const order={id:'browser-payment-order',status:'pending_payment',total:28.46,created:new Date().toISOString(),items:[{...ice,quantity:2},{...style,quantity:1}],payment:{pixCode:'000201-pix-carrinho-teste',qrCodeImage:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',expiresAt:new Date(Date.now()+900000).toISOString()}};
 await page.route('**/api/orders',async route=>{
  if(route.request().method()!=='POST')return route.continue();
  const data=route.request().postDataJSON();created++;
  expect(data.items).toHaveLength(2);expect(data.items.find(p=>p.id===ice.id).quantity).toBe(2);
  expect(data.items.every(p=>!('price' in p))).toBeTruthy();
  await route.fulfill({json:{order}});
 });
 await page.route('**/api/payment',route=>route.fulfill({json:{order:{...order,status:paid?'paid':'pending_payment'}}}));
 await page.goto('/package/'+ice.id);
 await page.getByLabel('Quantidade',{exact:true}).fill('2');
 await page.getByRole('button',{name:'Comprar agora',exact:false}).click();
 await page.goto('/package/'+style.id);await page.getByRole('button',{name:'Comprar agora',exact:false}).click();
 await expect(page.locator('[data-checkout-product]')).toHaveCount(2);
 await expect(page.locator('#checkout-total')).toHaveText('R$ 28,46');
 await page.locator('#checkout-form input[name=accepted]').check();
 await page.getByRole('button',{name:'Gerar Pix de R$ 28,46',exact:false}).click();
 await expect(page.getByRole('heading',{name:'Pix de R$ 28,46',exact:true})).toBeVisible();
 await expect(page.getByLabel('Pix copia e cola',{exact:true})).toHaveValue(order.payment.pixCode);
 await expect(page.getByRole('img',{name:'QR Code Pix para pagar todo o pedido'})).toBeVisible();
 await expect(page.locator('[data-cart-count]')).toHaveText('3');
 await page.reload();
 await expect(page.getByRole('heading',{name:'Pix de R$ 28,46',exact:true})).toBeVisible();
 expect(created).toBe(1);
 await page.getByRole('button',{name:'Verificar pagamento',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Pagamento confirmado',exact:true})).toHaveCount(0);
 paid=true;
 await page.getByRole('button',{name:'Verificar pagamento',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Pagamento confirmado',exact:true})).toBeVisible();
 await expect(page.locator('[data-cart-count]')).toHaveText('0');
 await page.goto('/package/'+style.id);await page.getByRole('button',{name:'Comprar agora',exact:false}).click();
 await expect(page.getByRole('button',{name:'Gerar Pix de R$ 6,00',exact:false})).toBeVisible();
 await page.reload();await expect(page.locator('[data-cart-count]')).toHaveText('1');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('cadastro, checkout único Velani e login',async({page})=>{
 const email=`test-${Date.now()}-${test.info().project.name}@example.test`;
 await page.goto('/register');await page.getByLabel('Seu nome',{exact:true}).fill('Jogador Teste');await page.getByLabel('E-mail',{exact:true}).fill(email);await page.getByLabel('Senha',{exact:true}).fill('browser-safe-password');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Criar conta'}).click();await expect(page).toHaveURL(/\/account$/);
 await page.goto('/package/ice-permanente-750-robux');await page.getByRole('button',{name:'Comprar agora'}).click();await expect(page).toHaveURL(/checkout/);
 await expect(page.getByRole('heading',{name:'Um único pagamento com a Velani'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Gerar Pix de R$ 11,23',exact:false})).toBeVisible();
 await expect(page.locator('#checkout-form')).toHaveCount(1);
 await page.goto('/account/orders');await expect(page.locator('.order-card')).toHaveCount(0);
 await page.getByRole('button',{name:'Sair da conta'}).click();await expect(page).toHaveURL(/login/);
 await page.getByLabel('E-mail',{exact:true}).fill(email);await page.getByLabel('Senha',{exact:true}).fill('wrong-password');await page.getByRole('button',{name:'Entrar',exact:false}).click();await expect(page.getByRole('alert')).toContainText('incorretos');
 await page.getByLabel('Senha',{exact:true}).fill('browser-safe-password');await page.getByRole('button',{name:'Entrar',exact:false}).click();await expect(page).toHaveURL(/\/account$/);await page.getByRole('link',{name:'Meus pedidos',exact:true}).first().click();await expect(page.locator('.order-card')).toHaveCount(0);
});
