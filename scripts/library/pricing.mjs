import {mkdir, writeFile, cp} from "node:fs/promises";
import {join} from "node:path";
import {books} from "./books.mjs";
import {products} from "../../server/catalog.mjs";
import {page, escape, money} from "../../server/html.mjs";

const titleOf = product => product.title || books.find(book => book.id === product.id).title;
const purchase = (product, enabled) => enabled ? `<a class="store-button" href="/checkout/${product.id}">خرید با زرین‌پال · ${money(product.priceToman)}</a>` : '<p class="store-notice" role="status">فروش آنلاین پس از فعال‌شدن درگاه پرداخت آغاز می‌شود. در حال حاضر پرداختی دریافت نمی‌کنیم.</p>';

export async function buildPricing(siteUrl, outDir, {salesEnabled = false} = {}) {
  const urls = [];
  await cp(new URL("../../server/store.css", import.meta.url), join(outDir, "store.css"));
  async function save(path, title, description, content) {
    const canonical = new URL(path, siteUrl).href;
    await mkdir(join(outDir, path), {recursive: true});
    await writeFile(join(outDir, path, "index.html"), page(title, content, {description, canonical, noindex: false, accountLink: salesEnabled}));
    urls.push(canonical);
  }
  const productCards = products.map(product => `<li><h2><a href="/products/${product.id}/">${escape(titleOf(product))}</a></h2><p class="store-total">${money(product.priceToman)}</p><p>${product.bookIds.length === 1 ? "خرید یک‌بارهٔ راهنمای کامل این اثر" : "خرید یک‌بارهٔ هر سه راهنما با هم"}</p><a href="/products/${product.id}/">محتوای محصول و ${product.samplePath ? "نمونهٔ رایگان" : "جزئیات مجموعه"} ←</a></li>`).join("");
  await save("pricing/", "قیمت راهنماهای پاورقی", "قیمت مشخص راهنماهای پاورقی: ایلیاد و ادیسه رایگان، هر راهنمای دیگر ۱۹۹ هزار تومان و مجموعهٔ سه‌تایی ۴۴۹ هزار تومان؛ خرید یک‌باره.", `<span class="store-eyebrow">راهنماها و هزینهٔ دسترسی</span><h1>قیمت راهنماهای پاورقی</h1><p class="store-lead">پیش از انتخاب، نمونهٔ هر راهنما را رایگان بخوان. قیمت‌های زیر به تومان و برای خرید یک‌باره‌اند؛ تمدید خودکار ندارند.</p><section class="store-included"><h2>ایلیاد و ادیسه · رایگان</h2><p>راهنمای هر ۴۸ سرود، پیش‌داستان‌ها، شخصیت‌ها و نقشه‌ها کامل و رایگان در دسترس است.</p><a href="/homer/">خواندن راهنمای کامل رایگان ←</a></section><ul class="store-purchases">${productCards}</ul>${salesEnabled ? "" : '<p class="store-notice">درگاه پرداخت در حال راه‌اندازی است. تا آغاز فروش، راهنماهای فعلی همچنان قابل مطالعه‌اند.</p>'}`);
  for (const product of products) {
    const relatedBooks = product.bookIds.map(id => books.find(book => book.id === id));
    const title = titleOf(product);
    const previews = relatedBooks.map(book => {
      const item = products.find(item => item.id === book.id);
      return `<li><h2>${escape(book.title)}</h2><p>${escape(book.description)}</p><p>${escape(book.meta)}</p><a href="/${book.path}${item.samplePath}">نمونهٔ رایگان: ${escape(item.sampleLabel)} ←</a></li>`;
    }).join("");
    await save(`products/${product.id}/`, `${title}؛ قیمت و نمونهٔ راهنما`, `راهنمای ${title} در پاورقی؛ ${money(product.priceToman)}، خرید یک‌باره، همراه با نمونهٔ رایگان و توضیح محتوای محصول.`, `<span class="store-eyebrow">راهنمای تألیفی پاورقی</span><h1>${escape(title)}</h1><p class="store-total">${money(product.priceToman)}</p><p>خرید یک‌بارهٔ ${product.bookIds.length === 1 ? "دسترسی کامل به راهنمای این اثر" : "دسترسی کامل به هر سه راهنما"}، بدون تمدید خودکار.</p><section class="store-included"><h2>محتوای این محصول</h2><p>یادداشت‌های پیش از خواندن، مرور داستان و توضیح آن، معرفی شخصیت‌ها، نکته‌ها و پرسش‌های خواندن و منابع راهنما.</p><p>محصول، نوشته‌های تألیفی پاورقی برای آشنایی و همراهی با خواندن این ${product.bookIds.length === 1 ? "اثر" : "آثار"} است؛ نسخهٔ متن اصلی کتاب در این خرید ارائه نمی‌شود.</p></section><h2>پیش از خرید، نمونه را بخوان</h2><ul class="store-purchases">${previews}</ul>${purchase(product, salesEnabled)}<p><a href="/pricing/">دیدن قیمت همهٔ راهنماها ←</a></p>`);
  }
  return urls;
}
