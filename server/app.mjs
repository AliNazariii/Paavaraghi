import {readFile, stat} from "node:fs/promises";
import {resolve, sep, extname} from "node:path";
import {escape, money, page, offerContent, decorateReader} from "./html.mjs";

const cookieValue = (request, name) => {
  const entry = (request.headers.get("cookie") || "").split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry?.slice(name.length + 1) || "";
};
const safeNext = value => typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !/[\\\r\n]/.test(value) ? value : "/account/library";
const digits = value => String(value).replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)).replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
const mime = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ttf": "font/ttf", ".woff2": "font/woff2", ".woff": "font/woff"};

export function createApp({root, catalog, store, appUrl, gateway, mailer, sandbox = true}) {
  const origin = new URL(appUrl).origin;
  const secure = origin.startsWith("https:");
  const publicRoot = resolve(root, "public"), privateRoot = resolve(root, "private");
  const products = catalog.products;
  const bundle = products.find(product => product.id === "collection");
  const bookById = id => catalog.books.find(book => book.id === id);
  const cookie = (name, value, age) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure ? "; Secure" : ""}`;
  const html = (title, content, status = 200, headers = {}) => new Response(page(title, content, {sandbox}), {status, headers: {"Content-Type": "text/html; charset=utf-8", ...headers}});
  const redirect = location => new Response(null, {status: 303, headers: {Location: location}});
  const login = next => redirect(`/account/login?next=${encodeURIComponent(safeNext(next))}`);
  const loginForm = next => `<h1>ورود به پاورقی</h1><p>برای خرید یا بازکردن کتابخانه‌ات، با ایمیل خودت وارد شو. کد ورود را برایت می‌فرستیم.</p><form class="store-form" method="post" action="/account/login"><input type="hidden" name="next" value="${escape(safeNext(next))}"><label for="email">ایمیل</label><input id="email" name="email" type="email" dir="ltr" autocomplete="email" maxlength="254" required><small>برای دسترسی دوباره به خریدها، همیشه از همین ایمیل استفاده کن.</small><button class="store-button" type="submit">دریافت کد ورود</button></form>`;
  const codeForm = (next, message = "کد شش‌رقمی ارسال‌شده به ایمیلت را وارد کن.") => `<h1>کد ورود را وارد کن</h1><p role="status">${escape(message)}</p><form class="store-form" method="post" action="/account/code"><input type="hidden" name="next" value="${escape(safeNext(next))}"><label for="code">کد شش‌رقمی</label><input id="code" name="code" inputmode="numeric" dir="ltr" autocomplete="one-time-code" maxlength="6" required><button class="store-button" type="submit">ورود و ادامه</button></form><p><a href="/account/login?next=${encodeURIComponent(safeNext(next))}">ارسال کد تازه یا تغییر ایمیل ←</a></p>`;
  const unavailable = () => html("خرید موقتاً در دسترس نیست", '<h1>خرید موقتاً در دسترس نیست</h1><p>می‌توانی نمونه‌های رایگان را بخوانی و کمی بعد دوباره برای خرید برگردی.</p><a href="/">بازگشت به کتاب‌ها ←</a>', 503);

  async function serve(request, url, user) {
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return html("آدرس نادرست", "<h1>آدرس نادرست است</h1>", 400); }
    if (pathname.includes("\\") || pathname.includes("\0") || pathname.split("/").includes("..")) return new Response("Forbidden", {status: 403});
    const relative = pathname.slice(1) + (pathname.endsWith("/") ? "index.html" : "");
    const full = resolve(publicRoot, relative), privateFile = resolve(privateRoot, relative);
    if (!full.startsWith(publicRoot + sep) || !privateFile.startsWith(privateRoot + sep)) return new Response("Forbidden", {status: 403});
    const book = catalog.books.find(book => pathname.startsWith(`/${book.path}`));
    const product = book && products.find(product => product.id === book.id);
    const owned = user && store.owned(user.id);
    async function fileResponse(file, privateContent = false) {
      const body = await readFile(file);
      const isHtml = extname(file) === ".html";
      return new Response(privateContent && isHtml ? decorateReader(body.toString()) : body, {headers: {"Content-Type": mime[extname(file)] || "application/octet-stream", ...(privateContent ? {"X-Robots-Tag": "noindex, nofollow"} : {})}});
    }
    if (product && owned?.has(book.id)) {
      try { if ((await stat(privateFile)).isFile()) return await fileResponse(privateFile, true); } catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    try {
      const info = await stat(full);
      if (info.isDirectory()) return redirect(`${url.pathname}/${url.search}`);
      if (info.isFile()) return await fileResponse(full);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    if (product) {
      try {
        if ((await stat(privateFile)).isDirectory()) return redirect(`${url.pathname}/${url.search}`);
        await stat(privateFile);
        return redirect(`/${book.path}`);
      } catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    return html("صفحه پیدا نشد", '<h1>این صفحه پیدا نشد</h1><a href="/">بازگشت به کتاب‌ها ←</a>', 404);
  }

  async function route(request, {ip = "local"} = {}) {
    const url = new URL(request.url), path = url.pathname;
    const sessionToken = cookieValue(request, "pv_session"), user = store.session(sessionToken);
    if (request.method === "POST" && request.headers.get("origin") !== origin) return new Response("Forbidden", {status: 403});
    if (!["GET", "POST", "HEAD"].includes(request.method)) return new Response("Method not allowed", {status: 405, headers: {Allow: "GET, HEAD, POST"}});
    if (path === "/healthz") return new Response("ok", {headers: {"Content-Type": "text/plain"}});
    if (path === "/account/login") {
      const next = safeNext(url.searchParams.get("next"));
      if (request.method !== "POST") return user ? redirect(next) : html("ورود به پاورقی", loginForm(next));
      if (!mailer) return unavailable();
      const form = await request.formData();
      const email = String(form.get("email") || "").trim().toLowerCase();
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return html("ایمیل را بررسی کن", loginForm(safeNext(form.get("next"))) + '<p role="alert">یک ایمیل معتبر وارد کن.</p>', 400);
      if (!store.rate(`email:${email}`, 3, 15 * 60000) || !store.rate(`login-ip:${ip}`, 12, 15 * 60000)) return html("کمی صبر کن", '<h1>کمی صبر کن</h1><p>چند بار کد درخواست شده است. پانزده دقیقهٔ دیگر دوباره تلاش کن.</p>', 429);
      const challenge = store.challenge(email);
      try { await mailer({email, code: challenge.code}); } catch { return html("ارسال ایمیل انجام نشد", loginForm(safeNext(form.get("next"))) + '<p role="alert">ایمیل ارسال نشد. کمی بعد دوباره تلاش کن.</p>', 503); }
      const response = redirect(`/account/code?next=${encodeURIComponent(safeNext(form.get("next")))}`);
      response.headers.append("Set-Cookie", cookie("pv_challenge", challenge.id, 600));
      return response;
    }
    if (path === "/account/code") {
      const next = safeNext(url.searchParams.get("next"));
      if (request.method !== "POST") return html("کد ورود", codeForm(next));
      const form = await request.formData(), challenge = cookieValue(request, "pv_challenge"), code = digits(form.get("code") || "").trim();
      if (!store.rate(`verify-ip:${ip}`, 30, 15 * 60000)) return html("کمی صبر کن", "<h1>کمی بعد دوباره تلاش کن</h1>", 429);
      const result = /^\d{6}$/.test(code) ? store.authenticate(challenge, code) : null;
      if (!result) return html("کد ورود را بررسی کن", codeForm(form.get("next"), "کد نادرست یا منقضی شده است. دوباره وارد کن یا کد تازه بگیر."), 401);
      const response = redirect(safeNext(form.get("next")));
      response.headers.append("Set-Cookie", cookie("pv_session", result.session, 30 * 86400));
      response.headers.append("Set-Cookie", cookie("pv_challenge", "", 0));
      return response;
    }
    if (path === "/account/logout" && request.method === "POST") {
      store.logout(sessionToken);
      const response = redirect("/");
      response.headers.append("Set-Cookie", cookie("pv_session", "", 0));
      return response;
    }
    if (path === "/account/library") {
      if (!user) return login(path);
      const owned = store.owned(user.id), myBooks = catalog.books.filter(book => owned.has(book.id));
      const statusLabel = {paid: "پرداخت موفق", pending: "در انتظار تأیید", created: "آغاز خرید", failed: "پرداخت ناموفق", cancelled: "پرداخت لغوشده", request_failed: "درخواست پرداخت انجام نشد"};
      const orders = store.orders(user.id);
      return html("کتابخانهٔ من", `<h1>کتابخانهٔ من</h1><p>با ایمیل <bdi>${escape(user.email)}</bdi> وارد شده‌ای.</p>${myBooks.length ? `<ul class="store-purchases">${myBooks.map(book => `<li><h2>${escape(book.title)}</h2><a href="/${book.path}">خواندن راهنمای کامل ←</a></li>`).join("")}</ul>` : '<p class="store-notice">هنوز خریدی در کتابخانه‌ات نیست. نمونهٔ آثار را رایگان بخوان و بعد انتخاب کن.</p><a href="/">دیدن کتاب‌ها ←</a>'}<p><a href="/homer/">ایلیاد و ادیسه، کامل و رایگان ←</a></p>${orders.length ? `<h2>خریدهای من</h2><ul class="store-purchases">${orders.map(order => `<li>${escape(order.title)} · ${money(order.amount_rial / 10)}<p>${statusLabel[order.status] || "در حال بررسی"}</p><a href="/account/orders/${order.id}">رسید و وضعیت خرید ←</a></li>`).join("")}</ul>` : ""}<form method="post" action="/account/logout"><button class="store-link-button">خروج از حساب</button></form>`);
    }
    if (path.startsWith("/checkout/")) {
      const product = products.find(product => product.id === path.slice("/checkout/".length));
      if (!product) return html("محصول پیدا نشد", "<h1>این محصول پیدا نشد</h1>", 404);
      if (!gateway || !mailer) return unavailable();
      if (!user) return login(path);
      const owned = store.owned(user.id);
      if (product.bookIds.every(id => owned.has(id))) return redirect("/account/library");
      if (request.method !== "POST") return html("خرید راهنما", `<h1>${escape(product.title)}</h1><p>دسترسی کامل به ${product.bookIds.map(id => escape(bookById(id).title)).join("، ")}</p><p>خرید با ایمیل <bdi>${escape(user.email)}</bdi> در کتابخانه‌ات ذخیره می‌شود.</p>${product.bookIds.some(id => owned.has(id)) ? '<p class="store-notice">بخشی از این مجموعه را قبلاً خریده‌ای. می‌توانی راهنماهای باقی‌مانده را جداگانه از صفحهٔ کتاب‌ها انتخاب کنی.</p>' : ""}<p class="store-total">${money(product.priceToman)}</p><p>خرید یک‌باره است و تمدید خودکار ندارد.</p>${gateway && mailer ? `<form method="post"><button class="store-button" type="submit">پرداخت با زرین‌پال</button></form>` : '<p class="store-notice">خرید موقتاً در دسترس نیست. می‌توانی فعلاً نمونه‌های رایگان را بخوانی.</p>'}<p><a href="/">بازگشت به کتاب‌ها ←</a></p>`);
      if (!gateway || !mailer) return unavailable();
      if (!store.rate(`checkout:${user.id}`, 8, 10 * 60000)) return html("کمی صبر کن", "<h1>کمی بعد دوباره تلاش کن</h1>", 429);
      const order = store.createOrder(user.id, product);
      try {
        const payment = await gateway.request({amountRial: order.amount_rial, description: `پاورقی: ${product.title}`, callbackUrl: new URL("/payments/zarinpal/callback", origin).href, orderId: order.id});
        store.pending(order.id, payment.authority);
        return redirect(payment.url);
      } catch {
        store.status(order.id, "request_failed");
        return html("اتصال به درگاه انجام نشد", `<h1>اتصال به درگاه انجام نشد</h1><p>درخواست خرید ثبت شد، اما انتقال به درگاه انجام نشد. دوباره تلاش کن.</p><a href="/checkout/${product.id}">تلاش دوباره ←</a>`, 502);
      }
    }
    if (path === "/payments/zarinpal/callback") {
      const authority = url.searchParams.get("Authority");
      const order = authority && url.searchParams.getAll("Authority").length === 1 && store.authority(authority);
      if (!order) return html("خرید پیدا نشد", '<h1>این خرید پیدا نشد</h1><a href="/account/library">خریدهای من ←</a>', 404);
      if (order.status !== "paid") {
        if (url.searchParams.get("Status") !== "OK") store.status(order.id, "cancelled");
        else {
          if (!gateway) return unavailable();
          try {
            const verified = await gateway.verify({authority: order.authority, amountRial: order.amount_rial});
            if (verified.paid) store.paid(order.id, verified.reference);
            else store.status(order.id, "failed");
          } catch {
            return html("تأیید پرداخت کامل نشد", `<h1>تأیید پرداخت کامل نشد</h1><p>اگر مبلغ از حسابت کسر شده، دوباره پرداخت نکن. برای بررسی همین پرداخت روی دکمهٔ زیر بزن.</p><a class="store-button" href="${escape(url.pathname + url.search)}">بررسی دوبارهٔ پرداخت</a>`, 502);
          }
        }
      }
      return redirect(`/account/orders/${order.id}`);
    }
    if (path.startsWith("/account/orders/")) {
      if (!user) return login(path);
      const order = store.order(path.slice("/account/orders/".length));
      if (!order || order.user_id !== user.id) return html("خرید پیدا نشد", "<h1>این خرید پیدا نشد</h1>", 404);
      const paid = order.status === "paid";
      return html(paid ? "خرید موفق بود" : "وضعیت خرید", `<h1>${paid ? "خرید موفق بود؛ راهنما آمادهٔ خواندن است" : "خرید هنوز تکمیل نشده"}</h1><p>${escape(order.title)} · ${money(order.amount_rial / 10)}</p>${paid ? `<p>شمارهٔ پیگیری: <bdi>${escape(order.reference)}</bdi></p><a class="store-button" href="/account/library">رفتن به کتابخانهٔ من ←</a>` : `<p>دسترسی پس از تأیید پرداخت باز می‌شود.</p>${order.authority && !["cancelled", "request_failed"].includes(order.status) ? `<a class="store-button" href="/payments/zarinpal/callback?Authority=${encodeURIComponent(order.authority)}&amp;Status=OK">بررسی دوبارهٔ همین پرداخت</a>` : `<a class="store-button" href="/checkout/${escape(order.product_id)}">تلاش دوباره برای خرید</a>`}`}`);
    }
    if (request.method === "POST") return new Response("Not found", {status: 404});
    return serve(request, url, user);
  }

  return async (request, options) => {
    let response;
    try { response = await route(request, options); }
    catch { response = html("مشکلی پیش آمد", '<h1>مشکلی پیش آمد</h1><p>کمی بعد دوباره تلاش کن.</p><a href="/account/library">کتابخانهٔ من ←</a>', 500); }
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://payment.zarinpal.com https://sandbox.zarinpal.com");
    if (secure) response.headers.set("Strict-Transport-Security", "max-age=31536000");
    return response;
  };
}
