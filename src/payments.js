import {createHash,randomUUID} from 'node:crypto';
import QRCode from 'qrcode';
import {products} from '../public/catalog.js';

const gateway='https://api.velanipagamentos.com.br/api/v1/api-gateway/v1/transactions';
const error=(message,status=400)=>Object.assign(new Error(message),{status});
export function paymentConfigured(){return Boolean(process.env.VELANI_SECRET_KEY?.trim());}

function checkedCart(input) {
  if(input.accepted!==true)throw error('Aceite os termos para continuar.');
  if(!Array.isArray(input.items)||!input.items.length||input.items.length>121)throw error('Selecione os produtos do carrinho.');
  const quantities=new Map();
  for(const item of input.items){
    if(!item||typeof item.id!=='string'||!Number.isInteger(item.quantity)||item.quantity<1)throw error('Quantidade inválida.');
    quantities.set(item.id,(quantities.get(item.id)||0)+item.quantity);
  }
  const items=[...quantities].sort(([a],[b])=>a.localeCompare(b)).map(([id,quantity])=>{
    const product=products.find(p=>p.id===id);
    if(!product||!product.stock||!product.checkoutUrl)throw error('Um produto do carrinho está indisponível.');
    if(quantity>product.stock)throw error('Quantidade maior que o estoque disponível.');
    return {id,name:product.name,price:product.price,quantity,image:product.image};
  });
  const total=items.reduce((sum,p)=>sum+Math.round(p.price*100)*p.quantity,0);
  if(total<500||total>300000)throw error('O total do pagamento deve ficar entre R$ 5,00 e R$ 3.000,00.');
  return {items,total};
}

async function velani(method,path='',payload,idempotencyKey){
  const key=process.env.VELANI_SECRET_KEY?.trim();
  if(!key)throw Object.assign(error('Pagamento indisponível no momento. Seu carrinho foi mantido.',503),{code:'CHECKOUT_UNAVAILABLE'});
  let response,data;
  try{
    response=await fetch(gateway+path,{
      method,headers:{'Content-Type':'application/json','x-api-key':key,...(idempotencyKey?{'x-idempotency-key':idempotencyKey}:{})},
      ...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(12000)
    });
    data=await response.json();
  }catch{throw error('Não foi possível consultar a Velani. Tente novamente; uma cobrança existente será reutilizada.',502);}
  if(!response.ok||data?.success!==true||!data.data){
    throw error(response.status===429?'Aguarde alguns segundos e tente novamente.':'A Velani não conseguiu processar o pagamento. Tente novamente mais tarde.',response.status===429?429:502);
  }
  return data.data;
}

function validTransaction(data,order){
  if(typeof data.id!=='string'||!data.id||data.id.length>200||!Number.isInteger(data.amount)||data.amount!==order.total||
     (data.externalId&&data.externalId!==order.id)||data.paymentMethod!=='pix'||
     !['pending','processing','paid','failed','expired','refunded'].includes(data.status)){
    throw error('Não foi possível conferir o valor e os dados do pagamento.',502);
  }
}

async function publicPayment(db,order,payment){
  return {
    id:order.id,status:order.status,total:order.total/100,items:JSON.parse(order.items),created:order.created,
    payment:{pixCode:payment.pix_code,qrCodeImage:payment.pix_code?await QRCode.toDataURL(payment.pix_code,{width:320,margin:2}):null,expiresAt:payment.expires}
  };
}

export async function readPayment(db,user,id){
  if(typeof id!=='string'||id.length>200)throw error('Pedido inválido.');
  const order=await db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(id,user.id);
  if(!order)throw error('Pedido não encontrado.',404);
  const payment=await db.prepare('SELECT * FROM checkout_payments WHERE order_id=?').get(id);
  if(!payment?.transaction_id)throw error('O pagamento ainda está sendo preparado. Tente novamente.',409);
  const transaction=await velani('GET','/'+encodeURIComponent(payment.transaction_id));
  validTransaction(transaction,order);
  if(transaction.id!==payment.transaction_id)throw error('Não foi possível conferir o pagamento.',502);
  const status={pending:'pending_payment',processing:'pending_payment',paid:'paid',failed:'cancelled',expired:'cancelled',refunded:'refunded'}[transaction.status];
  // A payment confirmation cannot turn an already fulfilled order back into "paid".
  if(order.status!=='fulfilled'||status==='refunded'){
    await db.prepare('UPDATE orders SET status=? WHERE id=? AND user_id=?').run(status,id,user.id);
    order.status=status;
  }
  if(status!=='pending_payment')await db.prepare('UPDATE checkout_payments SET cart_key=NULL WHERE order_id=?').run(id);
  return publicPayment(db,order,payment);
}

export async function createPayment(db,user,input){
  if(!paymentConfigured())throw Object.assign(error('Pagamento indisponível no momento. Seu carrinho foi mantido.',503),{code:'CHECKOUT_UNAVAILABLE'});
  const {items,total}=checkedCart(input);
  const cartKey=createHash('sha256').update(JSON.stringify([user.id,items.map(p=>[p.id,p.quantity,Math.round(p.price*100)])])).digest('hex');
  let payment=await db.prepare('SELECT * FROM checkout_payments WHERE cart_key=?').get(cartKey);
  if(payment?.transaction_id){
    const existing=await readPayment(db,user,payment.order_id);
    if(existing.status==='pending_payment'||existing.status==='paid'||existing.status==='fulfilled')return existing;
    payment=undefined;
  }
  let order;
  if(payment){
    order=await db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(payment.order_id,user.id);
  }else{
    order={id:randomUUID(),user_id:user.id,created:new Date().toISOString(),total,items:JSON.stringify(items),username:'',status:'creating_payment'};
    await db.prepare('INSERT INTO orders VALUES(?,?,?,?,?,?,?)').run(order.id,user.id,order.created,total,order.items,'',order.status);
    try{
      await db.prepare('INSERT INTO checkout_payments(order_id,cart_key) VALUES(?,?)').run(order.id,cartKey);
      payment={order_id:order.id};
    }catch(e){
      // A concurrent click may have claimed this cart. Reuse its idempotency key.
      const claimed=await db.prepare('SELECT * FROM checkout_payments WHERE cart_key=?').get(cartKey);
      await db.prepare('DELETE FROM orders WHERE id=? AND user_id=?').run(order.id,user.id);
      if(!claimed)throw e;
      payment=claimed;
      order=await db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(payment.order_id,user.id);
    }
  }
  if(!order||order.total!==total)throw error('Não foi possível preparar este carrinho.',409);
  const transaction=await velani('POST','',{
    paymentMethod:'pix',amount:total,customer:{name:user.name,email:user.email},
    items:items.map(p=>({title:p.name,unitPrice:Math.round(p.price*100),quantity:p.quantity,tangible:false})),
    externalId:order.id,description:'Compra REALBUX — entrega manual por e-mail'
  },order.id);
  validTransaction(transaction,order);
  if(typeof transaction.pixQrCode!=='string'||!transaction.pixQrCode.startsWith('000201')||transaction.pixQrCode.length>8192||
     typeof transaction.expiresAt!=='string'||!Number.isFinite(Date.parse(transaction.expiresAt))){
    throw error('A Velani não retornou um Pix válido. Tente novamente para recuperar o mesmo pagamento.',502);
  }
  payment={...payment,transaction_id:transaction.id,pix_code:transaction.pixQrCode,expires:transaction.expiresAt};
  await db.prepare('UPDATE checkout_payments SET transaction_id=?,pix_code=?,expires=? WHERE order_id=?').run(payment.transaction_id,payment.pix_code,payment.expires,order.id);
  order.status=transaction.status==='paid'?'paid':transaction.status==='pending'||transaction.status==='processing'?'pending_payment':'cancelled';
  await db.prepare('UPDATE orders SET status=? WHERE id=? AND user_id=?').run(order.status,order.id,user.id);
  if(order.status!=='pending_payment')await db.prepare('UPDATE checkout_payments SET cart_key=NULL WHERE order_id=?').run(order.id);
  return publicPayment(db,order,payment);
}
