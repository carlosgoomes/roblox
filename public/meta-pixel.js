export const pixelId='1127472739650574';
let lastPage=null;

function pixel(){
  if(typeof window==='undefined')return null;
  return window.fbq||null;
}

function track(name,params={},eventId){
  try{
    const fbq=pixel();
    if(!fbq)return false;
    fbq('trackSingle',pixelId,name,params,...(eventId?[{eventID:eventId}]:[]));
    return true;
  }catch{return false;}
}

function cartData(items){
  return {
    content_type:'product',content_ids:items.map(p=>p.id),
    contents:items.map(p=>({id:p.id,quantity:p.quantity,item_price:p.price})),
    num_items:items.reduce((sum,p)=>sum+p.quantity,0),
    value:items.reduce((sum,p)=>sum+Math.round(p.price*100)*p.quantity,0)/100,currency:'BRL'
  };
}

export function trackNavigation(product,items=[]){
  const page=location.pathname+location.search;
  if(page===lastPage)return;
  const firstPage=lastPage===null;
  lastPage=page;
  // The official base code already sends the first PageView.
  if(!firstPage)track('PageView');
  if(product)track('ViewContent',{content_ids:[product.id],content_type:'product',content_name:product.name,value:product.price,currency:'BRL'});
  if(location.pathname==='/checkout'&&items.length)track('InitiateCheckout',cartData(items));
}

export function trackAddToCart(product,quantity){
  track('AddToCart',cartData([{...product,quantity}]));
}

export function trackPurchase(order){
  if(!['paid','fulfilled'].includes(order.status))return;
  let sent=[];
  try{sent=JSON.parse(localStorage.getItem('realbux-meta-purchases')||'[]');if(!Array.isArray(sent))sent=[];}catch{}
  if(sent.includes(order.id))return;
  if(track('Purchase',{...cartData(order.items),value:order.total},'realbux_purchase_'+order.id)){
    try{localStorage.setItem('realbux-meta-purchases',JSON.stringify([...sent,order.id].slice(-200)));}catch{}
  }
}
