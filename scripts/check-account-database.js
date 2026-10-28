import { database } from '../src/database.js';
import { databaseConfiguration } from '../src/database-config.js';

let db;
try{
  const config=databaseConfiguration(process.env,{required:true});
  console.log('Configuração encontrada: '+config.variableNames.join(', '));
  db=await database();
  const result=await db.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type='table' AND name IN ('users','sessions','orders')").get();
  if(Number(result?.total)!==3)throw new Error('SCHEMA_NOT_READY');
  console.log('Conexão confirmada. Tabelas de contas, sessões e pedidos estão disponíveis.');
  console.log('Depois do deploy, valide cadastro e login na URL publicada.');
}catch(error){
  console.error('Não foi possível validar o banco remoto.');
  console.error('Diagnóstico: '+(error.reason||'database_check_failed'));
  if(error.variableNames?.length)console.error('Confira as variáveis: '+error.variableNames.join(', '));
  console.error('Consulte CADASTRO.md. Não envie tokens pelo chat.');
  process.exitCode=1;
}finally{db?.close?.();}
