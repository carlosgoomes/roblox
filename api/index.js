import { handler } from '../src/server.js';

// Vercel routes all API paths here; keep the original API path for the shared handler.
export default function vercelHandler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const route = url.searchParams.get('route');
  if (route !== null) {
    if (!/^[a-z]+$/.test(route)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
      return;
    }
    req.url = '/api/' + route;
  }
  return handler(req, res);
}
