# คลังข้อสอบและแนวทางตอบคำถามสำหรับนำเสนอโครงงาน (Q&A Defense Guide)
## โครงงาน: ระบบข้อมูลสูตรอาหาร (Recipe Information System) — Phase 3
**รหัสนิสิต:** 67160193 | **วิชา:** พัฒนาเว็บเซอร์วิสและสถาปัตยกรรมแบ็กเอนด์ (Backend Development & Integration)

> **บทบาทจำลอง:** อาจารย์ผู้ตรวจข้อสอบ/กรรมการสอบโปรเจกต์ภาควิชาวิศวกรรมคอมพิวเตอร์และเทคโนโลยีสารสนเทศ  
> **วัตถุประสงค์:** เตรียมความพร้อมให้นิสิตสามารถตอบคำถามกรรมการได้อย่างมั่นใจ ครอบคลุมทั้งแนวคิดระดับสถาปัตยกรรม (Architecture), ตรรกะของโค้ด (Implementation), ฐานข้อมูล (Database), ความทนทานของระบบ (Resilience), และการทดสอบอัตโนมัติ (Automated Testing)

---

## 📌 สารบัญหมวดหมู่คำถาม
1. [หมวดที่ 1: ภาพรวมสถาปัตยกรรมและเทคโนโลยี (Architecture & Technology Stack)](#หมวดที่-1-ภาพรวมสถาปัตยกรรมและเทคโนโลยี)
2. [หมวดที่ 2: การออกแบบฐานข้อมูลและความสัมพันธ์ (Database Design & Integrity)](#หมวดที่-2-การออกแบบฐานข้อมูลและความสัมพันธ์)
3. [หมวดที่ 3: สถาปัตยกรรม RESTful API และการทำงานของโค้ดแบ็กเอนด์ (Backend Deep Dive)](#หมวดที่-3-สถาปัตยกรรม-restful-api-และการทำงานของโค้ดแบ็กเอนด์)
4. [หมวดที่ 4: การเชื่อมต่อบริการภายนอกและความทนทานของระบบ (External Integration & Resilience)](#หมวดที่-4-การเชื่อมต่อบริการภายนอกและความทนทานของระบบ)
5. [หมวดที่ 5: การทดสอบซอฟต์แวร์และการวัดความครอบคลุม (Automated Testing & Coverage)](#หมวดที่-5-การทดสอบซอฟต์แวร์และการวัดความครอบคลุม)
6. [หมวดที่ 6: ความปลอดภัยและการขยายระบบสู่ Production (Security & Scalability)](#หมวดที่-6-ความปลอดภัยและการขยายระบบสู่-production)
7. [หมวดที่ 7: คำถามเจาะโค้ดและคำถามจับไต๋ (Tricky & Edge-Case Questions)](#หมวดที่-7-คำถามเจาะโค้ดและคำถามจับไต๋)

---

## หมวดที่ 1: ภาพรวมสถาปัตยกรรมและเทคโนโลยี

### Q1.1: ทำไมถึงเลือกสถาปัตยกรรม REST API และทำไมต้องแบ่งเป็น Frontend กับ Backend แยกกัน?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความเข้าใจเรื่อง Separation of Concerns และ Client-Server Architecture
* **💡 แนวทางการตอบ (Model Answer):**
  > "ระบบนี้ออกแบบตามหลัก **Client-Server Architecture** และใช้ **RESTful API Architecture** เนื่องจาก:
  > 1. **Separation of Concerns (การแยกหน้าที่กันอย่างชัดเจน):** ฝั่ง Backend (`Express.js`) มีหน้าที่เพียงจัดการ Business Logic, เชื่อมต่อฐานข้อมูล MySQL, และควบคุมความปลอดภัย โดยส่งข้อมูลกลับมาในรูปแบบมาตรฐาน JSON ในขณะที่ฝั่ง Frontend (HTML/CSS/JS) รับหน้าที่นำเสนอข้อมูล (Presentation Layer) สู่ผู้ใช้งาน
  > 2. **Scalability & Reusability:** การทำ API ที่เป็น Stateless ตามหลัก REST ทำให้ในอนาคต หากเราต้องการพัฒนา Mobile Application (iOS/Android) หรือมีบริการอื่นมาเชื่อมต่อ ก็สามารถใช้ API ชุดเดิมที่ `/api/v1/...` ได้ทันทีโดยไม่ต้องเขียนตรรกะใหม่
  > 3. **Maintainability:** ทีมงานสามารถพัฒนาหรือแก้ไขโค้ดหน้าบ้านและหลังบ้านแยกกันได้อย่างอิสระผ่านข้อตกลงร่วมกัน (API Contract) ที่ระบุไว้ในเอกสาร `openapi.yaml` ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Client-Server Architecture, Separation of Concerns, Stateless, JSON, Reusability, API Contract

---

### Q1.2: ช่วยอธิบายภาพรวมของระบบนี้ตั้งแต่หน้าบ้านจนถึงฐานข้อมูล (End-to-End Flow) เมื่อผู้ใช้เปิดหน้าเว็บ?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบว่านิสิตเห็นภาพการไหลของข้อมูล (Data Flow) หรือไม่
* **💡 แนวทางการตอบ (Model Answer):**
  > "เมื่อผู้ใช้เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/`:
  > 1. **Static Serving:** Express จะส่งไฟล์หน้าเว็บ `frontend/index.html`, `style.css`, และ `app.js` ผ่าน middleware `express.static()`
  > 2. **Client Initialization:** เมื่อสคริปต์ `app.js` ทำงานในเบราว์เซอร์ จะเรียกฟังก์ชัน `loadCategories()` และ `loadRecipes()` ผ่านคำสั่ง `fetch()`
  > 3. **HTTP Request:** เบราว์เซอร์ส่ง HTTP GET Request ไปยัง `http://localhost:3000/api/v1/recipes`
  > 4. **Middleware & Routing:** ใน `src/index.js` คำขอจะวิ่งผ่าน Middleware ตรวจสอบ CORS, แปลง Body เป็น JSON, แล้วส่งต่อไปยัง Route Handler `app.get('/api/v1/recipes')`
  > 5. **Database Query:** Backend ดึงการเชื่อมต่อจาก Connection Pool (`mysql2/promise`) แล้วรันคำสั่ง SQL `JOIN` ระหว่างตาราง `recipes` และ `categories`
  > 6. **Response:** ข้อมูลดิบจาก MySQL จะถูกจัดลงในรูปแบบ JSON `{ message: '...', data: [...] }` ส่งกลับ Status 200 OK ให้ Frontend
  > 7. **DOM Rendering:** `app.js` นำข้อมูลที่ได้ไปสร้าง HTML Elements แบบไดนามิกเพื่อแสดงผลเป็นการ์ดสูตรอาหารบนหน้าจอครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Static File Serving, Fetch API, Middleware, Connection Pool, SQL JOIN, JSON Response, DOM Manipulation

---

## หมวดที่ 2: การออกแบบฐานข้อมูลและความสัมพันธ์

### Q2.1: ในฐานข้อมูลมีกี่ตาราง มีความสัมพันธ์กันอย่างไร และออกแบบ Foreign Key อย่างไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความเข้าใจด้าน Relational Database Design และ Referential Integrity
* **💡 แนวทางการตอบ (Model Answer):**
  > "ฐานข้อมูล `recipe_db` ออกแบบตามกฎการทำให้เป็นมาตรฐาน (Normalization) มีทั้งหมด 3 ตารางหลัก ได้แก่:
  > 1. **`categories`** (ตารางหมวดหมู่อาหาร) มีฟิลด์ `id` (PK) และ `name` (Unique)
  > 2. **`recipes`** (ตารางสูตรอาหาร) มี `id` (PK), `category_id` (FK), `name`, `ingredients`, `cook_time_minutes`, `created_at`
  > 3. **`reviews`** (ตารางรีวิวและเรตติ้ง) มี `id` (PK), `recipe_id` (FK), `reviewer_name`, `rating`, `comment`, `created_at`
  >
  > **ความสัมพันธ์ (Relationships):**
  > - **1:N ระหว่าง Categories กับ Recipes:** 1 หมวดหมู่มีได้หลายสูตร โดยตั้งค่า Foreign Key เป็น `ON DELETE RESTRICT` เพื่อป้องกันการลบหมวดหมู่ที่มีสูตรอาหารผูกอยู่ ซึ่งช่วยรักษาความถูกต้องของข้อมูล (Data Integrity)
  > - **1:N ระหว่าง Recipes กับ Reviews:** 1 สูตรอาหารมีได้หลายรีวิว โดยตั้งค่า Foreign Key เป็น `ON DELETE CASCADE` เพื่อที่เวลาผู้ใช้ลบสูตรอาหาร รีวิวทั้งหมดที่เป็นของสูตรนั้นจะถูกลบตามไปด้วยอัตโนมัติ ไม่ให้เกิดข้อมูลกำพร้า (Orphan Records) ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** One-to-Many (1:N), Referential Integrity, ON DELETE RESTRICT, ON DELETE CASCADE, Orphan Records

---

### Q2.2: ในตาราง `reviews` มีการตั้งเงื่อนไข `CHECK (rating >= 1 AND rating <= 5)` ไว้ ทำไมทั้งที่ในโค้ด Node.js ก็มีการดักตรวจแล้ว ต้องทำซ้ำซ้อนเพื่ออะไร?
* **🎯 เจตนาของอาจารย์:** วัดความเข้าใจเรื่อง Defense in Depth (การป้องกันหลายชั้น)
* **💡 แนวทางการตอบ (Model Answer):**
  > "นี่คือแนวคิด **Defense in Depth (การป้องกันเชิงลึกหลายระดับ)** ครับอาจารย์:
  > 1. **Application-Level Validation (ระดับโค้ด):** ใน `src/index.js` เราตรวจสอบ `if (rating < 1 || rating > 5)` เพื่อตอบกลับ HTTP 400 Bad Request พร้อมข้อความแจ้งเตือนที่เข้าใจง่ายให้แก่ผู้ใช้ทันที ไม่ต้องรอให้เซิร์ฟเวอร์ส่งคำสั่งไปถึงฐานข้อมูล ช่วยลดภาระการทำงานของ Database
  > 2. **Database-Level Constraint (ระดับฐานข้อมูล):** ข้อจำกัด `CHECK` constraint ใน `schema.sql` เป็นปราการด่านสุดท้าย เพื่อรับประกันว่า ไม่ว่าข้อมูลจะถูกเพิ่มผ่าน API, ผ่านสคริปต์ Migration อื่น, หรือผู้ดูแลระบบแอบพิมพ์คำสั่ง INSERT ตรง ๆ ผ่าน phpMyAdmin คะแนนรีวิวก็จะไม่มีทางหลุดนอกช่วง 1 ถึง 5 อย่างเด็ดขาดครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Defense in Depth, Application Validation, Database Constraint, Data Integrity, Input Sanitation

---

### Q2.3: ทำไมใน `db.js` ถึงเลือกใช้ Connection Pool แทนที่จะใช้ `createConnection` ธรรมดา?
* **🎯 เจตนาของอาจารย์:** ทดสอบความรู้เรื่อง Database Performance และ Resource Management
* **💡 แนวทางการตอบ (Model Answer):**
  > "ถ้าใช้ `createConnection` ทุกครั้งที่มี Request เข้ามา เซิร์ฟเวอร์จะต้องเปิด TCP Connection ใหม่ ทำการ Handshake และตรวจสอบสิทธิ์กับ MySQL ใหม่ทุกรอบ ซึ่งสิ้นเปลือง CPU, Memory, และเกิด Latency สูงมาก
  > 
  > เราจึงเลือกใช้ `mysql.createPool()` เพราะ:
  > 1. **Connection Reuse:** มีการสร้างและเปิดการเชื่อมต่อทิ้งไว้ล่วงหน้า (ในระบบเราตั้ง `connectionLimit: 10`) เมื่อมีคำขอเข้ามา สามารถหยิบการเชื่อมต่อไปใช้งานและคืนกลับ Pool ได้ทันที
  > 2. **Concurrency & Queueing:** รองรับการทำงานแบบ Concurrent Requests ได้อย่างมีประสิทธิภาพ และมีคิวรอ (`queueLimit: 0`) หากการเชื่อมต่อเต็ม
  > 3. **Promise-based API:** เราใช้แพ็กเกจ `mysql2/promise` ร่วมกับไวยากรณ์ `async/await` ทำให้โค้ดอ่านง่าย เป็นระเบียบ และจัดการข้อผิดพลาดผ่าน `try/catch` ได้อย่างรัดกุมครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Connection Pool, Connection Reuse, Overhead reduction, Concurrency, `mysql2/promise`, `async/await`

---

## หมวดที่ 3: สถาปัตยกรรม RESTful API และการทำงานของโค้ดแบ็กเอนด์

### Q3.1: ใน `src/index.js` คุณเขียน CORS Middleware เอง ทำไมถึงไม่ใช้ package `cors` และบล็อก `if (req.method === 'OPTIONS')` มีไว้ทำไม?
* **🎯 เจตนาของอาจารย์:** วัดความลึกซึ้งเรื่องกลไก Browser Security และ HTTP Specification
* **💡 แนวทางการตอบ (Model Answer):**
  > "เราสามารถเขียน Native CORS Middleware ได้เองโดยตรงเพื่อลด Dependency ภายนอก และเข้าใจการทำงานจริงของโปรโตคอล HTTP ครับ
  > 
  > ส่วนโค้ด:
  > ```javascript
  > if (req.method === 'OPTIONS') {
  >   return res.sendStatus(200);
  > }
  > ```
  > มีไว้เพื่อจัดการ **HTTP Preflight Request** ครับ โดยเมื่อเบราว์เซอร์ส่งคำขอข้ามโดเมน (Cross-Origin) ที่มีเมธอดแบบ DELETE, PUT หรือมี Header พิเศษอย่าง `Content-Type: application/json` เบราว์เซอร์จะส่งคำขอเมธอด `OPTIONS` มาถามเซิร์ฟเวอร์ก่อนว่าอนุญาตให้คุยไหม
  > 
  > ถ้าเซิร์ฟเวอร์ตอบกลับ 200 OK พร้อม Header `Access-Control-Allow-Methods` และ `Access-Control-Allow-Origin` เบราว์เซอร์จึงจะส่ง Request จริง (เช่น POST/PUT/DELETE) ตามมา หากเราไม่ดักจับ OPTIONS ไว้ เบราว์เซอร์จะบล็อกคำขอและแจ้ง Error ทันทีครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Cross-Origin Resource Sharing (CORS), Preflight Request, HTTP OPTIONS, Access-Control Headers

---

### Q3.2: Endpoint `GET /api/v1/recipes` รองรับการค้นหาอย่างไร และป้องกัน SQL Injection ได้อย่างไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบทักษะการเขียน Dynamic Query และความปลอดภัยของฐานข้อมูล
* **💡 แนวทางการตอบ (Model Answer):**
  > "ใน Endpoint นี้เรารองรับ Query Parameters 2 ตัว คือ `category_id` และ `search` ครับ
  > เราใช้เทคนิค **Dynamic Query Construction ร่วมกับ Parameterized Query (Prepared Statements)**:
  > ```javascript
  > const params = [];
  > const conditions = [];
  > if (category_id) {
  >   conditions.push("recipes.category_id = ?");
  >   params.push(category_id);
  > }
  > if (search) {
  >   conditions.push("recipes.name LIKE ?");
  >   params.push(`%${search}%`);
  > }
  > if (conditions.length > 0) {
  >   sql += " WHERE " + conditions.join(" AND ");
  > }
  > const [rows] = await pool.query(sql, params);
  > ```
  > **การป้องกัน SQL Injection:** เราจะไม่นำตัวแปรจาก User ไปต่อ String ในคำสั่ง SQL โดยตรง (`String Concatenation`) เด็ดขาด แต่จะใช้เครื่องหมาย Placeholder `?` และส่ง Array `params` ไปให้ไดรเวอร์ MySQL ทำการ Escape และ Compile คำสั่งแยกต่างหาก ทำให้แม้ผู้ใช้พยายามส่งค่าเช่น `' OR '1'='1` เข้ามา ฐานข้อมูลก็จะมองว่าเป็นเพียงข้อความธรรมดา ไม่ใช่คำสั่ง SQL ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Parameterized Query, Prepared Statements, Placeholders (`?`), SQL Injection Prevention, Dynamic WHERE Clause

---

### Q3.3: ใน Route Parameter เช่น `GET /api/v1/recipes/:id` แตกต่างกับ Query Parameter อย่างไร ในโปรเจกต์นี้เลือกใช้อย่างไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความเข้าใจหลักการออกแบบ RESTful API URL Naming Convention
* **💡 แนวทางการตอบ (Model Answer):**
  > "- **Path/Route Parameter (`/recipes/:id`):** ใช้เพื่อระบุตัวตนของทรัพยากรที่เจาะจง (Unique Resource Identifier) เช่น สูตรอาหารหมายเลข 1 หรือ รีวิวหมายเลข 5
  > - **Query Parameter (`/recipes?category_id=1&search=ผัด`):** ใช้สำหรับการกรอง (Filtering), ค้นหา (Searching), จัดเรียง (Sorting), หรือแบ่งหน้า (Pagination) บนทรัพยากรกลุ่มเดียวกัน
  > 
  > ในโปรเจกต์นี้ เราปฏิบัติตามมาตรฐาน REST โดยทรัพยากรเดี่ยวจะใช้ Path Variable ผ่าน `req.params.id` และการค้นหาแบบมีเงื่อนไขจะรับผ่าน `req.query` ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** RESTful URI Design, Path Parameter (Resource Identity), Query Parameter (Filter/Search/Sort)

---

### Q3.4: สังเกตท้ายไฟล์ `src/index.js` มีโค้ด `if (require.main === module)` ทำไมต้องมีเงื่อนไขนี้ และทำไมถึงต้อง `module.exports = app`?
* **🎯 เจตนาของอาจารย์:** วัดความเข้าใจด้านสถาปัตยกรรมระดับโมดูลแล�### Q7.1: ทำไมไฟล์ `db.js` ถึงวางไว้ที่ Root นอกโฟลเดอร์ `src/` และใน `src/index.js` เรียกใช้งานอย่างไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบว่านิสิตเข้าใจโครงสร้างโปรเจกต์และการนำเข้าโมดูล (Module Resolution)
* **💡 แนวทางการตอบ (Model Answer):**
  > "ตามข้อกำหนดของโครงงานระบุให้วาง `db.js` ไว้ที่ Root ไดเรกทอรีคู่กับ `package.json` และไฟล์ Configuration อื่น ๆ เพื่อเป็นศูนย์กลางการเชื่อมต่อฐานข้อมูลของระบบครับ
  > 
  > และเนื่องจากโค้ดของ Express Server อยู่ภายในโฟลเดอร์ `src/index.js` เราจึงเรียกใช้งานผ่านคำสั่ง:
  > ```javascript
  > const pool = require("../db");
  > ```
  > ซึ่งเป็นการอ้างอิงพาธสัมพัทธ์ (Relative Path) ถอยกลับออกไป 1 ระดับ (`..`) เพื่อดึง Connection Pool มาใช้งานอย่างถูกต้อง ชัดเจน และเป็นไปตามโครงสร้างที่ส่งงานครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Project Structure Compliance, Module Resolution, Relative Path (`../db`), Clean Architecture

---

### Q7.2: ในรายงาน `coverage-report.md` มีการบันทึกว่า `db.js` ได้ Branch Coverage ครบ 100% เต็ม มีวิธีการทดสอบอย่างไร?
* **🎯 เจตนาของอาจารย์:** ทดสอบความรู้เรื่องการทดสอบความครอบคลุม (Coverage) และ Node.js Module Caching
* **💡 แนวทางการตอบ (Model Answer):**
  > "ในขั้นตอนการรัน Baseline Coverage เราได้จำลอง 2 สภาวะแวดล้อม:
  > 1. กรณีที่ **ไม่มี** ตัวแปร `.env` เพื่อตรวจดูว่าระบบสลับไปใช้ค่า Default สำรอง (`localhost`, `root`, `recipe_db`) ถูกต้องหรือไม่
  > 2. กรณีที่ **มี** ตัวแปร `.env` เพื่อตรวจดูว่าระบบอ่านค่าจากตัวแปรสภาพแวดล้อมถูกต้องหรือไม่
  > 
  > และเนื่องจาก Node.js มีระบบ Module Caching (`require.cache`) ซึ่งจะจำค่าเดิมไว้ เราจึงใช้คำสั่ง `delete require.cache[dbPath]` ระหว่างการทดสอบทั้งสองกรณี เพื่อบังคับให้โหลดโมดูลใหม่ ทำให้ทดสอบครบทั้งกิ่งซ้ายและกิ่งขวาของตัวดำเนินการ `||` ส่งผลให้ Branch Coverage ของ `db.js` ได้คะแนนเต็ม 100% ตามรายงานครับ"e ระบบของคุณเชื่อมกับอะไร และมีกลไกอย่างไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความเข้าใจเรื่อง Distributed Systems และ Fall Tolerance
* **💡 แนวทางการตอบ (Model Answer):**
  > "ระบบของเราผสานการทำงานกับ External API ของ DummyJSON เพื่อดึงข้อมูลโภชนาการ (แคลอรี่) ผ่านฟังก์ชัน `getNutritionInfo(recipeName)` ในไฟล์ `src/services/external-api.js` ครับ
  > 
  > เนื่องจากบริการภายนอกเป็นสิ่งที่เราควบคุมไม่ได้ อาจเกิดความล่าช้า ขัดข้อง หรือเครือข่ายหลุด เราจึงออกแบบกลไกความทนทาน (Resilience Pattern) ไว้ 3 ขั้นตอน:
  > 1. **Timeout (การกำหนดเวลาตัดคำขอ):** ตั้งค่า `timeout: 3000` (3 วินาที) ของ `axios` เพื่อป้องกันไม่ให้เซิร์ฟเวอร์เราต้องรอนานจนทรัพยากรระบบถูกแขวน
  > 2. **Retry with Delay (การลองใหม่เป็นระยะ):** หากเกิดข้อผิดพลาด ระบบจะลองเรียกใหม่สูงสุด 2 ครั้ง (รวมครั้งแรกเป็น 3 ครั้ง) โดยมีการหน่วงเวลา 2 วินาที (`await delay(2000)`) ก่อนลองใหม่ เพื่อให้เวลาระบบปลายทางฟื้นตัว
  > 3. **Fallback Data (ข้อมูลสำรองฉุกเฉิน):** หากลองครบ 3 ครั้งแล้วยังล้มเหลว ระบบจะไม่พังและไม่โยน Error 500 ใส่หน้าผู้ใช้ แต่จะส่ง Object ข้อมูลสำรอง `{ source: 'fallback', calories: 'N/A', message: '...' }` กลับไปแทน ทำให้ระบบยังให้บริการต่อไปได้อย่างราบรื่น (Graceful Degradation) ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Resilience Patterns, Timeout, Retry with Delay, Fallback, Graceful Degradation, Distributed System Fault Tolerance

---

### Q4.2: คุณได้ทดสอบ Failure Scenario หรือไม่ แล้วระบบมีพฤติกรรมอย่างไรเมื่อเกิดปัญหาจริง?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบว่านิสิตทำการทดลองจริงตามเอกสาร `failure-scenario-results.md` หรือไม่
* **💡 แนวทางการตอบ (Model Answer):**
  > "เราได้จำลองสถานการณ์ความผิดพลาดไว้ 2 รูปแบบ และบันทึกผลไว้ในไฟล์ `failure-scenario-results.md`:
  > 1. **สถานการณ์ Network Error / Timeout:** จำลองโดยเปลี่ยน URL ไปยังโดเมนที่ไม่มีอยู่จริง ผลการทดสอบพบว่าเซิร์ฟเวอร์เกิดข้อผิดพลาด `ENOTFOUND` และระบบจะวนลูปพยายามเชื่อมต่อใหม่ Attempt 1, 2, 3 โดยรอ 2 วินาทีระหว่างรอบ เมื่อครบ 3 ครั้งจะแจ้งเตือน `All retries failed. Using Fallback data.` และส่งข้อมูล Fallback กลับไป
  > 2. **สถานการณ์ External API ล่ม (HTTP 500):** จำลองโดยเรียกไปยัง `https://httpstat.us/500` ผลปรากฏว่าระบบจับข้อผิดพลาด `Request failed with status code 500` ทำการ Retry ครบตามจำนวน และตัดเข้า Fallback ได้อย่างถูกต้อง
  > ทั้งสองกรณี ฝั่ง Client ได้รับ Status 200 พร้อมข้อความแจ้งเตือนที่ชัดเจน หน้าเว็บไม่ค้างและไม่พังครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Network Timeout, 500 Internal Error Simulation, Console Trace, Graceful Recovery

---

### Q4.3: ทำไมในลูป Retry ถึงต้องรอ 2 วินาที ทำไมไม่ให้มัน Retry ทันที (Immediate Retry)?
* **🎯 เจตนาของอาจารย์:** วัดความเข้าใจเรื่อง Thundering Herd Problem และ Exponential Backoff
* **💡 แนวทางการตอบ (Model Answer):**
  > "การยิงคำขอซ้ำทันทีโดยไม่หน่วงเวลา (Immediate Retry) มีข้อเสียร้ายแรง 2 ประการครับ:
  > 1. ถ้าเซิร์ฟเวอร์ปลายทางกำลังทำงานหนักหรือล่มชั่วคราว การยิงซ้ำรัว ๆ จะยิ่งไปเพิ่มภาระให้เซิร์ฟเวอร์ปลายทางพังหนักกว่าเดิม เสมือนการทำ Denial of Service (DoS) ใส่เขา
  > 2. โอกาสที่จะสำเร็จแทบเป็นศูนย์เพราะปัญหายังไม่ทันได้รับการแก้ไข
  > 
  > การหน่วงเวลา 2 วินาทีจึงเป็นการเปิดโอกาสให้เครือข่ายหรือเซิร์ฟเวอร์ปลายทางมีเวลาฟื้นตัว และในระบบระดับองค์กรขนาดใหญ่ นิยมพัฒนาต่อยอดเป็น **Exponential Backoff with Jitter** (เช่น รอ 1s, 2s, 4s พร้อมสุ่มเวลา) เพื่อป้องกันไม่ให้คำขอจากไคลเอนต์หลายหมื่นเครื่องยิงชนพร้อมกันครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Immediate Retry pitfalls, DoS / Thundering Herd, Backoff Strategy, System Recovery Window

---

## หมวดที่ 5: การทดสอบซอฟต์แวร์และการวัดความครอบคลุม

### Q5.1: ทำไมถึงเลือกใช้ `node:test` แทนที่จะใช้ Jest หรือ Mocha?
* **🎯 เจตนาของอาจารย์:** วัดความเข้าใจด้าน Tooling และแนวโน้มสมัยใหม่ของ Node.js Ecosystem
* **💡 แนวทางการตอบ (Model Answer):**
  > "`node:test` เป็น **Native Built-in Test Runner** ที่ติดมาพร้อมกับ Node.js ตั้งแต่เวอร์ชัน 18+ ครับ สาเหตุที่เราเลือกใช้:
  > 1. **Zero External Dependency:** ไม่ต้องติดตั้งแพ็กเกจหนัก ๆ อย่าง Jest, Babel, หรือ ts-jest ซึ่งช่วยลดขนาดโฟลเดอร์ `node_modules` และลดช่องโหว่ความปลอดภัย (Supply Chain Vulnerability)
  > 2. **High Performance & Fast Execution:** ทำงานได้รวดเร็วมากเพราะรันบน V8 Engine โดยตรง
  > 3. **Native Coverage & Mocking:** มีระบบ Mocking ในตัว (`t.mock.method`) และมีระบบวัด Code Coverage มาให้พร้อมผ่านแฟล็ก `--experimental-test-coverage` โดยไม่ต้องลง `nyc` หรือ `istanbul` เพิ่มเติมครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Built-in Test Runner, Zero Dependencies, Attack Surface Reduction, Native Mocking, Performance

---

### Q5.2: ใน `tests/api.test.js` มีการทดสอบที่ชื่อว่า "Swagger/Code Match" มันคืออะไร และมีประโยชน์อย่างไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบว่านิสิตเข้าใจการทำ Contract Testing และ API Drift หรือไม่
* **💡 แนวทางการตอบ (Model Answer):**
  > "การทดสอบ Swagger/Code Match เป็นการทำ **Contract Verification (การตรวจสอบสัญญาข้อตกลงของ API)** ครับ
  > 
  > ปัญหาคลาสสิกของนักพัฒนาคือ 'เอกสารไม่ตรงกับโค้ดจริง' (API Documentation Drift) เช่น ใน Swagger มีบอกไว้แต่ลืมเขียนโค้ด หรือเขียนโค้ดเพิ่มใน Express แต่ลืมมาอัปเดต Swagger
  > 
  > โค้ดทดสอบนี้จะ:
  > 1. อ่านไฟล์ `openapi.yaml` แล้วดึงรายการ Path และ Method ทั้งหมดออกมาเก็บใน Set
  > 2. เข้าไปอ่าน Router Stack ของ Express (`app._router.stack`) เพื่อดึง Route ที่ทำงานจริงออกมา
  > 3. นำ Set ทั้งสองมาเปรียบเทียบกันด้วย `assert.deepEqual()`
  > 
  > ทำให้มั่นใจได้ 100% ว่าทุก Endpoint ที่เขียนในเอกสารมีอยู่จริงในโค้ด และไม่มี Endpoint เถื่อนในโค้ดที่ไม่ได้ทำเอกสารครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** API Documentation Drift, Contract Testing, Express Router Stack Introspection, Schema vs Code Parity

---

### Q5.3: ผลการทดสอบ Coverage ได้เท่าไหร่? ทำไมตัวเลขถึงไม่เป็น 100% จุดที่ยังไม่ครอบคลุมคืออะไรและมีความเสี่ยงหรือไม่?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความซื่อสัตย์และการวิเคราะห์ความเสี่ยงเชิงลึก (ตามเอกสาร `coverage-report.md`)
* **💡 แนวทางการตอบ (Model Answer):**
  > "ผลการรัน Test Coverage จริงของโปรเจกต์เราได้ตัวเลขสูงตามเกณฑ์มาตรฐาน:
  > - **Line Coverage:** 90.82%
  > - **Branch Coverage:** 77.94%
  > - **Function Coverage:** 93.33%
  > - **จำนวน Test ผ่าน:** 28 จาก 28 การทดสอบ
  > 
  > **เหตุผลที่ยังไม่ 100% และการวิเคราะห์ความเสี่ยง:**
  > 1. **บล็อก `catch (error)` ที่ส่ง HTTP 500 ใน `src/index.js`:** เป็นส่วนที่ดักจับกรณีโครงสร้างพื้นฐานระดับฮาร์ดแวร์หรือฐานข้อมูลดับกะทันหัน ซึ่งในการทดสอบแบบ Integration ปกติ Database เราทำงานสมบูรณ์จึงไม่ได้วิ่งเข้า catch นี้ **ความเสี่ยงต่ำ** เพราะตรรกะใน catch ทำหน้าที่เพียงบันทึก log และส่งมาตรฐาน 500
  > 2. **บล็อก `app.listen`:** ไม่ถูกรันขณะทดสอบเพราะเรา import `app` ไปรันบน Dynamic Port **ความเสี่ยงต่ำมาก**
  > 3. **Fallback แคลอรี่ `|| 300` ใน `external-api.js`:** จะทำงานเมื่อ API คืนข้อมูลสูตรแต่ไม่มีตัวเลขแคลอรี่ ซึ่งข้อมูล Mock ของเราใส่แคลอรี่มาครบ
  > 
  > ทั้งหมดนี้มีแนวทางปรับปรุงในอนาคตโดยการเขียน Mock ให้ `pool.query` จำลองการ Throw Error เพื่อดันตัวเลขเข้าสู่ 100% ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Coverage Metrics (Line/Branch/Function), Catch block infrastructure exception, Risk Assessment, Mocking DB Exceptions

---

## หมวดที่ 6: ความปลอดภัยและการขยายระบบสู่ Production

### Q6.1: โปรเจกต์นี้จัดการกับความลับ (Secrets / Sensitive Data) อย่างไร? ทำไมต้องมีทั้ง `.env` และ `.env.example`?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความเข้าใจเรื่อง 12-Factor App Methodology และ Secret Management
* **💡 แนวทางการตอบ (Model Answer):**
  > "เราปฏิบัติตามหลักการ **The Twelve-Factor App (Config in Environment)** ครับ:
  > 1. **ไฟล์ `.env`:** เก็บค่าคอนฟิกจริง เช่น รหัสผ่านฐานข้อมูล (`DB_PASSWORD`) และพอร์ต (`PORT`) ซึ่งไฟล์นี้จะถูกระบุไว้ใน `.gitignore` เสมอ เพื่อห้ามไม่ให้ push ขึ้น Git Repository โดยเด็ดขาด ป้องกันข้อมูลรั่วไหลสู่สาธารณะ
  > 2. **ไฟล์ `.env.example`:** ทำหน้าที่เป็นแบบฟอร์มเปล่า (Template) ที่มีแต่ชื่อตัวแปรและค่าสมมุติ เพื่อให้ผู้ร่วมทีมหรือผู้ตรวจข้อสอบรู้ว่าโปรเจกต์นี้จำเป็นต้องตั้งค่าตัวแปรอะไรบ้าง แล้วใช้คำสั่งคัดลอกไปเป็น `.env` ของเครื่องตัวเองครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** 12-Factor App, Environment Variables, `.gitignore`, Credential Leak Prevention, Configuration Template

---

### Q6.2: ถ้าระบบนี้ต้องนำไปใช้งานจริง (Production) มีคนเข้าใช้งานพร้อมกัน 100,000 คนต่อนาที คุณจะปรับปรุงสถาปัตยกรรมนี้อย่างไร?
* **🎯 เจตนาของอาจารย์:** ทดสอบมุมมองด้าน System Scalability และ High Availability
* **💡 แนวทางการตอบ (Model Answer):**
  > "หากต้องการสเกลระบบสู่ระดับ 100,000 Concurrent Requests เราต้องปรับปรุง 4 ด้านหลักครับ:
  > 1. **Caching Layer (Redis):** ข้อมูลสูตรอาหารและหมวดหมู่เป็นข้อมูลที่มีการอ่านมากกว่าการเขียน (Read-Heavy) เราสามารถนำ Redis มาทำเป็น Cache ขั้นหน้าระหว่าง API กับ Database เพื่อให้ดึงข้อมูลจาก RAM ได้ในระดับ Millisecond ช่วยลดโหลดของ MySQL ได้กว่า 80%
  > 2. **Horizontal Scaling & Load Balancing:** รันแอปพลิเคชัน Node.js หลาย ๆ อินสแตนซ์ผ่าน Docker Container หรือ Kubernetes โดยมี NGINX หรือ Cloud Load Balancer ช่วยกระจายทราฟฟิก
  > 3. **Database Replication (Read Replica):** แยกฐานข้อมูลเป็น Master (สำหรับรับคำสั่ง INSERT/UPDATE/DELETE) และ Slave/Read Replica หลาย ๆ ตัวสำหรับรองรับคำสั่ง SELECT
  > 4. **Rate Limiting & Security:** ติดตั้ง `express-rate-limit` เพื่อป้องกันการยิง API ถล่มแบบ Brute Force หรือ DDoS และเพิ่มระบบ Authentication ด้วย JWT หรือ OAuth 2.0 ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Redis Cache, Read-Heavy Optimization, Horizontal Scaling, Containerization (Docker), Load Balancer, Database Read Replica, Rate Limiting

---

## หมวดที่ 7: คำถามเจาะโค้ดและคำถามจับไต๋ (Tricky Questions)

### Q7.1: ทำไมถึงมีไฟล์ `db.js` อยู่ 2 ที่ (ที่ root โฟลเดอร์หนึ่งไฟล์ และใน `src/` อีกหนึ่งไฟล์) และโค้ดใน `src/index.js` บรรทัดที่ 5-7 เขียนเช็กเพื่ออะไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบว่านิสิตรู้โครงสร้างจริงของโค้ด หรือจำสับสน
* **💡 แนวทางการตอบ (Model Answer):**
  > "ในโค้ด `src/index.js` เราเขียนป้องกันความผิดพลาดเรื่องพาธของไฟล์ไว้ครับ:
  > ```javascript
  > const pool = fs.existsSync(path.join(__dirname, "db.js"))
  >   ? require("./db")
  >   : require(path.join(__dirname, "..", "db"));
  > ```
  > โค้ดนี้เขียนขึ้นเพื่อความเข้ากันได้ย้อนหลัง (Backward Compatibility) และความยืดหยุ่นในการรันครับ เพราะในโครงงานระยะก่อนหน้านี้ บางครั้งโครงสร้างโฟลเดอร์อาจวาง `db.js` ไว้ที่ Root แต่ในโครงงานระยะที่ 3 นี้เราจัดระเบียบใหม่โดยนำซอร์สโค้ดทั้งหมดมาไว้ในโฟลเดอร์ `src/` 
  > 
  > การเขียนแบบนี้ทำให้ไม่ว่าโค้ดจะถูกรันจากโฟลเดอร์แม่ หรือถูกย้ายโฟลเดอร์ ก็สามารถค้นหาไฟล์เชื่อมต่อฐานข้อมูลได้ถูกต้องเสมอโดยไม่เกิดปัญหา `MODULE_NOT_FOUND` ครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Backward Compatibility, Path Resolution, Dynamic Require, Robustness

---

### Q7.2: ในไฟล์ `tests/db.test.js` สังเกตเห็นคำสั่ง `delete require.cache[dbPath]` คำสั่งนี้มีไว้ทำไม ถ้าไม่ใส่จะเกิดอะไรขึ้น?
* **🎯 เจตนาของอาจารย์:** ทดสอบความรู้เรื่อง Node.js Module Caching System
* **💡 แนวทางการตอบ (Model Answer):**
  > "Node.js มีระบบ Module Caching ที่มีประสิทธิภาพสูงครับ เมื่อเราสั่ง `require()` โมดูลใดไปแล้วครั้งหนึ่ง Node.js จะเก็บผลลัพธ์ไว้ในหน่วยความจำ (`require.cache`) เพื่อที่การเรียกครั้งต่อไปจะได้ไม่ต้องอ่านและประมวลผลไฟล์ซ้ำ
  > 
  > แต่ในกรณีของ `tests/db.test.js` เราต้องการทดสอบ 2 กรณี:
  > 1. กรณีที่ **ไม่มี** ตัวแปร `.env` เพื่อตรวจดูว่าระบบใช้ค่า Default สำรอง (`localhost`, `root`) ถูกต้องหรือไม่
  > 2. กรณีที่ **มี** ตัวแปร `.env` เพื่อตรวจดูว่าระบบอ่านค่าจากตัวแปรแวดล้อมถูกต้องหรือไม่
  > 
  > หากเราไม่สั่งลบ `delete require.cache[dbPath]` การเรียก `require('../src/db')` ในรอบที่สองจะไม่ยอมอ่านตัวแปร `.env` ใหม่ แต่จะหยิบค่าเก่าที่แคชไว้มาใช้ ทำให้เราไม่สามารถทดสอบทั้ง 2 กิ่งเงื่อนไข (Branches) ได้จริงครับ การเคลียร์แคชจึงทำให้เราวัด Branch Coverage ของ `db.js` ได้ครบ 100% เต็มครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Node.js Module Caching, `require.cache`, Cache Invalidation, Branch Coverage 100% Testing

---

### Q7.3: ถ้าผู้ใช้ยิงคำสั่ง `DELETE /api/v1/recipes/1` แต่สูตรอาหารนี้มีรีวิวค้างอยู่ 10 ข้อความ จะเกิด Error หรือไม่ และรีวิวเหล่านั้นจะหายไปหรือไม่ เพราะอะไร?
* **🎯 เจตนาของอาจารย์:** ตรวจสอบความแม่นยำเรื่อง Database Cascade Constraints
* **💡 แนวทางการตอบ (Model Answer):**
  > "จะไม่เกิด Error ครับ และจะตอบกลับ HTTP 200 OK สำเร็จ 
  > 
  > และรีวิวทั้ง 10 ข้อความที่เกี่ยวข้องกับสูตรอาหาร ID 1 จะ **ถูกลบออกจากตาราง `reviews` โดยอัตโนมัติ** ในทันทีครับ
  > 
  > เหตุผลเพราะ ในขั้นตอนการสร้างตาราง `reviews` ในไฟล์ `schema.sql` เราได้กำหนด Foreign Key ไว้ว่า:
  > ```sql
  > FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
  > ```
  > คุณสมบัติ `ON DELETE CASCADE` ของ MySQL Engine จะเป็นผู้จัดการล้างข้อมูลในตารางลูก (Child Table) ที่อ้างอิงถึง Key หลักในตารางแม่ (Parent Table) ให้เองอย่างสมบูรณ์แบบในระดับ Transaction ของฐานข้อมูลครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Foreign Key Constraint, `ON DELETE CASCADE`, Child Records Cleanup, Transactional Consistency

---

### Q7.4: สมมุติว่า External API เกิดล่มอย่างกะทันหันขณะที่มีผู้ใช้กดดูข้อมูลโภชนาการที่หน้าเว็บ ผู้ใช้จะเห็นหน้าจอว่างเปล่า หรือเกิด Error ตัวแดงขึ้นมาหรือไม่?
* **🎯 เจตนาของอาจารย์:** วัดความเข้าใจเรื่อง Frontend Exception Handling และ Graceful Degradation
* **💡 แนวทางการตอบ (Model Answer):**
  > "ผู้ใช้จะไม่เจอหน้าจอว่างเปล่า และจะไม่เจอกับหน้าเว็บแฮงก์ครับ
  > 
  > เพราะระบบเรารองรับทั้งสองฝั่ง:
  > 1. **ฝั่ง Backend (`src/services/external-api.js`):** เมื่อ Retry ล้มเหลวครบ 3 ครั้ง จะคืนค่า Object สถานะ Fallback กลับมา โดยยังคงตอบ HTTP 200 OK ให้แก่เบราว์เซอร์
  > 2. **ฝั่ง Frontend (`frontend/app.js`):** มีฟังก์ชันตรวจสอบฟิลด์ `source` ถ้าพบว่าเป็น `fallback` หน้าเว็บจะแสดงกล่องแจ้งเตือนสีส้มอย่างสุภาพว่า *'ไม่สามารถดึงข้อมูลโภชนาการได้ในขณะนี้ (External API is down)'* และแสดงตัวเลขแคลอรี่เป็น *'N/A'* พร้อมทั้งมีปุ่ม **ลองใหม่อีกครั้ง (Retry)** ให้ผู้ใช้กดเพื่อพยายามโหลดใหม่ได้ด้วยตัวเองครับ"
* **🔑 คีย์เวิร์ดสำคัญ:** Graceful Degradation, User Experience (UX), Status Handling, Explicit Fallback Feedback

---

## 💡 สรุปเทคนิคการนำเสนอให้ได้คะแนนระดับ A+
1. **พูดด้วยความมั่นใจและใช้คำศัพท์สากล:** ใช้คำเช่น *RESTful, Middleware, Connection Pool, Graceful Degradation, Contract Parity* เพื่อแสดงถึงความเป็นมืออาชีพ
2. **ชี้จุดเชื่อมโยงไปยังไฟล์จริง:** เมื่ออาจารย์ถามเรื่องใด ให้บอกชื่อไฟล์และโฟลเดอร์เสมอ เช่น *"เรื่องนี้สามารถดูได้ในไฟล์ `src/services/external-api.js` ครับ"*
3. **เปิดหน้าจอ Demonstration ประกอบ:** แสดงทั้งหน้าเว็บ `http://localhost:3000/`, หน้า Swagger UI `http://localhost:3000/api-docs`, และผลการรันคำสั่ง `npm run test:coverage`
