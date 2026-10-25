// Unit tests สำหรับ Retry / Timeout / Fallback ใน src/services/external-api.js
// mock axios.get เพื่อจำลองสถานการณ์โดยไม่ต้องใช้อินเทอร์เน็ตจริง
const { test } = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const { getNutritionInfo } = require("../src/services/external-api");

test("Happy path: API ตอบสำเร็จในครั้งแรก", async (t) => {
  const get = t.mock.method(axios, "get", async () => ({
    data: { recipes: [{ caloriesPerServing: 500 }] },
  }));
  const r = await getNutritionInfo("Pad Thai");
  assert.equal(r.source, "external_api");
  assert.equal(r.calories, 500);
  assert.equal(r.status, "success");
  assert.equal(get.mock.callCount(), 1);
});

test("Timeout ถูกส่งไปที่ axios เป็น 3000 ms", async (t) => {
  const get = t.mock.method(axios, "get", async () => ({ data: { recipes: [] } }));
  await getNutritionInfo("x");
  assert.equal(get.mock.calls[0].arguments[1].timeout, 3000);
});

test("API ตอบสำเร็จแต่ไม่มีข้อมูล → ค่า default 250 kcal", async (t) => {
  t.mock.method(axios, "get", async () => ({ data: { recipes: [] } }));
  const r = await getNutritionInfo("unknown");
  assert.equal(r.calories, 250);
  assert.equal(r.status, "success_no_data");
});

test("Retry: ล้มเหลวครั้งแรก สำเร็จครั้งที่ 2 (เรียก 2 ครั้ง)", async (t) => {
  let n = 0;
  const get = t.mock.method(axios, "get", async () => {
    n++;
    if (n === 1) throw new Error("ECONNRESET");
    return { data: { recipes: [{ caloriesPerServing: 300 }] } };
  });
  const r = await getNutritionInfo("Tom Yum");
  assert.equal(r.status, "success");
  assert.equal(get.mock.callCount(), 2);
});

test("Fallback: ล้มเหลวครบ 3 ครั้ง → คืนข้อมูลสำรองไม่ throw", async (t) => {
  const get = t.mock.method(axios, "get", async () => {
    const e = new Error("timeout of 3000ms exceeded");
    e.code = "ECONNABORTED";
    throw e;
  });
  const r = await getNutritionInfo("Green Curry");
  assert.equal(get.mock.callCount(), 3); // 1 ครั้งแรก + retry 2 ครั้ง
  assert.equal(r.source, "fallback");
  assert.equal(r.calories, "N/A");
  assert.equal(r.status, "fallback");
});
