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
ℹ tests 28
ℹ pass 28
ℹ fail 0

file              | line % | branch % | funcs % | uncovered lines
------------------|--------|----------|---------|-----------------------------------------
src               |        |          |         | 
 db.js            | 100.00 |   100.00 |  100.00 | 
 index.js         |  88.39 |    73.47 |   91.67 | 77-79 106-108 131-133 160-162 175-177 190-192 218-220 242-244 281-283 296-298 303-308
 services         |        |          |         | 
  external-api.js | 100.00 |    85.71 |  100.00 | 
------------------|--------|----------|---------|-----------------------------------------
all files         |  90.82 |    77.94 |   93.33 | 
```

| ตัวชี้วัด | ค่า |
| :--- | :---: |
| Line coverage | **90.82%** |
| Branch coverage | **77.94%** |
| Function coverage | **93.33%** |
| Tests ผ่าน | **28 / 28** |

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

### 3.3 `tests/db.test.js` — Unit test ของการโหลดค่า Config ฐานข้อมูล
- ทดสอบการทำงานของ `src/db.js` ทั้งในกรณีที่ตัวแปรสภาพแวดล้อม (`.env`) มีค่าครบถ้วน และกรณีไม่มีตัวแปรเพื่อทดสอบ Default Fallback Values (`localhost`, `root`, `recipe_db`) ส่งผลให้ Branch Coverage ของ `src/db.js` สมบูรณ์ **100.00%**

---

## 4. การวิเคราะห์ส่วนที่ Coverage ยังไม่ครอบคลุม 100% พร้อมเหตุผล (Lowest Coverage Analysis)

ตามข้อกำหนดของโครงงานระยะที่ 3 ได้วิเคราะห์จุดที่โค้ดยังไม่ครอบคลุม 100% ดังนี้:

| อันดับ | ไฟล์ | ส่วนที่ไม่ถูกทดสอบ | เหตุผลและความเสี่ยง (Risk Analysis) | แนวทางปรับปรุง |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `src/index.js`<br>(Database Catch Blocks) | บล็อก `catch` ที่คืน 500 ของทุก route (บรรทัด 77-79, 106-108, 131-133, 160-162, 175-177, 190-192, 218-220, 242-244, 281-283, 296-298) | **เหตุผล:** เป็นโค้ดดักจับกรณีโครงสร้างพื้นฐานระดับล่าง (Hardware/Network DB) ขัดข้องกะทันหัน ซึ่งชุด Integration Test ปกติรันบนฐานข้อมูลจริงที่ทำงานสมบูรณ์<br>**ความเสี่ยง:** ต่ำ เนื่องจาก Express มี Global Error Handling และโค้ดในบล็อกทำหน้าที่คืนค่ามาตรฐาน HTTP 500 | ใช้ Mocking ให้ `pool.query` จำลองการ Throw Error เพื่อทดสอบ Response 500 |
| 2 | `src/index.js`<br>(Server Listen Block) | บรรทัด 303-308 (`if (require.main === module) app.listen(...)`) | **เหตุผล:** บล็อกนี้ทำงานเฉพาะตอนรันเซิร์ฟเวอร์ตรง ๆ ด้วย `node src/index.js` ส่วน Automated Tests จะ import `app` ไปรันบน Dynamic Port เพื่อป้องกันพอร์ตชน<br>**ความเสี่ยง:** ต่ำมาก เป็นเพียงคำสั่งเริ่มฟังพอร์ต | ทดสอบด้วย CLI child process runner |
| 3 | `src/services/external-api.js`<br>(Empty Data Calories Fallback) | บรรทัด 33 (ค่าสำรอง `\|\| 300` เมื่อ API คืนสูตรที่ไม่มี `caloriesPerServing`) | **เหตุผล:** ในการทดสอบ Mock จะคืนค่าที่สมบูรณ์เสมอ<br>**ความเสี่ยง:** ต่ำมาก เนื่องจากระบบมีค่า default 250 kcal รองรับไว้อยู่แล้ว | เพิ่ม Mock Case ที่มีข้อมูลสูตรแต่ไม่มีฟิลด์ `caloriesPerServing` |

---

## 5. สรุป

- ทุก endpoint ทั้ง 10 ตัวมี integration test ครอบคลุมทั้งทางสำเร็จและทาง error ฝั่ง client (400/404)
- Retry / Timeout / Fallback มี unit test ยืนยันจำนวนครั้งที่เรียกและค่า timeout จริง
- ส่วนที่ยังไม่ครอบคลุมส่วนใหญ่คือ error 500 ฝั่งฐานข้อมูล ซึ่งระบุไว้ในหัวข้อ 4 พร้อมแนวทางปรับปรุงแล้ว
