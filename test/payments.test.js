import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';

delete process.env.VERCEL;
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN','LIBSQL_URL','LIBSQL_DATABASE_URL','LIBSQL_AUTH_TOKEN'])delete process.env[key];
const dir=mkdtempSync(join(tmpdir(),'realbux-payments-'));
process.env.DB_PATH=join(dir,'test.sqlite');
process.env.VELANI_SECRET_KEY='test-key-never-used-against-live-provider';
const originalFetch=globalThis.fetch;
const transactions=new Map(),requests=[];
let badAmount=false,failNext=false;
globalThis.fetch=async(url,options={})=>{
  if(!String(url).startsWith('https://api.velanipagamentos.com.br/'))return originalFetch(url,options);
  assert.equal(options.headers['x-api-key'],process.env.VELANI_SECRET_KEY);
  if(options.method==='POST'){
    const body=JSON.parse(options.body);requests.push(body);
    const key=options.headers['x-idempotency-key'];
    assert.equal(key,body.externalId);
    if(!transactions.has(key))transactions.set(key,{id:'tx-'+key,externalId:key,amount:body.amount,status:'pending',paymentMethod:'pix',pixQrCode:'000201-real-pix-payload-replaced-by-test',expiresAt:new Date(Date.now()+900000).toISOString()});
    if(failNext){failNext=false;throw new Error('Simulated lost response after provider accepted the request');}
    return Response.json({success:true,data:transactions.get(key)});
  }
  const id=decodeURIComponent(String(url).split('/').at(-1));
  const value=[...transactions.values()].find(t=>t.id===id);
  assert.ok(value);
  return Response.json({success:true,data:{...value,amount:value.amount+(badAmount?1:0)}});
};
const {server}=await import('../src/server.js');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/api/';
after(async()=>{globalThis.fetch=originalFetch;await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});});
async function api(path,body,cookie){
 const response=await originalFetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
async function register(email){
 return api('register',{name:'Comprador Teste',email,password:'safe-payment-test-password'});
}
const cart=[{id:'magnetic-fruit',quantity:1,price:0.01},{id:'dough-v2-+-godhuman-+-level-max',quantity:1,price:0.01}];

test('um único Pix soma produtos, ignora preços enviados e confirma pagamento somente pelo provedor',async()=>{
 const account=await register('buyer@example.test'),cookie=account.cookie;
 const result=await api('orders',{items:cart,accepted:true,amount:2},cookie);
 assert.equal(result.status,200);
 const order=result.data.order;
 assert.equal(order.total,14.96);
 assert.equal(order.items.length,2);
 assert.equal(order.status,'pending_payment');
 assert.match(order.payment.qrCodeImage,/^data:image\/png;base64,/);
 assert.equal(requests.at(-1).amount,1496);
 assert.equal(requests.at(-1).items.reduce((sum,p)=>sum+p.unitPrice*p.quantity,0),1496);
 assert.equal(requests.at(-1).customer.email,'buyer@example.test');
 assert.equal(JSON.stringify(result.data).includes(process.env.VELANI_SECRET_KEY),false);
 const again=await api('orders',{items:[...cart].reverse(),accepted:true},cookie);
 assert.equal(again.data.order.id,order.id);
 assert.equal(transactions.size,1);
 const other=await register('other@example.test');
 assert.equal((await api('payment',{id:order.id},other.cookie)).status,404);
 const status=await api('payment',{id:order.id,status:'paid'},cookie);
 assert.equal(status.data.order.status,'pending_payment');
 transactions.get(order.id).status='paid';
 badAmount=true;
 assert.equal((await api('payment',{id:order.id},cookie)).status,502);
 assert.equal((await api('orders',undefined,cookie)).data.orders[0].status,'pending_payment');
 badAmount=false;
 assert.equal((await api('payment',{id:order.id},cookie)).data.order.status,'paid');
 assert.equal((await api('orders',undefined,cookie)).data.orders[0].status,'paid');
});

test('quantidades, estoque e limites são conferidos antes de criar cobrança',async()=>{
 const account=await register('quantities@example.test'),cookie=account.cookie;
 const start=requests.length;
 for(const items of [[{id:'magnetic-fruit',quantity:0}],[{id:'magnetic-fruit',quantity:51}],[{id:'magnetic-fruit',quantity:1.5}],[{id:'conta-especial',quantity:1}],[{id:'unknown',quantity:1}],[{id:'magnetic-fruit',quantity:30},{id:'magnetic-fruit',quantity:30}]]){
  assert.equal((await api('orders',{items,accepted:true},cookie)).status,400);
 }
 assert.equal((await api('orders',{items:cart,accepted:false},cookie)).status,400);
 assert.equal(requests.length,start);
 const result=await api('orders',{items:[{id:'magnetic-fruit',quantity:1},{id:'magnetic-fruit',quantity:1},{id:'dough-v2-+-godhuman-+-level-max',quantity:1}],accepted:true},cookie);
 assert.equal(result.status,200);assert.equal(result.data.order.total,23.69);
 assert.equal(result.data.order.items.length,2);
 assert.equal(requests.at(-1).items.find(p=>p.title.includes('Magnetic')).quantity,2);
});

test('resposta perdida e cliques simultâneos reutilizam a chave idempotente',async()=>{
 const account=await register('retry@example.test'),cookie=account.cookie;
 const input={items:[{id:'blue-lock-style-slot',quantity:2}],accepted:true};
 const before=transactions.size;
 failNext=true;
 assert.equal((await api('orders',input,cookie)).status,502);
 const retried=await api('orders',input,cookie);
 assert.equal(retried.status,200);assert.equal(retried.data.order.total,12);
 assert.equal(transactions.size,before+1);
 const concurrentAccount=await register('concurrent@example.test');
 const results=await Promise.all([api('orders',input,concurrentAccount.cookie),api('orders',input,concurrentAccount.cookie)]);
 assert.deepEqual(results.map(r=>r.status),[200,200]);
 assert.equal(results[0].data.order.id,results[1].data.order.id);
 assert.equal(transactions.size,before+2);
 const db=new DatabaseSync(process.env.DB_PATH);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM orders WHERE user_id=?').get(concurrentAccount.data.user.id).n,1);
 db.close();
});
