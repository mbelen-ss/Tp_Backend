/**
 * server.js
 * Servidor simple en Node.js (sin Express) que expone:
 * GET  /concepts       -> devuelve array de conceptos (JSON)
 * GET  /concepts/:id   -> devuelve un concepto por id (number)
 * DELETE /concepts      -> borra todos los conceptos
 * DELETE /concepts/:id -> borra un concepto por id
 *
 * Persistencia simple en concepts.json (opcional, el servidor intenta leer/escribir).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'concepts.json');

let concepts = [];

// cargar si existe archivo
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    concepts = raw ? JSON.parse(raw) : [];
  }
} catch (err) {
  console.error('Error leyendo el archivo de datos:', err);
  concepts = [];
}

// asegurar ids consecutivos
let nextId = concepts.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(concepts, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando datos:', err);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS básico (permite fetch desde tu archivo local o desde otro puerto)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // GET /concepts
  if (pathname === '/concepts' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(concepts));
  }

  // GET /concepts/:id
  const m = pathname.match(/^\/concepts\/(\d+)$/);
  if (m && req.method === 'GET') {
    const id = Number(m[1]);
    const item = concepts.find(c => c.id === id);
    if (!item) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ error: 'not found' }));
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(item));
  }

  // DELETE /concepts  (borra todo)
  if (pathname === '/concepts' && req.method === 'DELETE') {
    concepts.length = 0;
    save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({ ok: true, message: 'All deleted' }));
  }

  // DELETE /concepts/:id  (borra por id)
  if (m && req.method === 'DELETE') {
    const id = Number(m[1]);
    const idx = concepts.findIndex(c => c.id === id);
    if (idx === -1) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ error: 'not found' }));
    }
    const removed = concepts.splice(idx, 1)[0];
    save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({ ok: true, removed }));
  }

  // ruta no encontrada
  res.writeHead(404, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ error: 'route not found' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
