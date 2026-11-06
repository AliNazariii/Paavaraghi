export function createZarinpal({merchantId, sandbox = true, fetchImpl = fetch}) {
  const base = sandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
  async function call(method, payload) {
    const response = await fetchImpl(`${base}/pg/v4/payment/${method}.json`, {
      method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json"},
      body: JSON.stringify({merchant_id: merchantId, ...payload}), signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error("Payment gateway unavailable");
    const result = await response.json();
    return result.data || {};
  }
  return {
    async request({amountRial, description, callbackUrl, orderId}) {
      const data = await call("request", {amount: amountRial, currency: "IRR", description, callback_url: callbackUrl, metadata: {order_id: orderId}});
      if (data.code !== 100 || !/^[AS][a-zA-Z0-9-]{15,127}$/.test(data.authority || "")) throw new Error("Payment request rejected");
      return {authority: data.authority, url: `${base}/pg/StartPay/${encodeURIComponent(data.authority)}`};
    },
    async verify({authority, amountRial}) {
      const data = await call("verify", {authority, amount: amountRial});
      const reference = String(data.ref_id ?? "");
      return {paid: [100, 101].includes(data.code) && /^[1-9]\d*$/.test(reference), reference, code: data.code};
    }
  };
}

