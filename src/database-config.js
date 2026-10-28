const pairs=[
  ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN'],
  ['LIBSQL_URL','LIBSQL_AUTH_TOKEN'],
  ['LIBSQL_DATABASE_URL','LIBSQL_AUTH_TOKEN']
];
function clean(value){
  let text=typeof value==='string'?value.trim():'';
  if(text.length>=2&&((text.startsWith('"')&&text.endsWith('"'))||(text.startsWith("'")&&text.endsWith("'"))))text=text.slice(1,-1).trim();
  return text;
}
export function databaseConfigurationError(reason,variableNames=[]){
  return Object.assign(new Error('Configuração do banco de contas incompleta ou indisponível.'),{
    status:503,code:'ACCOUNT_DATABASE_NOT_CONFIGURED',reason,variableNames,
    publicMessage:'O serviço de contas está temporariamente indisponível. Tente novamente mais tarde.'
  });
}
export function databaseConfiguration(env=process.env,{required=false}={}){
  const complete=pairs.find(([url,token])=>clean(env[url])&&clean(env[token]));
  const partial=pairs.find(([url,token])=>clean(env[url])||clean(env[token]));
  const names=complete||partial;
  if(!names){
    if(required)throw databaseConfigurationError('missing_database_url',pairs[0]);
    return null;
  }
  const [urlName,tokenName]=names;
  const url=clean(env[urlName]),authToken=clean(env[tokenName]);
  if(!url)throw databaseConfigurationError('missing_database_url',[urlName]);
  if(!authToken)throw databaseConfigurationError('missing_auth_token',[tokenName]);
  try{
    const parsed=new URL(url);
    if(!['libsql:','https:'].includes(parsed.protocol)||!parsed.hostname||parsed.username||parsed.password)throw Error('invalid');
  }catch{throw databaseConfigurationError('invalid_database_url',[urlName]);}
  return {url,authToken,variableNames:names};
}
