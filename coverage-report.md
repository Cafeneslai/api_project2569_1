# รายงาน Test Coverage Baseline (โครงงานระยะที่ 3)

**รหัสนิสิต:** 67160193
**หัวข้อโครงงาน:** Pno 4 — ระบบข้อมูลสูตรอาหาร (Recipe Information System)

> ตัวเลขทั้งหมดในรายงานนี้มาจากการรันจริง ผลลัพธ์ดิบ (raw output) บันทึกไว้ในไฟล์ `coverage-output.txt` ในโฟลเดอร์เดียวกัน ผู้ตรวจรันซ้ำได้ด้วยคำสั่งด้านล่าง

---

## 1. เครื่องมือและวิธีรัน

| รายการ | รายละเอียด |
| :--- | :--- |
| Test runner | `node:test` ที่มากับ Node.js (v24) — **ไม่ต้องติดตั้งแพ็กเกจเพิ่ม** |
| Coverage | `--experimental-test-coverage` ของ Node.js (วัดจาก V8) |
| ไฟล์ทดสอบ | `tests/api.test.js` (22 tests), `tests/external-api.test.js` (5 tests) |
| ฐานข้อมูล | ทดสอบกับ MySQL จริง (โหลด `schema.sql` + `seed.sql` ก่อน) ข้อมูลที่ทดสอบสร้างขึ้นจะถูกลบทิ้งเมื่อจบ |
| External API | mock `axios.get` ด้วย `t.mock.method` เพื่อจำลอง สำเร็จ / ล้มเหลว / timeout โดยไม่ต้องใช้อินเทอร์เน็ต |

**คำสั่งรัน** (ต้องมีไฟล์ `.env` ตาม `.env.example` และ MySQL ทำงานอยู่)

```bash
npm run test:coverage
```

---

## 2. ผลการรัน

```text
ℹ tests 27
ℹ pass 27
ℹ fail 0

file              | line % | branch % | funcs % | uncovered lines
------------------|--------|----------|---------|-----------------------------------------
src               |        |          |         |
 db.js            | 100.00 |    20.00 |  100.00 |
 index.js         |  88.39 |    73.47 |   91.67 | 77-79 106-108 131-133 160-162 175-177
                  |        |          |         | 190-192 218-220 242-244 281-283 296-298
                  |        |          |         | 303-308
 services         |        |          |         |
  external-api.js | 100.00 |    85.71 |  100.00 |
------------------|--------|----------|---------|-----------------------------------------
all files         |  90.82 |    72.06 |   93.33 |
```

| ตัวชี้วัด | ค่า |
| :--- | :---: |
| Line coverage | **90.82%** |
| Branch coverage | **72.06%** |
| Function coverage | **93.33%** |
| Tests ผ่าน | **27 / 27** |

---

## 3. สิ่งที่ทดสอบ

### 3.1 `tests/api.test.js` — Integration test ของทุก endpoint

| กลุ่ม | กรณีทดสอบ |
| :--- | :--- |
| โครงสร้างระบบ | `/api-docs/` เปิด Swagger UI ได้, `/` เปิดหน้า Frontend ได้, OPTIONS preflight คืน CORS header |
| Swagger/Code Match | อ่าน `openapi.yaml` แล้วเทียบกับ route ที่ลงทะเบียนใน Express — ต้องตรงกันทุกตัวทั้งสองทิศทาง |
| Categories | `GET /categories` → 200 |
| Recipes | `GET /recipes` → 200, กรอง `category_id` + `search` พร้อมกัน, `POST` → 201 / 400, `GET /:id` → 200 / 404, `PUT /:id` → 200 / 400 / 404, `DELETE /:id` → 200 / 404 |
| Reviews | `POST` rating ผิด → 400, สูตรไม่มีอยู่ → 404, ถูกต้อง → 201, `GET` เห็นรีวิวที่เพิ่งสร้าง, `DELETE /reviews/:id` → 200 / 404 |
| Nutrition | `GET /recipes/:id/nutrition` → 200 (mock API ภายนอก), สูตรไม่มีอยู่ → 404 |

### 3.2 `tests/external-api.test.js` — Unit test ของ Retry / Timeout / Fallback

| กรณี | สิ่งที่ตรวจ |
| :--- | :--- |
| Happy path | เรียก API **1 ครั้ง** ได้ `source: external_api` |
| Timeout | ค่า `timeout` ที่ส่งให้ axios คือ **3000 ms** |
| API ไม่มีข้อมูล | คืนค่า default 250 kcal, `status: success_no_data` |
| Retry | ล้มเหลวครั้งแรก สำเร็จครั้งที่สอง → เรียก **2 ครั้ง** |
| Fallback | ล้มเหลวทุกครั้ง → เรียก **3 ครั้ง** (1 + retry 2) แล้วคืน `source: fallback`, `calories: "N/A"` โดยไม่ throw |

---

## 4. จุดที่ Coverage ต่ำที่สุด 3 อันดับ พร้อมเหตุผล

| อันดับ | ไฟล์ | ค่าที่ต่ำ | ส่วนที่ไม่ถูกทดสอบ | เหตุผล / ความเสี่ยง | แนวทางปรับปรุง |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | `src/db.js` | branch 20.00% | ค่า default หลัง `\|\|` ใน `createPool` (`'localhost'`, `'root'`, `''`, `'recipe_db'`) | ตอนทดสอบตั้งค่าครบใน `.env` แล้ว ทางที่ใช้ค่า default จึงไม่ถูกเรียก ความเสี่ยงต่ำ เพราะเป็นแค่การอ่านค่าตั้งต้น ไม่มีตรรกะอื่น | เพิ่ม unit test ที่ลบตัวแปร env ก่อน `require` แล้วตรวจ config ของ pool |
| 2 | `src/index.js` | branch 73.47%, line 88.39% | บล็อก `catch` ที่คืน 500 ของทุก route (บรรทัด 77-79, 106-108, 131-133, 160-162, 175-177, 190-192, 218-220, 242-244, 281-283, 296-298) และบล็อก `app.listen` (303-308) | test ใช้ DB จริงที่ทำงานปกติ จึงไม่เกิด error 500 ส่วน `app.listen` จะทำงานเฉพาะตอนรันไฟล์ตรงๆ (test เรียก `app.listen(0)` เอง) ความเสี่ยงปานกลาง: ถ้า DB ล่ม ผู้ใช้ยังได้ 500 พร้อมข้อความมาตรฐาน แต่ตอนนี้ยังไม่มี test ยืนยันพฤติกรรมนี้ | ใช้ `t.mock.method(pool, 'query', ...)` ให้ throw แล้วตรวจว่าได้ 500 |
| 3 | `src/services/external-api.js` | branch 85.71% | ค่าสำรอง `\|\| 300` เมื่อ API คืนสูตรที่ไม่มี `caloriesPerServing` และกรณี `response.data` เป็นค่าว่าง | mock ที่ใช้คืนข้อมูลครบเสมอ ความเสี่ยงต่ำ เพราะมีค่าสำรองรองรับแล้ว | เพิ่ม test ที่ mock เป็น `{ recipes: [{}] }` และ `{ data: null }` |

---

## 5. สรุป

- ทุก endpoint ทั้ง 10 ตัวมี integration test ครอบคลุมทั้งทางสำเร็จและทาง error ฝั่ง client (400/404)
- Retry / Timeout / Fallback มี unit test ยืนยันจำนวนครั้งที่เรียกและค่า timeout จริง
- ส่วนที่ยังไม่ครอบคลุมส่วนใหญ่คือ error 500 ฝั่งฐานข้อมูล ซึ่งระบุไว้ในหัวข้อ 4 พร้อมแนวทางปรับปรุงแล้ว
