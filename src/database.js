import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { databaseConfiguration, databaseConfigurationError } from './database-config.js';

const schema = [
  'CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), expires INTEGER)',
  'CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), created TEXT, total INTEGER, items TEXT, username TEXT, status TEXT)',
  'CREATE TABLE IF NOT EXISTS checkout_payments(order_id TEXT PRIMARY KEY REFERENCES orders(id), cart_key TEXT UNIQUE, transaction_id TEXT UNIQUE, pix_code TEXT, expires TEXT)'
];
let pending;
async function connect() {
  const config = databaseConfiguration(process.env,{required:Boolean(process.env.VERCEL)});
  if (config) {
    const { createClient } = await import('@libsql/client/http');
    const client = createClient({ url:config.url, authToken:config.authToken });
    try{await client.batch(schema, 'write');}
    catch{
      client.close();
      throw databaseConfigurationError('connection_failed',config.variableNames);
    }
    return {
      close() { client.close(); },
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
