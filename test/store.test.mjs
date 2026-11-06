import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile, stat, readdir, mkdtemp, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
import {createStore} from "../server/database.mjs";
import {createApp} from "../server/app.mjs";
import {createZarinpal} from "../server/payments.mjs";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const catalog = JSON.parse(await readFile(join(root, "catalog.json"), "utf8"));
const origin = "https://paavaraghi.example";
const secret = "test-only-secret-for-payment-and-login-tests";
function setup(t, options = {}) {
  const store = createStore(":memory:", secret, options.now);
  t.after(() => store.close());
  const messages = [], requests = [], verifications = [];
  let counter = 0;
  const gateway = {
    async request(input) {
      if (options.requestError) throw new Error("Unavailable");
      const authority = `A${String(++counter).padStart(35, "0")}`;
      requests.push({...input, authority});
      return {authority, url: `https://payment.zarinpal.com/pg/StartPay/${authority}`};
    },
    async verify(input) {
      verifications.push(input);
      if (options.verifyError) throw new Error("Timeout");
      return {paid: options.paid !== false, reference: String(10000 + counter)};
    }
  };
  const mailer = async message => { if (options.mailError) throw new Error("Mail unavailable"); messages.push(message); };
  const app = createApp({root, catalog, store, appUrl: origin, gateway: options.disabled ? null : gateway, mailer: options.disabled ? null : mailer, sandbox: true});
  function client(ip) {
    const cookies = new Map();
    return async (path, fields, headers = {}) => {
      const response = await app(new Request(`${origin}${path}`, {method: fields ? "POST" : "GET", headers: {cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join("; "), ...(fields ? {Origin: origin, "Content-Type": "application/x-www-form-urlencoded"} : {}), ...headers}, ...(fields ? {body: new URLSearchParams(fields)} : {})}), {ip});
      for (const value of response.headers.getSetCookie()) {
        const [name, token] = value.split(";")[0].split("=");
        if (token) cookies.set(name, token); else cookies.delete(name);
      }
      return response;
    };
  }
  async function authenticate(client, email = "reader@example.com") {
    assert.equal((await client("/account/login", {email, next: "/account/library"})).status, 303);
    const code = messages.at(-1).code;
    assert.equal((await client("/account/code", {code, next: "/account/library"})).status, 303);
    return code;
  }
  return {store, messages, requests, verifications, client, authenticate};
}

test("paid HTML is absent from the public build; Homer, prices, samples and sources are public", async () => {
  const allowed = new Set(["index.html", "franny/index.html", "sources/index.html"]);
  async function htmlFiles(directory, prefix = "") {
    const paths = [];
    for (const item of await readdir(directory, {withFileTypes: true})) {
      const relative = prefix + item.name;
      if (item.isDirectory()) paths.push(...await htmlFiles(join(directory, item.name), relative + "/"));
      else if (item.name.endsWith(".html")) paths.push(relative);
    }
    return paths;
  }
  assert.deepEqual(new Set(await htmlFiles(join(root, "public/franny-and-zooey"))), allowed);
  for (const product of catalog.products.filter(product => product.samplePath)) {
    const files = await htmlFiles(join(root, "public", product.id));
    assert.deepEqual(new Set(files), new Set(["index.html", `${product.samplePath}index.html`, "sources/index.html"]));
  }
  await stat(join(root, "private/franny-and-zooey/zooey/index.html"));
  await stat(join(root, "public/homer/odyssey/book-24/index.html"));
  const sitemap = await readFile(join(root, "public/sitemap.xml"), "utf8");
  assert.ok(sitemap.includes("/pricing/"));
  assert.ok(!sitemap.includes("/zooey/"));
});

test("public previews and all free Homer routes work without a login; full paid routes are gated", async t => {
  const s = setup(t), guest = s.client("guest");
  for (const path of ["/", "/pricing/", "/products/collection/", "/homer/iliad/book-24/", "/franny-and-zooey/franny/", "/ahl-e-gharq/chapters/1/", "/nimeye-tarik-e-mah/stories/chenar/"]) assert.equal((await guest(path)).status, 200, path);
  for (const path of ["/franny-and-zooey/zooey/", "/franny-and-zooey/zooey/index.html", "/ahl-e-gharq/chapters/2/", "/nimeye-tarik-e-mah/stories/dahliz/"]) assert.equal((await guest(path)).status, 303, path);
  assert.equal((await guest("/private/franny-and-zooey/zooey/index.html")).status, 404);
  assert.equal((await guest("/.env")).status, 404);
  assert.equal((await guest("/account/library")).status, 303);
});

test("unconfigured checkout explains its availability before asking for login", async t => {
  const s = setup(t, {disabled: true}), guest = s.client("guest");
  for (const fields of [undefined, {}]) {
    const response = await guest("/checkout/franny-and-zooey", fields);
    assert.equal(response.status, 503);
    assert.ok((await response.text()).includes("خرید موقتاً در دسترس نیست"));
  }
  assert.equal(s.requests.length, 0);
  assert.equal(s.messages.length, 0);
  assert.equal((await guest("/pricing/")).status, 200);
});

test("login, server-priced checkout, verified payment, receipt, access, logout and recovery", async t => {
  const s = setup(t), reader = s.client("reader"), stranger = s.client("stranger");
  const code = await s.authenticate(reader);
  assert.equal((await reader("/account/code", {code})).status, 401, "one-time code cannot be reused");
  assert.equal((await reader("/checkout/franny-and-zooey", {amount: "1", price: "1"})).status, 303);
  const payment = s.requests[0];
  assert.equal(payment.amountRial, 1990000);
  assert.equal(payment.callbackUrl, `${origin}/payments/zarinpal/callback`);
  assert.equal((await reader("/franny-and-zooey/zooey/")).status, 303, "requesting payment alone does not unlock content");
  const response = await reader(`/payments/zarinpal/callback?Authority=${payment.authority}&Status=OK`);
  assert.equal(response.status, 303);
  const receipt = response.headers.get("location");
  const content = await reader("/franny-and-zooey/zooey/");
  assert.equal(content.status, 200);
  assert.equal(content.headers.get("cache-control"), "private, no-store");
  assert.equal(content.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.ok((await content.text()).includes("زویی"));
  assert.ok((await (await reader(receipt)).text()).includes("شمارهٔ پیگیری"));
  await reader(`/payments/zarinpal/callback?Authority=${payment.authority}&Status=OK`);
  assert.equal(s.verifications.length, 1, "duplicate callbacks are idempotent");
  await reader(`/payments/zarinpal/callback?Authority=${payment.authority}&Status=NOK`);
  assert.equal((await reader("/franny-and-zooey/zooey/")).status, 200, "later cancellation cannot revoke a paid order");
  assert.equal((await reader("/checkout/franny-and-zooey", {})).headers.get("location"), "/account/library", "already owned guide isn't charged again");
  await s.authenticate(stranger, "other@example.com");
  assert.equal((await stranger(receipt)).status, 404, "receipts belong to the buyer");
  assert.equal((await stranger("/franny-and-zooey/zooey/")).status, 303);
  await reader("/account/logout", {});
  assert.equal((await reader("/franny-and-zooey/zooey/")).status, 303);
  await s.authenticate(reader);
  assert.equal((await reader("/franny-and-zooey/zooey/")).status, 200, "same email restores purchases");
});

test("failed, cancelled, unknown and unverified payments never grant access", async t => {
  const s = setup(t, {paid: false}), reader = s.client("reader");
  await s.authenticate(reader);
  await reader("/checkout/ahl-e-gharq", {});
  const authority = s.requests[0].authority;
  await reader(`/payments/zarinpal/callback?Authority=${authority}&Status=NOK`);
  assert.equal(s.verifications.length, 0);
  await reader(`/payments/zarinpal/callback?Authority=${authority}&Status=OK`);
  assert.equal((await reader("/ahl-e-gharq/chapters/2/")).status, 303);
  assert.equal((await reader("/payments/zarinpal/callback?Authority=unknown&Status=OK")).status, 404);
  assert.equal((await reader(`/payments/zarinpal/callback?Authority=${authority}&Authority=unknown&Status=OK`)).status, 404);
});

test("gateway timeout keeps the same pending order available for verification without paying again", async t => {
  const s = setup(t, {verifyError: true}), reader = s.client("reader");
  await s.authenticate(reader);
  await reader("/checkout/ahl-e-gharq", {});
  assert.equal((await reader(`/payments/zarinpal/callback?Authority=${s.requests[0].authority}&Status=OK`)).status, 502);
  assert.equal(s.store.authority(s.requests[0].authority).status, "pending");
  assert.equal((await reader("/ahl-e-gharq/chapters/2/")).status, 303);
});

test("bundle grants exactly the three paid guides at the server's saved bundle price", async t => {
  const s = setup(t), reader = s.client("reader");
  await s.authenticate(reader);
  await reader("/checkout/collection", {price: "0"});
  assert.equal(s.requests[0].amountRial, 4490000);
  await reader(`/payments/zarinpal/callback?Authority=${s.requests[0].authority}&Status=OK`);
  for (const path of ["/franny-and-zooey/zooey/", "/ahl-e-gharq/chapters/34/", "/nimeye-tarik-e-mah/stories/dahliz/"]) assert.equal((await reader(path)).status, 200);
});

test("cross-site POST, open redirects, expired OTPs and excessive code requests are rejected", async t => {
  let now = Date.now();
  const s = setup(t, {now: () => now}), reader = s.client("reader");
  assert.equal((await reader("/account/login", {email: "reader@example.com"}, {Origin: "https://attacker.example"})).status, 403);
  const loginResponse = await reader("/account/login", {email: "reader@example.com", next: "//attacker.example"});
  assert.equal(loginResponse.status, 303);
  assert.equal(new URL(loginResponse.headers.get("location"), origin).searchParams.get("next"), "/account/library");
  const code = s.messages.at(-1).code;
  now += 11 * 60000;
  assert.equal((await reader("/account/code", {code})).status, 401);
  const s2 = setup(t), c2 = s2.client("second");
  for (let i = 0; i < 3; i++) assert.equal((await c2("/account/login", {email: "reader@example.com"})).status, 303);
  assert.equal((await c2("/account/login", {email: "reader@example.com"})).status, 429);
});

test("five wrong OTP guesses exhaust a challenge; cookies are secure and HttpOnly", async t => {
  const s = setup(t), reader = s.client("reader");
  const sent = await reader("/account/login", {email: "reader@example.com"});
  assert.match(sent.headers.getSetCookie()[0], /HttpOnly; SameSite=Lax; Max-Age=600; Secure/);
  const real = s.messages[0].code, wrong = real === "111111" ? "222222" : "111111";
  for (let i = 0; i < 5; i++) assert.equal((await reader("/account/code", {code: wrong})).status, 401);
  assert.equal((await reader("/account/code", {code: real})).status, 401);
});

test("Zarinpal adapter uses official endpoints, explicit rial, and verified references only", async () => {
  const calls = [];
  let code = 100, reference = 12345;
  const adapter = createZarinpal({merchantId: "test-merchant", sandbox: false, fetchImpl: async (url, options) => {
    calls.push({url, body: JSON.parse(options.body)});
    return Response.json({data: url.includes("request") ? {code: 100, authority: `A${"0".repeat(35)}`} : {code, ref_id: reference}});
  }});
  const requested = await adapter.request({amountRial: 1990000, description: "Guide", callbackUrl: `${origin}/payments/zarinpal/callback`, orderId: "test-order"});
  assert.equal(calls[0].url, "https://payment.zarinpal.com/pg/v4/payment/request.json");
  assert.equal(calls[0].body.currency, "IRR");
  assert.equal(calls[0].body.amount, 1990000);
  assert.ok(requested.url.startsWith("https://payment.zarinpal.com/pg/StartPay/"));
  for (const value of [100, 101]) { code = value; assert.equal((await adapter.verify({authority: requested.authority, amountRial: 1990000})).paid, true); }
  reference = undefined;
  assert.equal((await adapter.verify({authority: requested.authority, amountRial: 1990000})).paid, false);
  code = -51; reference = 12345;
  assert.equal((await adapter.verify({authority: requested.authority, amountRial: 1990000})).paid, false);
});

test("sandbox purchases cannot unlock live content or be reverified against the live gateway", async t => {
  const directory = await mkdtemp(join(tmpdir(), "paavaraghi-scope-"));
  t.after(() => rm(directory, {recursive: true, force: true}));
  const filename = join(directory, "store.sqlite");
  const sandbox = createStore(filename, secret, Date.now, "sandbox");
  const challenge = sandbox.challenge("reader@example.com");
  const {user} = sandbox.authenticate(challenge.id, challenge.code);
  const order = sandbox.createOrder(user.id, catalog.products[0]);
  sandbox.pending(order.id, `S${"0".repeat(35)}`);
  sandbox.paid(order.id, "12345");
  assert.equal(sandbox.owned(user.id).size, 1);
  sandbox.close();
  const live = createStore(filename, secret, Date.now, "live");
  assert.equal(live.owned(user.id).size, 0);
  assert.equal(live.order(order.id), undefined);
  assert.equal(live.authority(`S${"0".repeat(35)}`), undefined);
  live.close();
});
