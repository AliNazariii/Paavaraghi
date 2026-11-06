export function createMailer(env, fetchImpl = fetch) {
  const from = env.MAIL_FROM;
  if (!from) return null;
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
    let transport;
    return async ({email, code}) => {
      const nodemailer = await import("nodemailer");
      transport ||= nodemailer.default.createTransport({host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 465), secure: (env.SMTP_PORT || "465") === "465", requireTLS: (env.SMTP_PORT || "465") !== "465", auth: {user: env.SMTP_USER, pass: env.SMTP_PASSWORD}, connectionTimeout: 15000, socketTimeout: 20000});
      await transport.sendMail({from, to: email, subject: "کد ورود به پاورقی", text: `کد ورود تو به پاورقی: ${code}\nاین کد تا ده دقیقه معتبر است.\nاگر درخواست ورود نداده‌ای، این ایمیل را نادیده بگیر.`});
    };
  }
  if (!env.RESEND_API_KEY) return null;
  return async ({email, code}) => {
    const response = await fetchImpl("https://api.resend.com/emails", {method: "POST", headers: {Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json"}, body: JSON.stringify({from, to: [email], subject: "کد ورود به پاورقی", text: `کد ورود تو به پاورقی: ${code}\nاین کد تا ده دقیقه معتبر است.\nاگر درخواست ورود نداده‌ای، این ایمیل را نادیده بگیر.`}), signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error("Could not deliver login code");
  };
}

