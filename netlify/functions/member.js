const { getStore } = require("@netlify/blobs");

function genId() {
  return (
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const store = getStore("members");

  if (event.httpMethod === "GET") {
    const id = ((event.queryStringParameters && event.queryStringParameters.id) || "")
      .trim()
      .toUpperCase();
    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "missing id" }) };
    }
    const member = await store.get(id, { type: "json" });
    return { statusCode: 200, headers, body: JSON.stringify({ member: member || null }) };
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "invalid json" }) };
    }
    const name = (body.name || "").trim().slice(0, 40);
    if (!name) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "missing name" }) };
    }
    const id = genId();
    const member = { id, name, points: 0, joined: new Date().toISOString() };
    await store.setJSON(id, member);
    return { statusCode: 200, headers, body: JSON.stringify({ member }) };
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
