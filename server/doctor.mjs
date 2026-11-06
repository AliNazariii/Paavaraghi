const env = process.env;
const checks = {
  APP_URL: (() => { try { return new URL(env.APP_URL).protocol === "https:"; } catch { return false; } })(),
  SESSION_SECRET: Boolean(env.SESSION_SECRET?.length >= 32 && !env.SESSION_SECRET.startsWith("replace-")),
  ZARINPAL_MERCHANT_ID: /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(env.ZARINPAL_MERCHANT_ID || ""),
  MAIL_FROM: Boolean(env.MAIL_FROM),
  MAIL_DELIVERY: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD || env.RESEND_API_KEY),
  CHECKOUT_ENABLED: env.CHECKOUT_ENABLED === "true",
  LIVE_GATEWAY: env.ZARINPAL_SANDBOX === "false"
};
for (const [key, ready] of Object.entries(checks)) console.log(`${key}: ${ready ? "ready" : "not configured"}`);
if (Object.values(checks).some(ready => !ready)) process.exitCode = 1;

