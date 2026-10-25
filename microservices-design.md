# ออกแบบสถาปัตยกรรม Microservices ของระบบข้อมูลสูตรอาหาร (Recipe Information System)

**รหัสนิสิต:** 67160193  
**หัวข้อโครงงาน:** Pno 4 — ระบบข้อมูลสูตรอาหาร (Recipe Information System)  
**วิชา:** การพัฒนาบริการส่วนหลัง (Backend Services Development) — สัปดาห์ที่ 13  

---

## 1. การแบ่งบริการตามแนวคิด Bounded Context

การแบ่งระบบเดิม (Monolithic จากโครงงานระยะที่ 1 และ 2) ออกเป็นบริการย่อยแบบ Microservices ยึดตามหลักการ **Bounded Context** จากแนวคิด Domain-Driven Design (DDD) โดยแบ่งตามขอบเขตความรับผิดชอบทางธุรกิจ (Business Capability) ไม่ได้แบ่งตามชั้นทางเทคนิค (Technical Layer เช่น Database, API, Controller) และออกแบบให้แต่ละบริการเป็นอิสระต่อกัน (Autonomous Service) มีฐานข้อมูลแยกเป็นของตนเอง (Database-per-Service Pattern) เพื่อลดการผูกติด (Loose Coupling)

โดยระบบแบ่งออกเป็น **3 บริการย่อยหลักทางธุรกิจ** และ **1 บริการสนับสนุนการแจ้งเตือน** ดังนี้ (ไม่นับรวม API Gateway ซึ่งทำหน้าที่เป็น Entry Point ฝั่ง Infrastructure):

| บริการ (Microservice) | Bounded Context (ขอบเขตธุรกิจ) | ความรับผิดชอบหลัก (Responsibilities) | ฐานข้อมูลเฉพาะบริการ | Endpoint หลัก |
| :--- | :--- | :--- | :--- | :--- |
| **1. Recipe Catalog Service** | **Recipe & Catalog Context**<br>(การจัดการข้อมูลสูตรอาหารและหมวดหมู่) | - จัดการข้อมูลสูตรอาหาร (CRUD Recipes)<br>- จัดการหมวดหมู่อาหาร (Categories)<br>- ค้นหาและกรองสูตรอาหารตามหมวดหมู่ คำค้นหา หรือเวลาปรุง<br>- ดูแลข้อมูลวัตถุดิบและขั้นตอนการทำ | `recipe_db`<br>(ตาราง `recipes`, `categories`) | - `GET /recipes`<br>- `GET /recipes/:id`<br>- `POST /recipes`<br>- `PUT /recipes/:id`<br>- `DELETE /recipes/:id`<br>- `GET /categories` |
| **2. Review & Rating Service** | **Social & User Feedback Context**<br>(การมีส่วนร่วมของชุมชนและคะแนนความนิยม) | - จัดการความคิดเห็น (Comments) และการให้คะแนน (Rating 1-5 ดาว)<br>- คำนวณคะแนนเฉลี่ย (Average Rating) และสถิติจำนวนรีวิวของแต่ละสูตร<br>- รับมือกับการลบสูตรอาหารเพื่อล้างข้อมูลรีวิวที่เกี่ยวข้อง<br>- ตรวจสอบความถูกต้องของสิทธิ์และผู้รีวิว | `review_db`<br>(ตาราง `reviews`) | - `GET /recipes/:id/reviews`<br>- `POST /recipes/:id/reviews`<br>- `GET /reviews/:id`<br>- `DELETE /reviews/:id`<br>- `GET /recipes/:id/rating-summary` |
| **3. Nutrition & Enrichment Service** | **Health & Nutrition Context**<br>(การวิเคราะห์โภชนาการและสารอาหาร) | - วิเคราะห์และคำนวณคุณค่าทางโภชนาการ (Calories, Macronutrients)<br>- เชื่อมต่อกับ External Nutrition API เพื่อดึงข้อมูลสารอาหารอัตโนมัติ<br>- จัดการระบบแคช (Cache) ข้อมูลโภชนาการเพื่อลดภาระการเรียกภายนอก<br>- จัดการ Resilience (Retry/Timeout/Fallback) เมื่อ API ภายนอกขัดข้อง | `nutrition_db`<br>(ตาราง `nutrition_cache`) | - `GET /recipes/:id/nutrition`<br>- `POST /recipes/:id/nutrition/enrich`<br>- `POST /nutrition/calculate` |
| **4. Notification Service** *(บริการเสริม)* | **Notification & Messaging Context**<br>(การสื่อสารและแจ้งเตือนผู้ใช้) | - ส่งการแจ้งเตือน (Email/Notification) ให้เจ้าของสูตรเมื่อมีผู้ใช้มารีวิว<br>- ประมวลผลแบบ Asynchronous Event-Driven เพื่อไม่ให้กระทบเวลาตอบสนองของระบบหลัก | `notification_db`<br>(ตาราง `notification_logs`) | - `POST /notifications/send`<br>- `GET /users/:id/notifications` |

> **หมายเหตุเกี่ยวกับ API Gateway:**  
> API Gateway รันที่พอร์ต `3000` ทำหน้าที่เป็นจุดเข้าถึงเดียว (Single Entry Point) สำหรับ Client ภายนอก โดยรับผิดชอบงานส่วนกลาง (Cross-Cutting Concerns) ได้แก่ Routing, Centralized Authentication (ตรวจสอบ JWT), Rate Limiting และ Centralized Logging ไม่ได้นับเป็นบริการย่อยตามหลัก Bounded Context

---

## 2. แผนภาพสถาปัตยกรรม (Architecture Diagram)

แผนภาพแสดงสถาปัตยกรรม Microservices ของระบบข้อมูลสูตรอาหาร แสดงตำแหน่งของ **API Gateway**, บริการย่อยแต่ละบริการที่มีฐานข้อมูลแยกอิสระจากกัน, จุดเชื่อมต่อ External Nutrition API รวมถึงการใช้ Message Broker สำหรับการสื่อสารแบบ Asynchronous

```mermaid
flowchart TB
    subgraph Clients["ผู้ใช้งานภายนอก (Clients)"]
        WebClient["Web Browser / Mobile App / Postman"]
    end

    subgraph EntryPoint["จุดเข้าถึงระบบส่วนกลาง (Single Entry Point)"]
        Gateway["API Gateway (Port 3000)<br>• Reverse Proxy & Routing<br>• Centralized Authentication (JWT)<br>• Global Rate Limiting<br>• Request Logging & Monitoring<br>• Circuit Breaker / Fallback"]
    end

    subgraph CoreServices["บริการย่อยตามขอบเขตธุรกิจ (Microservices - Bounded Contexts)"]
        direction TB

        subgraph Service1["Recipe Catalog Service (Port 4001)"]
            RecipeSvc["Recipe Service<br>(CRUD สูตรอาหาร & หมวดหมู่)"]
            RecipeDB[("recipe_db<br>• recipes<br>• categories")]
            RecipeSvc --- RecipeDB
        end

        subgraph Service2["Review & Rating Service (Port 4002)"]
            ReviewSvc["Review Service<br>(คอมเมนต์ & คะแนน 1-5 ดาว)"]
            ReviewDB[("review_db<br>• reviews")]
            ReviewSvc --- ReviewDB
        end

        subgraph Service3["Nutrition & Enrichment Service (Port 4003)"]
            NutritionSvc["Nutrition Service<br>(แคลอรี่ & ข้อมูลโภชนาการ)"]
            NutritionDB[("nutrition_db<br>• nutrition_cache")]
            NutritionSvc --- NutritionDB
        end

        subgraph Service4["Notification Service (Port 4004)"]
            NotiSvc["Notification Service<br>(ส่งอีเมล & แจ้งเตือนผู้ใช้)"]
            NotiDB[("notification_db<br>• notification_logs")]
            NotiSvc --- NotiDB
        end
    end

    subgraph External["ระบบภายนอก (External Systems)"]
        Broker["Message Broker<br>(RabbitMQ / Redis PubSub)<br>Event Bus สำหรับ Asynchronous"]
        ExternalAPI["External Nutrition API<br>(Third-Party / DummyJSON)"]
    end

    %% ทิศทางการเรียกคำขอ (Request Flows)
    WebClient -->|HTTP / REST| Gateway

    %% Gateway ส่งต่อไปยัง Services
    Gateway -->|HTTP GET/POST /recipes| RecipeSvc
    Gateway -->|HTTP GET/POST /reviews| ReviewSvc
    Gateway -->|HTTP GET /nutrition| NutritionSvc

    %% Service-to-Service Synchronous
    ReviewSvc -.->|1. HTTP GET ตรวจสอบว่า Recipe มีจริง| RecipeSvc
    NutritionSvc -.->|2. HTTP GET ดึงชื่อและวัตถุดิบสูตร| RecipeSvc
    NutritionSvc -->|3. HTTP GET ดึงข้อมูลแคลอรี่ (Retry/Timeout/Fallback)| ExternalAPI

    %% Service-to-Service Asynchronous (Event-Driven)
    RecipeSvc ==>|Publish: 'RecipeDeleted'| Broker
    ReviewSvc ==>|Publish: 'ReviewCreated'| Broker
    Broker ==>|Subscribe: ลบรีวิวของสูตรที่ถูกลบ| ReviewSvc
    Broker ==>|Subscribe: แจ้งเตือนเจ้าของสูตร| NotiSvc

    %% สไตล์และสี
    style Gateway fill:#f9f0ff,stroke:#6b21a8,stroke-width:2px
    style RecipeSvc fill:#e0f2fe,stroke:#0369a1,stroke-width:2px
    style ReviewSvc fill:#fef3c7,stroke:#b45309,stroke-width:2px
    style NutritionSvc fill:#dcfce7,stroke:#15803d,stroke-width:2px
    style NotiSvc fill:#fce7f3,stroke:#be185d,stroke-width:2px
    style Broker fill:#ffedd5,stroke:#c2410c,stroke-width:2px
    style ExternalAPI fill:#f1f5f9,stroke:#475569,stroke-width:2px
```

---

## 3. รูปแบบการสื่อสารระหว่างบริการ (Inter-Service Communication)

ในระบบ Microservices การเลือกรูปแบบการสื่อสาร (Synchronous หรือ Asynchronous) ต้องพิจารณาจากความต้องการของกระบวนการทางธุรกิจ ว่าผู้เรียกต้องการผลลัพธ์ทันทีเพื่อตัดสินใจขั้นถัดไป (Blocking) หรือสามารถส่งงานเข้าคิวประมวลผลเบื้องหลังได้ (Non-blocking / Decoupled)

| คู่การสื่อสาร (จาก &rarr; ไป) | รูปแบบการสื่อสาร | โปรโตคอล / กลไก | เหตุผลและความเหมาะสมทางสถาปัตยกรรม |
| :--- | :--- | :--- | :--- |
| **Client &rarr; API Gateway** | **Synchronous** | HTTP/REST | ผู้ใช้งาน (Browser/Mobile) ส่งคำขอและจำเป็นต้องรอผลลัพธ์ (Request-Response) เพื่อนำข้อมูลไปเรนเดอร์หน้าจอแสดงผลทันที เช่น รายการสูตรอาหาร หรือข้อความยืนยันการบันทึก |
| **API Gateway &rarr; Recipe Catalog Service** | **Synchronous** | HTTP/REST | Gateway รับคำขอจาก Client แล้วส่งต่อ (Proxy/Route) ไปยัง Recipe Service เพื่อรอรับข้อมูลสูตรอาหารกลับมาส่งต่อให้ Client แบบเรียลไทม์ |
| **API Gateway &rarr; Review & Rating Service** | **Synchronous** | HTTP/REST | ผู้ใช้ต้องการดูรายการรีวิวหรือโพสต์รีวิวใหม่ และต้องการทราบสถานะผลการดำเนินการทันที (สำเร็จ/ล้มเหลว) |
| **API Gateway &rarr; Nutrition Service** | **Synchronous** | HTTP/REST | Client ร้องขอข้อมูลคุณค่าทางโภชนาการของสูตรอาหารเพื่อแสดงบนหน้ารายละเอียดสูตรอาหาร จึงต้องรอรับข้อมูลแบบทันที |
| **Review Service &rarr; Recipe Catalog Service** | **Synchronous** | HTTP/REST | เมื่อผู้ใช้ส่งรีวิวสูตรอาหาร (`POST /recipes/:id/reviews`) ตัว Review Service **จำเป็นต้องตรวจสอบทันทีก่อนบันทึก** ว่าสูตรอาหารรหัสนี้มีอยู่จริงหรือไม่ (Data Validation) หากไม่มีสูตรอยู่จริงจะต้องปฏิเสธด้วย `404 Not Found` ทันที จึงต้องรอผลลัพธ์แบบ Blocking |
| **Nutrition Service &rarr; Recipe Catalog Service** | **Synchronous** | HTTP/REST | Nutrition Service ต้องดึงชื่อสูตรอาหารและรายการวัตถุดิบ (Ingredients) จาก Recipe Service เพื่อนำไปเป็นพารามิเตอร์ในการคำนวณสารอาหารและแคลอรี่ |
| **Nutrition Service &rarr; External Nutrition API** | **Synchronous** | HTTP/REST (Axios) | Nutrition Service ร้องขอข้อมูลสารอาหารจากภายนอกแบบทันทีเพื่อนำมาตอบกลับให้ผู้ใช้งาน พร้อมควบคุมด้วยกลไก Retry, Timeout, และ Fallback |
| **Recipe Catalog Service &rarr; Review Service** | **Asynchronous** | Event-Driven (Message Broker) | เมื่อผู้ใช้ลบสูตรอาหาร (`DELETE /recipes/:id`) Recipe Service จะลบข้อมูลสูตรใน DB ตนเองเสร็จแล้ว **Publish Event `RecipeDeleted`** เข้า Message Broker จากนั้น Review Service จะ Subscribe ดึง Event นี้ไปลบรีวิวที่ค้างอยู่เบื้องหลัง ทำให้ Recipe Service ตอบกลับผู้ใช้ได้ทันที ไม่ต้องรอการลบรีวิวทั้งหมด และรองรับ Eventual Consistency แทน Cascade Delete ข้ามฐานข้อมูล |
| **Review Service &rarr; Notification Service** | **Asynchronous** | Event-Driven (Message Broker) | เมื่อมีรีวิวใหม่เกิดขึ้น (`ReviewCreated`) Review Service จะ Publish Event เข้า Message Broker เพื่อให้ Notification Service ดึงไปส่งอีเมลหรือแจ้งเตือนเจ้าของสูตร โดย Review Service ไม่ต้องรอผลการส่งแจ้งเตือน ทำให้เวลาตอบสนองของผู้ใช้งานรวดเร็วและบริการไม่ผูกติดกัน (Decoupled) |

---

## 4. จุดที่ต้องมี Resilience (Retry / Timeout / Fallback)

การสื่อสารผ่านเครือข่ายระหว่างบริการมีโอกาสเกิดความล้มเหลว ช้า หรือบริการปลายทางไม่พร้อมใช้งานได้เสมอ ตามหลักการที่ศึกษาในสัปดาห์ที่ 11 จึงต้องวางกลไกความทนทานต่อความผิดพลาด (Resilience Patterns) ในจุดที่มีความเสี่ยงสูงดังนี้:

| บริการที่เรียก | บริการปลายทาง | กลไกที่ต้องมี (Retry / Timeout / Fallback) | พฤติกรรมการทำงานและเหตุผลทางเทคนิค |
| :--- | :--- | :--- | :--- |
| **API Gateway** | **ทุกบริการย่อยภายใน**<br>(Recipe, Review, Nutrition Service) | **Timeout + Fallback**<br>*(Retry เฉพาะ GET)* | - **Timeout:** กำหนดไว้ที่ **3,000 ms (3 วินาที)** ป้องกันไม่ให้ Gateway ค้างรอการตอบสนองจน Exhaust ทรัพยากรระบบ<br>- **Retry:** ทำ Retry ได้ 1 ครั้ง **เฉพาะ Idempotent Request (`GET`)** เท่านั้น ห้ามทำ Retry กับคำขอประเภท `POST`, `PUT`, `DELETE` เพื่อป้องกันข้อมูลซ้ำซ้อน (Side Effects)<br>- **Fallback:** หากบริการปลายทางล่มหรือไม่ตอบสนองภายใน Timeout ให้ Gateway คืนค่า HTTP `503 Service Unavailable` พร้อมโครงสร้าง Error JSON ที่มีความหมาย เช่น `{"error": {"code": "SERVICE_UNAVAILABLE", "message": "บริการข้อมูลสูตรอาหารไม่พร้อมใช้งานชั่วคราว"}}` ช่วยให้ Gateway ไม่ crash และผู้ใช้เข้าใจสถานะของระบบ |
| **Nutrition Service** | **External Nutrition API**<br>*(ระบบภายนอก Third-Party)* | **Retry + Timeout + Fallback**<br>*(ตามที่พัฒนาจริงใน W11)* | - **Timeout:** กำหนดไว้ที่ **3,000 ms** ป้องกัน Third-Party API ภายนอกทำงานช้าจนบล็อก Thread<br>- **Retry:** กำหนด **Retry 2 ครั้ง** (รวมเรียกสูงสุด 3 ครั้ง) โดยมีระยะหน่วงเวลา (Delay) 2,000 ms ระหว่างรอบ เมื่อพบสถานะ Network Error หรือ HTTP 5xx เพื่อรับมือกับความขัดข้องชั่วคราว (Transient Faults)<br>- **Fallback:** หาก Retry ครบกำหนดแล้วยังล้มเหลว ให้คืนข้อมูลสำรอง (Graceful Degradation) เช่น `{"source": "fallback", "calories": "N/A", "message": "ไม่สามารถดึงข้อมูลโภชนาการได้ในขณะนี้", "status": "fallback"}` ช่วยให้ระบบแสดงผลรายละเอียดสูตรอาหารหลักต่อไปได้ โดยไม่พ่น error 500 ใส่ผู้ใช้ |
| **Review Service** | **Recipe Catalog Service**<br>*(การตรวจสอบความมีอยู่ของสูตร)* | **Retry + Timeout + Fallback** | - **Timeout:** กำหนดที่ **2,000 ms** (เนื่องจากเป็นการสื่อสารภายในเครือข่ายเดียวกัน)<br>- **Retry:** ทำ Retry 1-2 ครั้ง เมื่อพบปัญหาทางเน็ตเวิร์กชั่วคราว เนื่องจากเป็นคำขอ `GET /recipes/:id` ซึ่งปลอดภัยและเป็น Idempotent<br>- **Fallback:** หาก Recipe Service ล่มสนิท Review Service จะต้องตอบกลับผู้ใช้ด้วย `503 Service Unavailable` พร้อมแจ้งข้อความ `"ไม่สามารถตรวจสอบข้อมูลสูตรอาหารได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"` เพื่อรักษาความถูกต้องของข้อมูล (Data Integrity) ป้องกันการบันทึกรีวิวลอยที่ไม่มีสูตรอาหารรองรับ |
| **Nutrition Service** | **Recipe Catalog Service**<br>*(การดึงวัตถุดิบไปคำนวณ)* | **Retry + Timeout + Fallback** | - **Timeout:** กำหนดที่ **2,000 ms**<br>- **Retry:** ทำ Retry 2 ครั้ง สำหรับการร้องขอข้อมูลวัตถุดิบ (`GET`)<br>- **Fallback:** กรณี Recipe Service ไม่ตอบสนอง ให้นำข้อมูลสูตรและวัตถุดิบจาก Local Cache (หากมีเก็บไว้ก่อนหน้า) มาใช้คำนวณ หรือตอบกลับ Fallback ว่า `"ไม่สามารถดึงข้อมูลสูตรเพื่อวิเคราะห์โภชนาการได้ในขณะนี้"` |
| **API Gateway (กรณี Aggregated View)** | **Review & Rating Service**<br>*(กรณีดึงสูตรพร้อมคะแนนรีวิว)* | **Graceful Degradation (Fallback)** | หากหน้าเว็บต้องการแสดงสูตรอาหารพร้อมคะแนนเฉลี่ย (`GET /recipes/:id`) แล้วพบว่า Review Service ล่ม Gateway สามารถส่งข้อมูลสูตรอาหารกลับไปให้ผู้ใช้ได้ตามปกติ โดย Fallback ข้อมูลรีวิวเป็น `{ "rating": "N/A", "reviews": [], "status": "review_unavailable" }` ทำให้ผู้ใช้ยังสามารถอ่านวิธีทำอาหารได้โดยไม่สะดุด |

---

## 5. สรุปเปรียบเทียบการปรับปรุงสถาปัตยกรรม (Monolithic vs. Microservices)

1. **ความเป็นอิสระและการ Scale:**  
   ในสถาปัตยกรรมเดิม หากหน้าค้นหาสูตรอาหารหรือการคำนวณโภชนาการมีผู้ใช้งานหนาแน่น ระบบเดิมจะต้อง Scale ทั้งแอปพลิเคชันและฐานข้อมูลร่วมกัน แต่ในสถาปัตยกรรม Microservices นี้ สามารถ Scale เฉพาะ `Nutrition Service` หรือ `Recipe Catalog Service` ได้อย่างอิสระตามปริมาณ Traffic
2. **ความทนทานต่อความล้มเหลว (Fault Isolation):**  
   หาก External Nutrition API ล่ม หรือ Review Service มีปัญหา ขอบเขตความเสียหายจะถูกจำกัดอยู่เฉพาะบริการนั้นๆ และมีระบบ Fallback รองรับ ผู้ใช้ยังคงสามารถเข้าใช้งาน Recipe Catalog Service เพื่อเปิดอ่านขั้นตอนการทำอาหารได้ตามปกติ ไม่ส่งผลกระทบให้ทั้งระบบล่มเหมือนสถาปัตยกรรมแบบ Monolithic
3. **การจัดการความปลอดภัยและ Cross-Cutting Concerns:**  
   API Gateway รวมศูนย์การตรวจสอบ Token (JWT), การดักจับ Traffic ด้วย Rate Limiting และการบันทึก Log ทำให้บริการย่อยแต่ละตัวมุ่งเน้นเฉพาะ Business Logic ตาม Bounded Context ของตนเองอย่างแท้จริง
