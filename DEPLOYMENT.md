# Paavaraghi storefront

The public GitHub Pages build (`npm run build`, output `docs/`) includes prices and samples, with a clear notice that online sales have not started. The Docker build is a separate edition with server-side access control. It serves only `dist/public/` anonymously; paid HTML lives in `dist/private/`. Existing copies in the old public site or Git history are not withdrawn by this deployment.

## Run and verify

Node.js 24 or newer is required for the store. Install locked dependencies with `npm ci`. Run `npm run test:store` to build and test the package, login, payment verification, content access and recovery. The tests use injected mail and gateway adapters; they do not send email or make real payments.

Copy `.env.example` to `.env`. Generate a random `SESSION_SECRET` and keep it stable across restarts. Fill in the approved Zarinpal merchant UUID and either your own SMTP settings or a Resend key. Never commit this file or put credentials in frontend code. The diagnostic command `npm run doctor:store` reports configured names only, not their values.

The default is `CHECKOUT_ENABLED=false` and `ZARINPAL_SANDBOX=true`. To test Zarinpal's sandbox, set a UUID merchant and enable checkout while keeping sandbox mode. Orders and access are namespaced by gateway mode: sandbox purchases never unlock live content, even in the same database. Set `ZARINPAL_SANDBOX=false` only after live merchant approval. Enable live checkout only with a verified sending address, tested email delivery, and the real domain connected to this server.

The SMTP adapter uses implicit TLS on port 465 or mandatory STARTTLS on other ports. Login codes expire after 10 minutes, allow five guesses, and are stored only as keyed hashes. An HTTP-only session lasts 30 days. A reader can recover purchases by signing in again with the same email, with no password-reset support work.

## Docker and shared Caddy

`compose.yaml` uses the existing external Docker network `edge`, exposes no host port, and gives the container the network alias `paavaraghi-web`. A named volume stores SQLite orders, sessions and purchases under `/data`. Run one replica with this volume. Keep `TRUST_PROXY=true` only while the app is reachable through the trusted Caddy proxy.

```sh
docker compose build
docker compose up -d
docker compose ps
docker compose exec -T web node server/doctor.mjs
```

Add this site to the shared Caddy configuration after confirming the hostname points at the server:

```caddyfile
paavaraghi.ir {
    encode zstd gzip
    reverse_proxy paavaraghi-web:3000
}
```

Validate the shared Caddy configuration before reloading it. Keep a backup of the previous site configuration. The DNS A record for `paavaraghi.ir` must point to the Docker host rather than GitHub Pages for the store to handle requests. Keep the old public site available until the replacement is healthy.

## Purchase verification and data

All displayed prices are in toman, defined in `server/catalog.mjs`. The server snapshots product, title, included book IDs and price when creating an order, then sends the rial amount (`toman * 10`, explicit `IRR`) to Zarinpal. Client-supplied prices are ignored. The callback looks up the saved authority and amount and grants access only after server-side verification returns code 100 or 101 with a reference ID. Repeated callbacks do not duplicate purchases. Timeouts keep the order available for rechecking the same payment.

Keep the data volume across upgrades and back it up separately from the source. Do not use `docker compose down -v` on a live installation. For a consistent backup, use SQLite's online backup API from the running container and copy the resulting file off the host. An old database is the source of truth for existing purchases even after product prices change.

Primary integration references: [Zarinpal connection and verification](https://www.zarinpal.com/docs/paymentGateway/connectToGateway), [sandbox](https://www.zarinpal.com/docs/paymentGateway/sandBox), [currency](https://www.zarinpal.com/docs/paymentGateway/moreFeatures/currency), [Nodemailer SMTP](https://nodemailer.com/smtp).
