import http from 'node:http';
import { database } from './database.js';
import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../public/catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const attempts = new Map();
const publicUser = u => u ? {id:u.id,name:u.name,email:u.email} : null;
function passwordHash(p, salt = randomBytes(16).toString('hex')) { return `${salt}:${scryptSync(p,salt,64).toString('hex')}`; }
function verify(p, stored) { const [salt,hash] = stored.split(':'); return timingSafeEqual(Buffer.from(hash,'hex'), Buffer.from(passwordHash(p,salt).split(':')[1],'hex')); }
function fail(message,status=400) { throw Object.assign(new Error(message),{status}); }
async function body(req) {
  if (req.body !== undefined) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 16384) fail('Requisição muito grande.',413);
    let value=req.body;
    if (typeof value==='string') { try { value=JSON.parse(value); } catch { fail('Dados inválidos.'); } }
    if (!value || typeof value!=='object' || Array.isArray(value)) fail('Dados inválidos.');
    return value;
  }
  let raw='';
  for await (const chunk of req) {raw+=chunk; if(Buffer.byteLength(raw)>16384) fail('Requisição muito grande.',413);}
  try {const value=JSON.parse(raw || '{}');if(!value || typeof value!=='object' || Array.isArray(value)) fail('Dados inválidos.'); return value;} catch {fail('Dados inválidos.');}
}
async function session(req, db) {
  const token = (req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('realm_session='))?.slice(14);
  return await db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(token || '',Date.now());
}
async function setSession(res,id,db) {
  const token=randomBytes(32).toString('hex');
  await db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
  await db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(token,id,Date.now()+7*86400000);
  res.setHeader('Set-Cookie',`realm_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${(process.env.COOKIE_SECURE === 'true' || process.env.VERCEL) ? '; Secure' : ''}`);
}
function limit(req,email) {
  const key=`${req.socket.remoteAddress}:${email}`; const now=Date.now();
  if(attempts.size>5000) for(const [k,v] of attempts) if(now-v.start>600000) attempts.delete(k);
  let a=attempts.get(key); if(!a || now-a.start>600000) attempts.set(key,a={start:now,count:0});
  if(++a.count>15) fail('Muitas tentativas. Tente novamente em 10 minutos.',429);
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
export async function handler(req,res) {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try {
    const url=new URL(req.url,'http://localhost'); const path=url.pathname;
    if(path.startsWith('/api/')) {
      if(req.method==='POST' && req.headers.origin && req.headers.origin!==`http://${req.headers.host}` && req.headers.origin!==`https://${req.headers.host}`) fail('Origem não permitida.',403);
      if(path==='/api/catalog' && req.method==='GET') return send({products});
      if(path==='/api/me' && req.method==='GET' && !(req.headers.cookie||'').includes('realm_session=')) return send({user:null});
      const db=await database();
      const user=await session(req,db);
      if(path==='/api/me' && req.method==='GET') return send({user:publicUser(user)});
      if(['/api/register','/api/login'].includes(path) && req.method==='POST') {
        const data=await body(req); const email=String(data.email||'').trim().toLowerCase(); const password=String(data.password||'');
        limit(req,email);
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || password.length<8 || password.length>128) fail('Informe um e-mail válido e uma senha de 8 a 128 caracteres.');
        let account=await db.prepare('SELECT * FROM users WHERE email=?').get(email);
        if(path==='/api/register') {
          const name=String(data.name||'').trim();if(name.length<2 || name.length>80) fail('Informe um nome de 2 a 80 caracteres.');
          if(account) fail('Este e-mail já está cadastrado.',409);
          account={id:randomUUID(),name,email};await db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(account.id,name,email,passwordHash(password));
        } else if(!account || !verify(password,account.password)) fail('E-mail ou senha incorretos.',401);
        await setSession(res,account.id,db);return send({user:publicUser(account)});
      }
      if(path==='/api/logout' && req.method==='POST') {
        const token=(req.headers.cookie||'').match(/(?:^|;\s*)realm_session=([^;]+)/)?.[1];
        if(token) await db.prepare('DELETE FROM sessions WHERE token=?').run(token);
        res.setHeader('Set-Cookie','realm_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');return send({ok:true});
      }
      if(!user) fail('Entre na sua conta para continuar.',401);
      if(path==='/api/profile' && req.method==='POST') {
        const data=await body(req); const name=String(data.name||'').trim();
        if(name.length<2 || name.length>80) fail('Informe um nome de 2 a 80 caracteres.');
        await db.prepare('UPDATE users SET name=? WHERE id=?').run(name,user.id);return send({user:{...publicUser(user),name}});
      }
      if(path==='/api/password' && req.method==='POST') {
        const data=await body(req);limit(req,user.email);
        if(typeof data.current!=='string' || !verify(data.current,user.password)) fail('A senha atual está incorreta.');
        if(typeof data.password!=='string' || data.password.length<8 || data.password.length>128) fail('A nova senha deve ter entre 8 e 128 caracteres.');
        await db.prepare('UPDATE users SET password=? WHERE id=?').run(passwordHash(data.password),user.id);
        await db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);await setSession(res,user.id,db);return send({ok:true});
      }
      if(path==='/api/orders' && req.method==='GET') return send({orders:(await db.prepare("SELECT * FROM orders WHERE user_id=? AND status IN ('pending_payment','paid','fulfilled','cancelled','refunded') ORDER BY created DESC").all(user.id)).map(o=>({...o,items:JSON.parse(o.items),total:o.total/100}))});
      if(path==='/api/orders' && req.method==='POST') {
        return send({error:'Pagamento indisponível no momento. Seu carrinho foi mantido.',code:'CHECKOUT_UNAVAILABLE'},503);
      }
      fail('Rota não encontrada.',404);
    }
    if(!['GET','HEAD'].includes(req.method)) fail('Método não permitido.',405);
    let file=resolve(root,'.'+decodeURIComponent(path));
    if(!file.startsWith(root+sep) && file!==root) fail('Acesso negado.',403);
    try {if(!statSync(file).isFile()) file=resolve(root,'index.html');} catch {if(extname(path)) fail('Arquivo não encontrado.',404); file=resolve(root,'index.html');}
    const content=readFileSync(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:content);
  } catch(e) {
    if(e.code==='ACCOUNT_DATABASE_NOT_CONFIGURED')console.error('[ACCOUNT_DATABASE_NOT_CONFIGURED] Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN no projeto da Vercel.');
    else if(!e.status)console.error(e);
    send({error:e.publicMessage||(e.status?e.message:'Não foi possível concluir. Tente novamente.'),...(e.code?{code:e.code}:{})},e.status||500);
  }
}
export const server=http.createServer(handler);
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log(`REALBUX em execução na porta ${process.env.PORT||3000}`));
