import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
const dir=mkdtempSync(join(tmpdir(),'realm-test-'));
delete process.env.VERCEL;
delete process.env.TURSO_DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;
process.env.DB_PATH=join(dir,'test.sqlite');
const { server }=await import('../src/server.js');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
after(async()=>{await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});});
let cookie='';
async function request(path,data,withCookie=true,origin) {
 const response=await fetch(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...(withCookie&&cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},body:data===undefined?undefined:JSON.stringify(data)});
 const value=await response.json();return {status:response.status,value,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
test('conta, sessão, catálogo, checkout indisponível e isolamento dos pedidos',async()=>{
 assert.equal((await request('me')).value.user,null);
 assert.equal((await request('orders',{items:[],accepted:true,username:'Player'})).status,401);
 assert.equal((await request('register',{name:'Player',email:'bad',password:'123'})).status,400);
 const registration=await request('register',{name:'Jogador Teste',email:'player@example.test',password:'safe-test-password'});
 assert.equal(registration.status,200);assert.ok(registration.cookie);cookie=registration.cookie;
 assert.equal((await request('me')).value.user.name,'Jogador Teste');
 assert.equal((await request('register',{name:'Outro',email:'player@example.test',password:'safe-test-password'})).status,409);
 const {products}= (await request('catalog')).value;const p=products[0];const last=products.at(-1);const sale=products.find(item=>item.discountPercent===75&&item.id!==p.id&&item.id!==last.id);assert.equal(products.length,121);assert.ok(sale);for(const item of products){assert.match(item.description,/Após a confirmação do pagamento, o produto será entregue imediatamente no e-mail cadastrado/);assert.equal(item.discountPercent,75);assert.equal(Math.round(item.price*100),Math.round(Math.round(item.oldPrice*100)*.25));}
 const checkout=await request('orders',{items:[{id:p.id,quantity:1,price:0.01}],username:'Player_123',accepted:true});
 assert.equal(checkout.status,503);assert.equal(checkout.value.code,'CHECKOUT_UNAVAILABLE');
 assert.equal((await request('orders')).value.orders.length,0);
 // Test-only database fixtures verify historical test records are hidden, never relabeled or deleted.
 const db=new DatabaseSync(process.env.DB_PATH);
 const items=JSON.stringify([{id:p.id,name:p.name,price:p.price,quantity:1,image:p.image}]);
 for(const [id,status] of [['legacy-test-order','demo'],['real-order-fixture','fulfilled']]){
  db.prepare('INSERT INTO orders VALUES(?,?,?,?,?,?,?)').run(id,registration.value.user.id,new Date().toISOString(),Math.round(p.price*100),items,'Player_123',status);
 }
 const orders=(await request('orders')).value.orders;
 assert.equal(orders.length,1);assert.equal(orders[0].id,'real-order-fixture');assert.equal(orders[0].status,'fulfilled');
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM orders WHERE status=?').get('demo').n,1);db.close();
 assert.equal((await request('profile',{name:'Novo Nome'},true,'https://evil.example')).status,403);
 assert.equal((await request('profile',{name:'Novo Nome'})).status,200);
 assert.equal((await request('password',{current:'wrong',password:'a-new-password'})).status,400);
 const changed=await request('password',{current:'safe-test-password',password:'a-new-password'});assert.equal(changed.status,200);cookie=changed.cookie;
 assert.equal((await request('logout',{})).status,200);
 assert.equal((await request('me')).value.user,null);
 assert.equal((await request('login',{email:'player@example.test',password:'safe-test-password'})).status,401);
 const login=await request('login',{email:'player@example.test',password:'a-new-password'});assert.equal(login.status,200);cookie=login.cookie;
 assert.equal((await request('me')).value.user.name,'Novo Nome');
 assert.equal((await request('orders')).value.orders.length,1);
 const second=await request('register',{name:'Outro Jogador',email:'other@example.test',password:'safe-test-password'});cookie=second.cookie;
 assert.equal((await request('orders')).value.orders.length,0);
});
test('rotas internas e recursos locais são servidos sem rastreadores',async()=>{
 for(const path of ['/','/faq','/terms','/privacidade','/login','/checkout','/category/bloxfruits','/package/example','/account/orders']){
  const r=await fetch(base+path);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);const text=await r.text();assert.match(text,/id="app"/);assert.doesNotMatch(text,/googletagmanager|facebook\.com|tiktok|clarity\.ms/);
 }
 assert.equal((await fetch(base+'/assets/fruits.svg')).status,200);
 assert.equal((await fetch(base+'/missing.js')).status,404);
});
