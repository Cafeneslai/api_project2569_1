# Checklist ตรวจสอบ CLO Requirements — โครงงานระยะที่ 3

**รหัสนิสิต:** 67160193
**หัวข้อโครงงาน:** Pno 4 — ระบบข้อมูลสูตรอาหาร (Recipe Information System)

> ทุก path ในเอกสารนี้เป็น **path สัมพัทธ์จากโฟลเดอร์ `project-phase3-67160193/`** (โฟลเดอร์เดียวกับไฟล์นี้) เลขบรรทัดตรวจกับไฟล์ที่ส่งจริงแล้ว

## โครงสร้างไฟล์ที่ส่ง

```text
project-phase3-67160193/
├── src/
│   ├── index.js                  # Express app รวมทุกโมดูล + Swagger UI (/api-docs) + เสิร์ฟ frontend
│   ├── db.js                     # MySQL connection pool
│   └── services/external-api.js  # Retry / Timeout / Fallback
├── frontend/
│   ├── index.html
│   ├── app.js                    # เรียก API จริงด้วย fetch
│   └── style.css
├── tests/
│   ├── api.test.js               # integration test ทุก endpoint + Swagger/Code match
│   └── external-api.test.js      # unit test retry/timeout/fallback
├── openapi.yaml
├── coverage-report.md
├── coverage-output.txt           # ผลรัน test + coverage ดิบ
├── clo-requirements-checklist.md
├── microservices-design.md
├── failure-scenario-results.md
├── schema.sql / seed.sql
├── .env.example
└── package.json
```

## วิธีรันเพื่อตรวจสอบ

```bash
# 1) สร้างฐานข้อมูล
mysql -u root -p < schema.sql
mysql -u root -p recipe_db < seed.sql

# 2) ตั้งค่า
cp .env.example .env      # แล้วแก้ DB_PASSWORD ให้ตรงกับเครื่อง
npm install

# 3) รันระบบ
npm start                 # http://localhost:3000  (Frontend)
                          # http://localhost:3000/api-docs  (Swagger UI)

# 4) รัน test + coverage
npm run test:coverage
```

---

## ส่วนที่ 1: Final Integration — CLO8 (5 คะแนน)

| เกณฑ์ | คะแนน | สถานะ | หลักฐาน (ไฟล์:บรรทัด) | วิธีตรวจ |
| :--- | :---: | :---: | :--- | :--- |
| **1.1 ระบบรวมทำงานได้จริงโดยไม่มี conflict หรือ error หลงเหลือ** | 1.5 | ✅ | • รวมทุกโมดูลในไฟล์เดียว: [src/index.js](src/index.js)<br>• Recipes CRUD (W5): [src/index.js:43-178](src/index.js#L43-L178)<br>• Categories: [src/index.js:185-193](src/index.js#L185-L193)<br>• Nutrition + Resilience (W11): [src/index.js:200-221](src/index.js#L200-L221), [src/services/external-api.js:13-64](src/services/external-api.js#L13-L64)<br>• Reviews & Rating (W13): [src/index.js:228-299](src/index.js#L228-L299)<br>• Swagger UI: [src/index.js:35-36](src/index.js#L35-L36)<br>• เสิร์ฟ Frontend: [src/index.js:32](src/index.js#L32)<br>• ฐานข้อมูล: [schema.sql](schema.sql) (3 ตาราง, FK + `ON DELETE CASCADE` บรรทัด 30, `CHECK` rating บรรทัด 27), [seed.sql](seed.sql), [src/db.js](src/db.js) | • `npm start` แล้วเปิด `/`, `/api-docs`, `/api/v1/recipes` ได้ 200<br>• ค้นหา conflict marker (`<<<<<<<`, `=======`, `>>>>>>>`) ทั้งโฟลเดอร์: **0 รายการ**<br>• `npm test`: **27/27 ผ่าน** ([coverage-output.txt](coverage-output.txt)) |
| **1.2 เอกสาร API ตรงกับโค้ดจริงทั้งหมด (Swagger/Code Match)** | 1 | ✅ | • [openapi.yaml](openapi.yaml): 10 operations ใน 6 paths<br>• test ที่เทียบ spec กับ route ใน Express อัตโนมัติ: [tests/api.test.js:65-88](tests/api.test.js#L65-L88)<br>• query param `category_id`, `search`: [openapi.yaml:18-32](openapi.yaml#L18-L32) ↔ [src/index.js:45-70](src/index.js#L45-L70)<br>• status code ของแต่ละ endpoint (200/201/400/404/500) ตรงกับ `res.status(...)` ในโค้ด | ตารางเทียบด้านล่าง + test ข้อ 1.2 ผ่าน |
| **1.3 รายงาน Test Coverage ครบถ้วนและสะท้อนสถานะจริงของโค้ด** | 1 | ✅ | • [coverage-report.md](coverage-report.md)<br>• ผลรันดิบ: [coverage-output.txt](coverage-output.txt)<br>• ไฟล์ test: [tests/api.test.js](tests/api.test.js), [tests/external-api.test.js](tests/external-api.test.js)<br>• สคริปต์: [package.json:9-10](package.json#L9-L10) | `npm run test:coverage` ได้ line **90.82%**, branch **72.06%**, funcs **93.33%** ตรงกับรายงาน และรายงานระบุจุดต่ำสุด 3 อันดับพร้อมเหตุผล |
| **1.4 Checklist ตรวจสอบ CLO ครบถ้วนพร้อมหลักฐานที่ตรวจสอบได้** | 1.5 | ✅ | เอกสารนี้ — ทุกข้ออ้างอิงไฟล์และบรรทัดในโฟลเดอร์ที่ส่ง | คลิกลิงก์ในตารางเพื่อเปิดไฟล์ตรงบรรทัด |

### ตารางเทียบ openapi.yaml ↔ โค้ด

| Method | Path | openapi.yaml | src/index.js | Status codes (ทั้งสองฝั่ง) | Test |
| :--- | :--- | :---: | :---: | :--- | :---: |
| GET | `/api/v1/recipes` | [L15](openapi.yaml#L15) | [L43](src/index.js#L43) | 200, 500 | [L99](tests/api.test.js#L99), [L106](tests/api.test.js#L106) |
| POST | `/api/v1/recipes` | [L54](openapi.yaml#L54) | [L112](src/index.js#L112) | 201, 400, 500 | [L115](tests/api.test.js#L115), [L120](tests/api.test.js#L120) |
| GET | `/api/v1/recipes/{id}` | [L94](openapi.yaml#L94) | [L83](src/index.js#L83) | 200, 404, 500 | [L132](tests/api.test.js#L132), [L139](tests/api.test.js#L139) |
| PUT | `/api/v1/recipes/{id}` | [L129](openapi.yaml#L129) | [L137](src/index.js#L137) | 200, 400, 404, 500 | [L144](tests/api.test.js#L144), [L156](tests/api.test.js#L156), [L161](tests/api.test.js#L161) |
| DELETE | `/api/v1/recipes/{id}` | [L174](openapi.yaml#L174) | [L166](src/index.js#L166) | 200, 404, 500 | [L227](tests/api.test.js#L227) |
| GET | `/api/v1/categories` | [L209](openapi.yaml#L209) | [L185](src/index.js#L185) | 200, 500 | [L91](tests/api.test.js#L91) |
| GET | `/api/v1/recipes/{id}/nutrition` | [L235](openapi.yaml#L235) | [L200](src/index.js#L200) | 200, 404, 500 | [L212](tests/api.test.js#L212), [L221](tests/api.test.js#L221) |
| GET | `/api/v1/recipes/{id}/reviews` | [L268](openapi.yaml#L268) | [L228](src/index.js#L228) | 200, 500 | [L198](tests/api.test.js#L198) |
| POST | `/api/v1/recipes/{id}/reviews` | [L299](openapi.yaml#L299) | [L248](src/index.js#L248) | 201, 400, 404, 500 | [L172](tests/api.test.js#L172), [L180](tests/api.test.js#L180), [L188](tests/api.test.js#L188) |
| DELETE | `/api/v1/reviews/{id}` | [L352](openapi.yaml#L352) | [L287](src/index.js#L287) | 200, 404, 500 | [L204](tests/api.test.js#L204) |

### Resilience (จากระยะที่ 2) ที่ยังทำงานในระบบรวม

| กลไก | โค้ด | Test |
| :--- | :--- | :--- |
| Retry 2 ครั้ง (รวม 3 ครั้ง) หน่วง 2 วินาที | [src/services/external-api.js:17](src/services/external-api.js#L17), [L20](src/services/external-api.js#L20), [L61](src/services/external-api.js#L61) | [tests/external-api.test.js:32](tests/external-api.test.js#L32) (เรียก 2 ครั้ง), [L44](tests/external-api.test.js#L44) (เรียก 3 ครั้ง) |
| Timeout 3000 ms | [src/services/external-api.js:18](src/services/external-api.js#L18), [L26](src/services/external-api.js#L26) | [tests/external-api.test.js:19](tests/external-api.test.js#L19) |
| Fallback ไม่ทำให้ระบบล่ม | [src/services/external-api.js:48-57](src/services/external-api.js#L48-L57) | [tests/external-api.test.js:44](tests/external-api.test.js#L44) |

---

## ส่วนที่ 2: Client-Facing Frontend — CLO6 (10 คะแนน)

เทคโนโลยี: HTML / CSS / JavaScript ล้วน (ตาม `wk15-frontend.md`) เปิดได้ทั้งจาก `npm start` (http://localhost:3000) หรือ VS Code Live Server — ค่า `API_BASE` เลือก URL ของ backend ให้อัตโนมัติ: [frontend/app.js:6-8](frontend/app.js#L6-L8)

| เกณฑ์ | คะแนน | สถานะ | หลักฐาน (ไฟล์:บรรทัด) |
| :--- | :---: | :---: | :--- |
| **2.1 เรียกใช้ API จริงครบตามที่กำหนด (≥ 3 endpoint รวม GET และการเปลี่ยนแปลงข้อมูล)** | 4 | ✅ | เรียกจริง **10 endpoint** (GET 5, POST 2, PUT 1, DELETE 2) ดูตารางด้านล่าง |
| **2.2 ออกแบบหน้าจอเหมาะกับผู้ใช้ แสดงสถานะ loading/error ชัดเจน** | 3 | ✅ | • Loading spinner: [frontend/index.html:67](frontend/index.html#L67), ควบคุมที่ [frontend/app.js:690-692](frontend/app.js#L690-L692)<br>• Error พร้อมปุ่ม "ลองใหม่อีกครั้ง": [frontend/index.html:73-78](frontend/index.html#L73-L78), แสดงเมื่อ fetch ล้มเหลวที่ [frontend/app.js:213-249](frontend/app.js#L213-L249)<br>• Empty state: [frontend/index.html:81](frontend/index.html#L81)<br>• Loading ของข้อมูลโภชนาการ + ป้ายบอกว่าข้อมูลมาจาก API จริงหรือ Fallback: [frontend/index.html:137](frontend/index.html#L137), [frontend/app.js:335-370](frontend/app.js#L335-L370)<br>• Toast แจ้งผลสำเร็จ/ล้มเหลวทุกการเปลี่ยนแปลงข้อมูล: [frontend/index.html:308](frontend/index.html#L308), [frontend/app.js:74](frontend/app.js#L74)<br>• ปุ่ม submit ถูก disable และเปลี่ยนเป็น "กำลังบันทึก..." ระหว่างรอ API<br>• CSS ของสถานะ: [frontend/style.css:369-400](frontend/style.css#L369-L400), [frontend/style.css:737-767](frontend/style.css#L737-L767) |
| **2.3 แบบฟอร์มรับข้อมูลทำงานถูกต้อง พร้อมตรวจสอบความถูกต้องเบื้องต้น** | 3 | ✅ | มี 3 ฟอร์ม ทุกฟอร์มตรวจข้อมูลก่อนส่ง และแสดงข้อความ error จาก server ถ้า API ปฏิเสธ<br>• **เพิ่มสูตร**: [frontend/index.html:223-257](frontend/index.html#L223-L257), ตรวจที่ [frontend/app.js:437-453](frontend/app.js#L437-L453) (ชื่อไม่ว่าง, เลือกหมวดหมู่, เวลาปรุงเป็นตัวเลข > 0, ส่วนผสมไม่ว่าง)<br>• **แก้ไขสูตร**: [frontend/index.html:268-303](frontend/index.html#L268-L303), โหลดค่าเดิมมาใส่ฟอร์ม [frontend/app.js:496-514](frontend/app.js#L496-L514), ตรวจที่ [frontend/app.js:526-546](frontend/app.js#L526-L546)<br>• **รีวิว**: [frontend/index.html:169-196](frontend/index.html#L169-L196), ตรวจที่ [frontend/app.js:599-607](frontend/app.js#L599-L607) (ชื่อไม่ว่าง, คะแนน 1–5) |

### Endpoint ที่ Frontend เรียกจริง

| # | Method | Endpoint | ใช้ทำอะไรบนหน้าจอ | frontend/app.js |
| :---: | :--- | :--- | :--- | :--- |
| 1 | GET | `/api/v1/categories` | เติมตัวเลือกหมวดหมู่ (ตัวกรอง + ฟอร์ม) | [L175](frontend/app.js#L175) |
| 2 | GET | `/api/v1/recipes?category_id=&search=` | แสดงการ์ดสูตร, ค้นหา, กรอง | [L213](frontend/app.js#L213) |
| 3 | GET | `/api/v1/recipes/:id` | หน้าต่างรายละเอียด / ดึงค่าเดิมมาแก้ไข | [L301](frontend/app.js#L301), [L496](frontend/app.js#L496) |
| 4 | GET | `/api/v1/recipes/:id/nutrition` | แสดงแคลอรี่ (External API + Fallback) | [L335](frontend/app.js#L335) |
| 5 | GET | `/api/v1/recipes/:id/reviews` | แสดงรายการรีวิว | [L375](frontend/app.js#L375) |
| 6 | POST | `/api/v1/recipes` | ฟอร์มเพิ่มสูตร | [L429](frontend/app.js#L429) |
| 7 | PUT | `/api/v1/recipes/:id` | ฟอร์มแก้ไขสูตร | [L516](frontend/app.js#L516) |
| 8 | POST | `/api/v1/recipes/:id/reviews` | ฟอร์มรีวิว | [L590](frontend/app.js#L590) |
| 9 | DELETE | `/api/v1/recipes/:id` | ปุ่มลบสูตร (มีกล่องยืนยัน) | [L643](frontend/app.js#L643) |
| 10 | DELETE | `/api/v1/reviews/:id` | ปุ่มลบรีวิว (มีกล่องยืนยัน) | [L669](frontend/app.js#L669) |

---

## สรุป

| ส่วน | CLO | คะแนนเต็ม | สถานะ |
| :--- | :---: | :---: | :---: |
| ส่วนที่ 1: Final Integration | CLO8 | 5 | ✅ ครบทุกข้อ |
| ส่วนที่ 2: Client-Facing Frontend | CLO6 | 10 | ✅ ครบทุกข้อ |
