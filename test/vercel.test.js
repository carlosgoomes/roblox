import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.VERCEL = '1';
delete process.env.TURSO_DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;
const { default: handler } = await import('../api/index.js');
const server = http.createServer(handler);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/api/index?route=`;
after(() => new Promise(resolve => server.close(resolve)));

test('entrada Vercel serve o catálogo e sessão anônima sem gravar banco efêmero', async () => {
  const catalog = await fetch(base + 'catalog');
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).products.length, 121);
  const me = await fetch(base + 'me');
  assert.equal(me.status, 200);
  assert.deepEqual(await me.json(), { user: null });
});

test('sem banco persistente, cadastro falha explicitamente em vez de perder dados', async () => {
  const response = await fetch(base + 'register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Teste Vercel', email: 'vercel@example.test', password: 'test-safe-password' })
  });
  assert.equal(response.status, 503);
  const value=await response.json();
  assert.equal(value.code,'ACCOUNT_DATABASE_NOT_CONFIGURED');
  assert.match(value.error,/serviço de contas está temporariamente indisponível/);
  assert.doesNotMatch(value.error,/TURSO_|token|Vercel/);
  const cookieRequest = await fetch(base + 'me', { headers: { Cookie: 'realm_session=test' } });
  assert.equal(cookieRequest.status, 503);
});

test('entrada Vercel rejeita rota inválida e origem externa', async () => {
  assert.equal((await fetch(base + '..%2Fprivate')).status, 404);
  const response = await fetch(base + 'register', {
    method: 'POST', headers: { Origin: 'https://external.example', 'Content-Type': 'application/json' }, body: '{}'
  });
  assert.equal(response.status, 403);
});
