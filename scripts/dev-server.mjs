import {createServer} from "node:http";
import {readFile, stat} from "node:fs/promises";
import {resolve, sep} from "node:path";
import {BASE_PATH} from "./site-config.mjs";

const root = resolve(new URL("../docs/", import.meta.url).pathname);
const prefix = BASE_PATH;
const port = Number(process.env.PORT || 8000);
const mime = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml"};

createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname); }
  catch { response.writeHead(400).end("Bad request"); return; }
  if (pathname === prefix.slice(0, -1)) { response.writeHead(308, {Location: prefix}).end(); return; }
  if (!pathname.startsWith(prefix)) { response.writeHead(404).end("Not found"); return; }
  const relative = pathname.slice(prefix.length);
  let file = resolve(root, relative);
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end("Forbidden"); return; }
  try {
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    const extension = file.slice(file.lastIndexOf("."));
    response.writeHead(200, {"Content-Type": mime[extension] || "application/octet-stream"}).end(body);
  } catch { response.writeHead(404).end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`Open http://127.0.0.1:${port}${prefix}`));
