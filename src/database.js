import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const schema = [
  'CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), expires INTEGER)',
  'CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), created TEXT, total INTEGER, items TEXT, username TEXT, status TEXT)'
];
let pending;
async function connect() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    if (!/^(libsql|https):\/\//.test(url) || !process.env.TURSO_AUTH_TOKEN) {
      throw Object.assign(new Error('Configure TURSO_DATABASE_URL (libsql:// ou https://) e TURSO_AUTH_TOKEN para o banco persistente.'), { status: 503 });
    }
    const { createClient } = await import('@libsql/client/http');
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    await client.batch(schema, 'write');
    return {
      prepare(sql) {
        const execute = args => client.execute({ sql, args });
        return {
          get: async (...args) => (await execute(args)).rows[0],
          all: async (...args) => (await execute(args)).rows,
          run: async (...args) => execute(args)
        };
      }
    };
  }
  if (process.env.VERCEL) {
    throw Object.assign(new Error('Banco persistente não configurado. Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN nas configurações da Vercel.'), { status: 503 });
  }
  const { DatabaseSync } = await import('node:sqlite');
  const path = process.env.DB_PATH || resolve(dirname(fileURLToPath(import.meta.url)), '../data/store.sqlite');
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  for (const sql of schema) db.exec(sql);
  return db;
}
export async function database() {
  if (!pending) pending = connect().catch(error => { pending = undefined; throw error; });
  return pending;
}
