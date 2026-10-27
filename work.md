# คู่มือการติดตั้งและรันโปรเจกต์ (Getting Started & Run Guide)

**ชื่อโครงงาน:** ระบบข้อมูลสูตรอาหาร (Recipe Information System) — Phase 3  
**รหัสนิสิต:** 67160193  

---

## 📌 สารบัญ (Table of Contents)
1. [สิ่งที่ต้องเตรียมล่วงหน้า (Prerequisites)](#1-สิ่งที่ต้องเตรียมล่วงหน้า-prerequisites)
2. [โครงสร้างไฟล์และโฟลเดอร์ (Project Structure)](#2-โครงสร้างไฟล์และโฟลเดอร์-project-structure)
3. [ขั้นตอนการติดตั้งและตั้งค่า (Step-by-Step Setup)](#3-ขั้นตอนการติดตั้งและตั้งค่า-step-by-step-setup)
   - [3.1 ติดตั้ง Node Modules](#31-ติดตั้ง-node-modules)
   - [3.2 ตั้งค่าฐานข้อมูล MySQL](#32-ตั้งค่าฐานข้อมูล-mysql)
   - [3.3 ตั้งค่าไฟล์ .env](#33-ตั้งค่าไฟล์-env)
4. [คำสั่งสำหรับการรันโปรเจกต์ (Running the App)](#4-คำสั่งสำหรับการรันโปรเจกต์-running-the-app)
5. [ช่องทางการเข้าใช้งาน (Access URLs)](#5-ช่องทางการเข้าใช้งาน-access-urls)
6. [การทดสอบระบบ (Automated Tests & Postman)](#6-การทดสอบระบบ-automated-tests--postman)
7. [การแก้ไขปัญหาที่พบบ่อย (Troubleshooting & FAQ)](#7-การแก้ไขปัญหาที่พบบ่อย-troubleshooting--faq)

---

## 1. สิ่งที่ต้องเตรียมล่วงหน้า (Prerequisites)

ก่อนเริ่มใช้งาน กรุณาตรวจสอบว่าเครื่องคอมพิวเตอร์ได้ติดตั้งโปรแกรมเหล่านี้แล้ว:

| รายการ | เวอร์ชันที่แนะนำ | รายละเอียด |
| :--- | :--- | :--- |
| **Node.js** | v18.x หรือ v20.x / v24.x | รัน JavaScript Runtime และ Built-in `node:test` runner |
| **npm** | v9.x ขึ้นไป | ตัวจัดการแพ็กเกจ (มาพร้อม Node.js) |
| **MySQL Server** | 8.0+ หรือ MariaDB (XAMPP) | ระบบจัดการฐานข้อมูลเชิงสัมพันธ์ (RDBMS) |
| **Git / Terminal** | PowerShell, Bash, หรือ CMD | สำหรับพิมพ์คำสั่งรันระบบ |

---

## 2. โครงสร้างไฟล์และโฟลเดอร์ (Project Structure)

```text
project-phase3-67160193/
├── frontend/                     # หน้าเว็บ UI (HTML, CSS, JS Single Page Application)
│   ├── index.html                # หน้าโครงสร้างเว็บหลัก
│   ├── style.css                 # สไตล์การแสดงผล Responsive / Modern UI
│   └── app.js                    # ฟังก์ชันเชื่อมต่อ REST API ฝั่ง Frontend
├── src/                          # โค้ด Backend หลัก
│   ├── index.js                  # Entry point ของ Express Server และ API Routes
│   ├── db.js                     # ตั้งค่า MySQL Connection Pool
│   └── services/                 # External Service Integrations
│       └── external-api.js       # บริการดึงข้อมูลโภชนาการ (พร้อม Retry, Timeout, Fallback)
├── tests/                        # Automated Tests (Integration & Unit Tests)
│   ├── api.test.js               # ทดสอบ API Endpoints ทั้งหมด
│   ├── db.test.js                # ทดสอบ Database Connection & Fallback
│   └── external-api.test.js      # ทดสอบ External Nutrition API
├── .env.example                  # ตัวอย่างการตั้งค่า Environment Variables
├── db.js                         # Database Connection Pool (สำรองที่ Root)
├── openapi.yaml                  # เอกสาร Swagger OpenAPI 3.0 Specification
├── package.json                  # กำหนด dependencies และคำสั่งรัน (scripts)
├── postman_collection.json       # ไฟล์ทดสอบ API ผ่าน Postman
├── schema.sql                    # สคริปต์สร้างฐานข้อมูลและตาราง (DDL)
├── seed.sql                      # ข้อมูลเริ่มต้นสำหรับทดสอบระบบ (Initial Seed Data)
└── work.md                       # คู่มือการรันโปรเจกต์นี้
```

---

## 3. ขั้นตอนการติดตั้งและตั้งค่า (Step-by-Step Setup)

### 3.1 ติดตั้ง Node Modules
เปิด Terminal หรือ Command Prompt ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:

```bash
npm install
```

---

### 3.2 ตั้งค่าฐานข้อมูล MySQL
โปรเจกต์นี้ต้องใช้ฐานข้อมูลชื่อ **`recipe_db`** โดยมีสคริปต์ SQL เตรียมไว้ให้ 2 ไฟล์:
1. `schema.sql` — สร้าง Database `recipe_db` และตาราง `categories`, `recipes`, `reviews`
2. `seed.sql` — นำเข้าข้อมูลตัวอย่างเริ่มต้น

คุณสามารถเลือกนำเข้าข้อมูลได้ตามวิธีที่คุณสะดวก:

#### ทางเลือกที่ 1: ใช้ Command Line (MySQL CLI / PowerShell)
```bash
# นำเข้าโครงสร้างตาราง
mysql -u root -p < schema.sql

# นำเข้าข้อมูลเริ่มต้น
mysql -u root -p < seed.sql
```
*(หากใช้ XAMPP หรือไม่มีรหัสผ่าน ให้กด Enter ข้ามตอนถาม Password)*

#### ทางเลือกที่ 2: ใช้ XAMPP (phpMyAdmin)
1. เปิด **XAMPP Control Panel** แล้วกด **Start** ที่โมดูล **Apache** และ **MySQL**
2. เปิดเบราว์เซอร์ไปที่: `http://localhost/phpmyadmin`
3. ไปที่แถบ **Import** (นำเข้า)
4. กด **Choose File** เลือกไฟล์ `schema.sql` แล้วกดปุ่ม **Import** ด้านล่าง
5. ทำซ้ำโดยเลือกไฟล์ `seed.sql` แล้วกด **Import** อีกครั้ง

#### ทางเลือกที่ 3: ใช้ MySQL Workbench / DBeaver
1. เชื่อมต่อ Local MySQL Connection
2. เปิดไฟล์ `schema.sql` ขึ้นมาแล้วกดปุ่มรูปสายฟ้า ⚡ (Execute)
3. เปิดไฟล์ `seed.sql` ขึ้นมาแล้วกดปุ่มรูปสายฟ้า ⚡ (Execute)

---

### 3.3 ตั้งค่าไฟล์ .env
สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ โดยคัดลอกจาก `.env.example`:

**บน Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**บน Mac / Linux / Git Bash:**
```bash
cp .env.example .env
```

จากนั้นเปิดไฟล์ `.env` และแก้ไขค่าให้ตรงกับการตั้งค่า MySQL ของเครื่องคุณ:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=recipe_db
PORT=3000
```

> **ข้อสังเกต:**
> - หากใช้ **XAMPP**: ปกติ `DB_USER=root` และ `DB_PASSWORD=` (ปล่อยว่างไว้)
> - หากใช้ **MySQL Installer ทั่วไป**: ให้ใส่รหัสผ่าน root ที่คุณตั้งไว้ในช่อง `DB_PASSWORD`

---

## 4. คำสั่งสำหรับการรันโปรเจกต์ (Running the App)

### รันแบบปกติ (Production Mode):
```bash
npm start
```
*(หรือใช้คำสั่ง `node src/index.js`)*

### รันแบบ Development (Auto-reload เมื่อมีการแก้ไขไฟล์):
```bash
npm run dev
```

เมื่อเซิร์ฟเวอร์เริ่มทำงานสำเร็จ จะมีข้อความแสดงในหน้าจอ Terminal ดังนี้:
```text
Server is running on port 3000
Swagger UI available at http://localhost:3000/api-docs
Frontend accessible at http://localhost:3000/
```

---

## 5. ช่องทางการเข้าใช้งาน (Access URLs)

| ส่วนของระบบ | URL สำหรับเข้าถึง | รายละเอียด |
| :--- | :--- | :--- |
| 🌐 **Frontend Web App** | [http://localhost:3000/](http://localhost:3000/) | หน้าเว็บสำหรับค้นหาสูตรอาหาร, ดูรายละเอียด, เพิ่ม/ลบสูตร, และรีวิว |
| 📖 **Swagger UI** | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | หน้าเอกสารและทดสอบ Interactive REST API Documentation |
| 🔌 **API Recipes List** | [http://localhost:3000/api/v1/recipes](http://localhost:3000/api/v1/recipes) | ตัวอย่าง Endpoint รายการสูตรอาหารในรูปแบบ JSON |
| 🍎 **API Nutrition (External)** | [http://localhost:3000/api/v1/recipes/1/nutrition](http://localhost:3000/api/v1/recipes/1/nutrition) | ข้อมูลโภชนาการที่ดึงจาก External API |

---

## 6. การทดสอบระบบ (Automated Tests & Postman)

### 6.1 รัน Automated Tests
โปรเจกต์นี้มีชุดทดสอบ Integration & Unit Tests ด้วย built-in `node:test` ของ Node.js:

```bash
npm test
```

### 6.2 รัน Test Coverage
สามารถรันเพื่อตรวจสอบความครอบคลุมของการทดสอบ (Coverage > 80% ตามเกณฑ์ CLO):

```bash
npm run test:coverage
```
ผลลัพธ์จะแสดงตารางสรุป Line Coverage, Branch Coverage, และ Function Coverage

### 6.3 การทดสอบผ่าน Postman
1. เปิดโปรแกรม **Postman**
2. กดปุ่ม **Import**
3. เลือกไฟล์ `postman_collection.json` ในโฟลเดอร์โปรเจกต์
4. สามารถกดทดสอบ Request ทุก Endpoint ได้ทันที

---

## 7. การแก้ไขปัญหาที่พบบ่อย (Troubleshooting & FAQ)

### ❌ ปัญหา: `ECONNREFUSED 127.0.0.1:3306`
- **สาเหตุ:** MySQL Server ยังไม่ได้เปิดทำงาน
- **วิธีแก้:** ตรวจสอบว่าได้กด Start MySQL ใน XAMPP Control Panel หรือเปิด MySQL Windows Service แล้วหรือไม่

### ❌ ปัญหา: `Access denied for user 'root'@'localhost'`
- **สาเหตุ:** รหัสผ่าน MySQL ไม่ถูกต้อง
- **วิธีแก้:** ตรวจสอบและแก้ไขค่า `DB_PASSWORD` ในไฟล์ `.env` ให้ตรงกับรหัสผ่านจริงของ MySQL เครื่องคุณ

### ❌ ปัญหา: `EADDRINUSE: address already in use :::3000`
- **สาเหตุ:** มีโปรแกรมอื่นใช้งานพอร์ต 3000 อยู่
- **วิธีแก้:** เปลี่ยนค่า `PORT=3001` หรือพอร์ตอื่นในไฟล์ `.env` แล้วรันใหม่อีกครั้ง
