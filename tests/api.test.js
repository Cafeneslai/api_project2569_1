// Integration tests สำหรับ REST API ทั้งหมด (ใช้ node:test ในตัว Node.js ไม่ต้องติดตั้งแพ็กเกจเพิ่ม)
// ต้องมี MySQL ที่โหลด schema.sql + seed.sql แล้ว และตั้งค่า .env ให้เชื่อมต่อได้
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const app = require("../src/index");
const pool = require("../src/db");

let server;
let BASE;
let createdRecipeId;
let createdReviewId;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  BASE = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  // ล้างข้อมูลทดสอบที่อาจค้าง
  if (createdRecipeId) {
    await pool.query("DELETE FROM recipes WHERE id = ?", [createdRecipeId]);
  }
  await new Promise((r) => server.close(r));
  await pool.end();
});

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: res.status, body: json, text };
}

// ---------- Infrastructure ----------
test("GET /api-docs/ ให้บริการ Swagger UI", async () => {
  const r = await call("GET", "/api-docs/");
  assert.equal(r.status, 200);
  assert.match(r.text, /swagger/i);
});

test("GET / ให้บริการหน้า Frontend", async () => {
  const r = await call("GET", "/");
  assert.equal(r.status, 200);
  assert.match(r.text, /Recipe Hub/);
});

test("OPTIONS preflight ตอบ 200 พร้อม CORS header", async () => {
  const res = await fetch(BASE + "/api/v1/recipes", { method: "OPTIONS" });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

// ---------- Swagger/Code Match ----------
test("ทุก endpoint ใน openapi.yaml มีอยู่ในโค้ดจริง และโค้ดไม่มี endpoint ที่ไม่ได้ทำเอกสาร", () => {
  const path = require("node:path");
  const YAML = require("yamljs");
  const spec = YAML.load(path.join(__dirname, "..", "openapi.yaml"));
  const prefix = new URL(spec.servers[0].url).pathname; // /api/v1

  const fromSpec = new Set();
  for (const [p, ops] of Object.entries(spec.paths)) {
    for (const m of Object.keys(ops)) {
      fromSpec.add(`${m.toUpperCase()} ${prefix}${p.replace(/\{(\w+)\}/g, ":$1")}`);
    }
  }

  const fromCode = new Set();
  for (const layer of app._router.stack) {
    if (layer.route && layer.route.path.startsWith("/api/")) {
      for (const m of Object.keys(layer.route.methods)) {
        fromCode.add(`${m.toUpperCase()} ${layer.route.path}`);
      }
    }
  }

  assert.deepEqual([...fromSpec].sort(), [...fromCode].sort());
});

// ---------- Categories ----------
test("GET /api/v1/categories คืนรายการหมวดหมู่", async () => {
  const r = await call("GET", "/api/v1/categories");
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.data));
  assert.ok(r.body.data.length > 0);
});

// ---------- Recipes CRUD ----------
test("GET /api/v1/recipes คืนรายการสูตรอาหาร", async () => {
  const r = await call("GET", "/api/v1/recipes");
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.data));
  assert.ok("category_id" in r.body.data[0]);
});

test("GET /api/v1/recipes?category_id=1&search=... กรองแบบหลายเงื่อนไข", async () => {
  const r = await call("GET", "/api/v1/recipes?category_id=1&search=" + encodeURIComponent("ผัด"));
  assert.equal(r.status, 200);
  for (const row of r.body.data) {
    assert.equal(row.category_id, 1);
    assert.match(row.recipe_name, /ผัด/);
  }
});

test("POST /api/v1/recipes ฟิลด์ไม่ครบ → 400", async () => {
  const r = await call("POST", "/api/v1/recipes", { name: "ไม่ครบ" });
  assert.equal(r.status, 400);
});

test("POST /api/v1/recipes ข้อมูลถูกต้อง → 201", async () => {
  const r = await call("POST", "/api/v1/recipes", {
    category_id: 1,
    name: "TEST สูตรทดสอบ",
    ingredients: "น้ำ 1 แก้ว",
    cook_time_minutes: 5,
  });
  assert.equal(r.status, 201);
  assert.ok(r.body.data.id);
  createdRecipeId = r.body.data.id;
});

test("GET /api/v1/recipes/:id พบข้อมูล → 200", async () => {
  const r = await call("GET", `/api/v1/recipes/${createdRecipeId}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.data.recipe_name, "TEST สูตรทดสอบ");
  assert.equal(r.body.data.category_id, 1);
});

test("GET /api/v1/recipes/:id ไม่พบ → 404", async () => {
  const r = await call("GET", "/api/v1/recipes/999999");
  assert.equal(r.status, 404);
});

test("PUT /api/v1/recipes/:id ข้อมูลถูกต้อง → 200", async () => {
  const r = await call("PUT", `/api/v1/recipes/${createdRecipeId}`, {
    category_id: 1,
    name: "TEST สูตรทดสอบ (แก้ไข)",
    ingredients: "น้ำ 2 แก้ว",
    cook_time_minutes: 10,
  });
  assert.equal(r.status, 200);
  const check = await call("GET", `/api/v1/recipes/${createdRecipeId}`);
  assert.equal(check.body.data.cook_time_minutes, 10);
});

test("PUT /api/v1/recipes/:id ฟิลด์ไม่ครบ → 400", async () => {
  const r = await call("PUT", `/api/v1/recipes/${createdRecipeId}`, { name: "x" });
  assert.equal(r.status, 400);
});

test("PUT /api/v1/recipes/:id ไม่พบ → 404", async () => {
  const r = await call("PUT", "/api/v1/recipes/999999", {
    category_id: 1,
    name: "x",
    ingredients: "x",
    cook_time_minutes: 1,
  });
  assert.equal(r.status, 404);
});

// ---------- Reviews ----------
test("POST /api/v1/recipes/:id/reviews rating ไม่ถูกต้อง → 400", async () => {
  const r = await call("POST", `/api/v1/recipes/${createdRecipeId}/reviews`, {
    reviewer_name: "tester",
    rating: 6,
  });
  assert.equal(r.status, 400);
});

test("POST /api/v1/recipes/:id/reviews สูตรไม่มีอยู่ → 404", async () => {
  const r = await call("POST", "/api/v1/recipes/999999/reviews", {
    reviewer_name: "tester",
    rating: 4,
  });
  assert.equal(r.status, 404);
});

test("POST /api/v1/recipes/:id/reviews ข้อมูลถูกต้อง → 201", async () => {
  const r = await call("POST", `/api/v1/recipes/${createdRecipeId}/reviews`, {
    reviewer_name: "tester",
    rating: 5,
    comment: "อร่อย",
  });
  assert.equal(r.status, 201);
  createdReviewId = r.body.data.id;
});

test("GET /api/v1/recipes/:id/reviews คืนรีวิวที่เพิ่งสร้าง", async () => {
  const r = await call("GET", `/api/v1/recipes/${createdRecipeId}/reviews`);
  assert.equal(r.status, 200);
  assert.ok(r.body.data.some((rv) => rv.id === createdReviewId));
});

test("DELETE /api/v1/reviews/:id → 200 และลบซ้ำ → 404", async () => {
  const r1 = await call("DELETE", `/api/v1/reviews/${createdReviewId}`);
  assert.equal(r1.status, 200);
  const r2 = await call("DELETE", `/api/v1/reviews/${createdReviewId}`);
  assert.equal(r2.status, 404);
});

// ---------- Nutrition (External API ถูก mock เพื่อไม่พึ่งอินเทอร์เน็ต) ----------
test("GET /api/v1/recipes/:id/nutrition → 200 พร้อมข้อมูลโภชนาการ", async (t) => {
  t.mock.method(axios, "get", async () => ({
    data: { recipes: [{ caloriesPerServing: 420 }] },
  }));
  const r = await call("GET", `/api/v1/recipes/${createdRecipeId}/nutrition`);
  assert.equal(r.status, 200);
  assert.equal(r.body.nutrition.calories, 420);
});

test("GET /api/v1/recipes/:id/nutrition ไม่พบสูตร → 404", async () => {
  const r = await call("GET", "/api/v1/recipes/999999/nutrition");
  assert.equal(r.status, 404);
});

// ---------- Delete recipe (ท้ายสุด) ----------
test("DELETE /api/v1/recipes/:id → 200 และลบซ้ำ → 404", async () => {
  const r1 = await call("DELETE", `/api/v1/recipes/${createdRecipeId}`);
  assert.equal(r1.status, 200);
  const r2 = await call("DELETE", `/api/v1/recipes/${createdRecipeId}`);
  assert.equal(r2.status, 404);
  createdRecipeId = null;
});
