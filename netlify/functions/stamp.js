const { getStore } = require("@netlify/blobs");

const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function membersStore() {
  return getStore({
    name: "members",
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "invalid json" }) };
  }

  const id = (body.id || "").trim().toUpperCase();
  const goal = Math.max(3, Math.min(20, Number(body.goal) || 10));
  if (!id) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "missing id" }) };
  }

  const store = membersStore();
  const member = await store.get(id, { type: "json" });
  if (!member) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: "not found" }) };
  }

  member.points = Math.min((member.points || 0) + 1, goal);
  await store.setJSON(id, member);

  return { statusCode: 200, headers, body: JSON.stringify({ member }) };
};
