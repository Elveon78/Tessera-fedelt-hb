const { getStore } = require("@netlify/blobs");

const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function shopStore() {
  return getStore({
    name: "shop",
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const store = shopStore();

  if (event.httpMethod === "GET") {
    const cfg = await store.get("config", { type: "json" });
    return { statusCode: 200, headers, body: JSON.stringify({ config: cfg || null }) };
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "invalid json" }) };
    }
    const cfg = {
      name: (body.name || "HB").trim().slice(0, 28) || "HB",
      goal: Math.max(3, Math.min(20, Number(body.goal) || 10)),
      reward: (body.reward || "Un premio a tua scelta").trim().slice(0, 60),
    };
    await store.setJSON("config", cfg);
    return { statusCode: 200, headers, body: JSON.stringify({ config: cfg }) };
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
