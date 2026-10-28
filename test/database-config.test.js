import {test} from 'node:test';
import assert from 'node:assert/strict';
import {databaseConfiguration} from '../src/database-config.js';

test('configuração aceita valores copiados com aspas/espaços e nomes libSQL sem misturar bancos',()=>{
  const config=databaseConfiguration({TURSO_DATABASE_URL:' "libsql://realbux.example.test" ',TURSO_AUTH_TOKEN:" 'test-token' "},{required:true});
  assert.equal(config.url,'libsql://realbux.example.test');assert.equal(config.authToken,'test-token');
  const integrated=databaseConfiguration({TURSO_DATABASE_URL:'libsql://incomplete.example.test',LIBSQL_URL:'libsql://integration.example.test',LIBSQL_AUTH_TOKEN:'integration-test-token'},{required:true});
  assert.equal(integrated.url,'libsql://integration.example.test');assert.equal(integrated.authToken,'integration-test-token');
  const alias=databaseConfiguration({LIBSQL_DATABASE_URL:'https://integration.example.test',LIBSQL_AUTH_TOKEN:'test-token'},{required:true});
  assert.equal(alias.url,'https://integration.example.test');
});
test('diagnóstico distingue URL ausente, token ausente e URL inválida sem expor valores',()=>{
  for(const [env,reason] of [
    [{},'missing_database_url'],
    [{TURSO_AUTH_TOKEN:'test-token'},'missing_database_url'],
    [{TURSO_DATABASE_URL:'libsql://db.example.test'},'missing_auth_token'],
    [{TURSO_DATABASE_URL:'postgres://db.example.test',TURSO_AUTH_TOKEN:'test-token'},'invalid_database_url'],
    [{TURSO_DATABASE_URL:'https://user:password@db.example.test',TURSO_AUTH_TOKEN:'test-token'},'invalid_database_url']
  ])assert.throws(()=>databaseConfiguration(env,{required:true}),e=>e.reason===reason&&e.status===503&&!e.message.includes('test-token')&&!e.message.includes('password@'));
  assert.equal(databaseConfiguration({}),null);
});
