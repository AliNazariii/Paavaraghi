import {DatabaseSync} from "node:sqlite";
import {randomBytes, randomUUID, createHash, createHmac, randomInt, timingSafeEqual} from "node:crypto";

const hash = value => createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(32).toString("base64url");

export function createStore(filename, secret, now = Date.now, scope = "live") {
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL);
    CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY, email TEXT NOT NULL, digest TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions(digest TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), product_id TEXT NOT NULL, title TEXT NOT NULL, book_ids TEXT NOT NULL, amount_rial INTEGER NOT NULL CHECK(amount_rial > 0), status TEXT NOT NULL, authority TEXT UNIQUE, reference TEXT UNIQUE, created INTEGER NOT NULL, scope TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id, scope, status);`);
  const digestCode = (id, code) => createHmac("sha256", secret).update(`${id}:${code}`).digest("hex");
  return {
    db, close: () => db.close(),
    rate(key, max, periodMs) {
      const safeKey = hash(key), time = now();
      db.prepare("DELETE FROM limits WHERE expires < ?").run(time);
      db.prepare("INSERT INTO limits VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=count+1").run(safeKey, time + periodMs);
      return db.prepare("SELECT count FROM limits WHERE key=?").get(safeKey).count <= max;
    },
    challenge(email) {
      const id = token(), code = String(randomInt(1000000)).padStart(6, "0");
      db.prepare("DELETE FROM challenges WHERE email=? OR expires < ?").run(email, now());
      db.prepare("INSERT INTO challenges(id,email,digest,expires) VALUES (?,?,?,?)").run(id, email, digestCode(id, code), now() + 10 * 60000);
      return {id, code};
    },
    authenticate(id, code) {
      const row = db.prepare("SELECT * FROM challenges WHERE id=?").get(id);
      if (!row || row.expires < now() || row.attempts >= 5) return null;
      db.prepare("UPDATE challenges SET attempts=attempts+1 WHERE id=?").run(id);
      if (!timingSafeEqual(Buffer.from(row.digest), Buffer.from(digestCode(id, code)))) return null;
      if (!db.prepare("DELETE FROM challenges WHERE id=?").run(id).changes) return null;
      db.prepare("INSERT OR IGNORE INTO users VALUES (?,?)").run(randomUUID(), row.email);
      const user = db.prepare("SELECT * FROM users WHERE email=?").get(row.email);
      const session = token();
      db.prepare("DELETE FROM sessions WHERE expires < ?").run(now());
      db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(hash(session), user.id, now() + 30 * 86400000);
      return {user, session};
    },
    session(value) {
      if (!value || value.length > 100) return null;
      return db.prepare("SELECT users.* FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.digest=? AND sessions.expires>?").get(hash(value), now()) || null;
    },
    logout(value) { if (value) db.prepare("DELETE FROM sessions WHERE digest=?").run(hash(value)); },
    owned(userId) {
      return new Set(db.prepare("SELECT book_ids FROM orders WHERE user_id=? AND status='paid' AND scope=?").all(userId, scope).flatMap(row => JSON.parse(row.book_ids)));
    },
    orders(userId) { return db.prepare("SELECT * FROM orders WHERE user_id=? AND scope=? ORDER BY created DESC").all(userId, scope); },
    order(id) { return db.prepare("SELECT * FROM orders WHERE id=? AND scope=?").get(id, scope); },
    authority(value) { return db.prepare("SELECT * FROM orders WHERE authority=? AND scope=?").get(value, scope); },
    createOrder(userId, product) {
      const id = randomUUID();
      db.prepare("INSERT INTO orders(id,user_id,product_id,title,book_ids,amount_rial,status,created,scope) VALUES (?,?,?,?,?,?,'created',?,?)").run(id, userId, product.id, product.title, JSON.stringify(product.bookIds), product.priceToman * 10, now(), scope);
      return this.order(id);
    },
    pending(id, authority) { db.prepare("UPDATE orders SET authority=?, status='pending' WHERE id=? AND status='created' AND scope=?").run(authority, id, scope); },
    status(id, status) { db.prepare("UPDATE orders SET status=? WHERE id=? AND status!='paid' AND scope=?").run(status, id, scope); },
    paid(id, reference) { db.prepare("UPDATE orders SET status='paid',reference=? WHERE id=? AND status!='paid' AND scope=?").run(reference, id, scope); }
  };
}

