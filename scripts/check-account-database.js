import { database } from '../src/database.js';

// Never validate a local fallback when the operator needs a production database.
const missing=['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN'].filter(name=>!process.env[name]?.trim());
if(missing.length){
  console.error('Banco de contas de produção não configurado.');
  console.error('Variáveis ausentes: '+missing.join(', '));
  console.error('Crie o banco no Turso e adicione essas variáveis nas configurações da Vercel. Consulte CADASTRO.md.');
  process.exitCode=1;
}else{
  let db;
  try{
    db=await database();
    const result=await db.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type='table' AND name IN ('users','sessions','orders')").get();
    if(Number(result?.total)!==3)throw new Error('SCHEMA_NOT_READY');
    console.log('Conexão confirmada. Tabelas de contas, sessões e pedidos estão disponíveis.');
    console.log('Depois do deploy, valide cadastro e login na URL publicada.');
  }catch(error){
    // Avoid dumping SDK errors or connection strings that could include credentials.
    console.error('Não foi possível validar o banco remoto. Confira URL, token e acesso de rede.');
    console.error('Código: '+(error.code==='ACCOUNT_DATABASE_NOT_CONFIGURED'?error.code:'ACCOUNT_DATABASE_CHECK_FAILED'));
    process.exitCode=1;
  }finally{db?.close?.();}
}
