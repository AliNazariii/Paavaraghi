import {createServer} from "node:http";
import {readFile, mkdir} from "node:fs/promises";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {randomBytes} from "node:crypto";
import {isIP} from "node:net";
import {createStore} from "./database.mjs";
import {createApp} from "./app.mjs";
import {createZarinpal} from "./payments.mjs";
import {createMailer} from "./mail.mjs";

const env = process.env;
const root = resolve(env.STORE_ROOT || fileURLToPath(new URL("../dist/", import.meta.url)));
const appUrl = new URL(env.APP_URL || "http://127.0.0.1:3000");
if (appUrl.pathname !== "/" || !["http:", "https:"].includes(appUrl.protocol)) throw new Error("APP_URL must be an HTTP(S) domain root.");
if (env.NODE_ENV === "production" && appUrl.protocol !== "https:") throw new Error("Production APP_URL must use HTTPS.");
const secret = env.SESSION_SECRET || (env.NODE_ENV === "production" ? "" : randomBytes(48).toString("hex"));
if (secret.length < 32 || secret.startsWith("replace-")) throw new Error("Set a random SESSION_SECRET of at least 32 characters.");
const filename = resolve(env.DATABASE_PATH || ".local/paavaraghi.sqlite");
await mkdir(dirname(filename), {recursive: true, mode: 0o700});
const sandbox = env.ZARINPAL_SANDBOX !== "false";
const store = createStore(filename, secret, Date.now, sandbox ? "sandbox" : "live");
const catalog = JSON.parse(await readFile(resolve(root, "catalog.json"), "utf8"));
const mailer = createMailer(env);
const merchantValid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(env.ZARINPAL_MERCHANT_ID || "");
const gateway = env.CHECKOUT_ENABLED === "true" && merchantValid && mailer ? createZarinpal({merchantId: env.ZARINPAL_MERCHANT_ID, sandbox}) : null;
const handle = createApp({root, catalog, store, appUrl: appUrl.href, gateway, mailer, sandbox});
const server = createServer(async (req, res) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16384) { res.writeHead(413).end("Request too large"); return; }
      chunks.push(chunk);
    }
    const request = new Request(new URL(req.url, appUrl), {method: req.method, headers: req.headers, ...(!["GET", "HEAD"].includes(req.method) ? {body: Buffer.concat(chunks)} : {})});
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const ip = env.TRUST_PROXY === "true" && isIP(forwarded) ? forwarded : req.socket.remoteAddress;
    const response = await handle(request, {ip});
    for (const [name, value] of response.headers) if (name !== "set-cookie") res.setHeader(name, value);
    const cookies = response.headers.getSetCookie();
    if (cookies.length) res.setHeader("set-cookie", cookies);
    res.statusCode = response.status;
    res.end(req.method === "HEAD" ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch {
    if (!res.headersSent) res.writeHead(500, {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"});
    res.end("مشکلی پیش آمد؛ کمی بعد دوباره تلاش کن.");
  }
});
server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.listen(Number(env.PORT || 3000), env.HOST || "127.0.0.1", () => {
  console.log(`Paavaraghi is listening on port ${env.PORT || 3000}. Checkout: ${gateway ? sandbox ? "sandbox" : "live" : "disabled"}.`);
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));

