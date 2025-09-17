// server.js — Servidor estático + API REST 
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = __dirname; // raíz del proyecto, donde está index.html
const DATA_FILE = path.join(__dirname, 'concepts.json');

let concepts = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    concepts = raw ? JSON.parse(raw) : [];
  }
} catch (err) {
  console.error('Error leyendo concepts.json:', err);
  concepts = [];
}

let nextId = concepts.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(concepts, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando concepts.json:', err);
  }
}

function sendJSON(res, status = 200, payload = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res, pathname) {
  // map root / to /index.html
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const abs = path.join(PUBLIC_DIR, decodeURIComponent(filePath));
  if (!abs.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(abs, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('Not Found');
    }
    const ext = path.extname(abs).toLowerCase();
    const mime = {
      '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
      '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
      '.svg':'image/svg+xml', '.ico':'image/x-icon'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': mime});
    fs.createReadStream(abs).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const base = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = base.pathname;

  // CORS:
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204); return res.end();
  }

  // LOG simple para ver peticiones
  console.log(`${new Date().toISOString()} ${req.method} ${pathname}`);

  // ---- API bajo /api/concepts ----
  if (pathname === '/api/concepts' && req.method === 'GET') {
    return sendJSON(res, 200, concepts);
  }

  const matchId = pathname.match(/^\/api\/concepts\/(\d+)$/);
  if (matchId && req.method === 'GET') {
    const id = Number(matchId[1]);
    const item = concepts.find(c => c.id === id);
    if (!item) return sendJSON(res, 404, { error: 'not found' });
    return sendJSON(res, 200, item);
  }

  if (pathname === '/api/concepts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const obj = JSON.parse(body);
        if (!obj.nombre || !obj.descripcion) return sendJSON(res, 400, { error: 'nombre y descripcion obligatorios' });
        const nuevo = { id: nextId++, nombre: String(obj.nombre), descripcion: String(obj.descripcion) };
        concepts.push(nuevo);
        save();
        return sendJSON(res, 201, nuevo);
      } catch (err) {
        return sendJSON(res, 400, { error: 'JSON inválido' });
      }
    });
    return;
  }

  if (matchId && req.method === 'PUT') {
    const id = Number(matchId[1]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const obj = JSON.parse(body);
        const idx = concepts.findIndex(c => c.id === id);
        if (idx === -1) return sendJSON(res, 404, { error: 'not found' });
        if (obj.nombre !== undefined) concepts[idx].nombre = String(obj.nombre);
        if (obj.descripcion !== undefined) concepts[idx].descripcion = String(obj.descripcion);
        save();
        return sendJSON(res, 200, concepts[idx]);
      } catch (err) {
        return sendJSON(res, 400, { error: 'JSON inválido' });
      }
    });
    return;
  }

  if (pathname === '/api/concepts' && req.method === 'DELETE') {
    concepts.length = 0; save(); return sendJSON(res, 200, { ok: true, message: 'All deleted' });
  }
  if (matchId && req.method === 'DELETE') {
    const id = Number(matchId[1]);
    const idx = concepts.findIndex(c => c.id === id);
    if (idx === -1) return sendJSON(res, 404, { error: 'not found' });
    const removed = concepts.splice(idx,1)[0]; save();
    return sendJSON(res, 200, { ok: true, removed });
  }

  // ---- archivos estáticos desde la raíz ----
  
  serveStatic(req, res, pathname);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
