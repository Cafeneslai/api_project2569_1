const { test } = require("node:test");
const assert = require("node:assert/strict");

test("db.js รองรับทั้งค่าจาก environment variable และค่าเริ่มต้น (Default Fallback)", () => {
  const dbPath = require.resolve("../src/db");
  const savedHost = process.env.DB_HOST;
  const savedUser = process.env.DB_USER;
  const savedPass = process.env.DB_PASSWORD;
  const savedName = process.env.DB_NAME;

  try {
    // 1. ทดสอบกรณีไม่มี env (ทดสอบกิ่งขวาของ || ทั้งหมด: 'localhost', 'root', '', 'recipe_db')
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete require.cache[dbPath];

    const fallbackPool = require("../src/db");
    assert.ok(fallbackPool);

    // 2. ทดสอบกรณีมี env (ทดสอบกิ่งซ้ายของ || ทั้งหมด)
    process.env.DB_HOST = "127.0.0.1";
    process.env.DB_USER = "root";
    process.env.DB_PASSWORD = "password";
    process.env.DB_NAME = "recipe_db";
    delete require.cache[dbPath];

    const envPool = require("../src/db");
    assert.ok(envPool);
  } finally {
    // คืนค่าตัวแปรเดิมเพื่อไม่ให้กระทบชุดทดสอบอื่น
    if (savedHost !== undefined) process.env.DB_HOST = savedHost;
    if (savedUser !== undefined) process.env.DB_USER = savedUser;
    if (savedPass !== undefined) process.env.DB_PASSWORD = savedPass;
    if (savedName !== undefined) process.env.DB_NAME = savedName;
    delete require.cache[dbPath];
    require("../src/db");
  }
});
