import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.xls': 'application/vnd.ms-excel', '.zip': 'application/zip' };

http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/gmc-decision-lab' || pathname.startsWith('/gmc-decision-lab/')) {
    pathname = pathname.slice('/gmc-decision-lab'.length);
  }
  if (pathname === '/') pathname = '/index.html';
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403).end(); return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, '404.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(4175, '127.0.0.1', () => console.log('Pages preview: http://127.0.0.1:4175/gmc-decision-lab/'));
