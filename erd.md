# Entity-Relationship Diagram (ERD)

แผนภาพแสดงความสัมพันธ์ของตารางในระบบข้อมูลสูตรอาหาร

```mermaid
erDiagram
    CATEGORIES {
        int id PK "AUTO_INCREMENT"
        varchar name "NOT NULL, UNIQUE"
    }
    
    RECIPES {
        int id PK "AUTO_INCREMENT"
        int category_id FK "NOT NULL"
        varchar name "NOT NULL"
        text ingredients "NOT NULL"
        int cook_time_minutes "NOT NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    REVIEWS {
        int id PK "AUTO_INCREMENT"
        int recipe_id FK "NOT NULL"
        varchar reviewer_name "NOT NULL"
        int rating "NOT NULL (1-5)"
        text comment "NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    CATEGORIES ||--o{ RECIPES : "has many"
    RECIPES ||--o{ REVIEWS : "has many"
```

## คำอธิบายเพิ่มเติมเกี่ยวกับ Database Constraints
1. **Primary Key (PK)**: `id` ของทุกตารางใช้ `INT AUTO_INCREMENT PRIMARY KEY`
2. **Foreign Key (FK)**: 
   - `category_id` ใน `recipes` อ้างอิงจาก `categories(id)` ด้วย `ON DELETE RESTRICT` (ไม่ให้ลบหมวดหมู่อาหารที่มีสูตรอาหารใช้งานอยู่) หรือใช้ `CASCADE` หากต้องการ
   - `recipe_id` ใน `reviews` อ้างอิงจาก `recipes(id)` ด้วย `ON DELETE CASCADE` เพื่อที่เวลากดลบสูตรอาหาร ระบบจะทำการลบรีวิวทั้งหมดของสูตรอาหารนั้นไปด้วยทันที
3. **UNIQUE Constraint**: 
   - `name` ใน `categories` ถูกกำหนดให้เป็น `UNIQUE` เพื่อป้องกันการตั้งชื่อหมวดหมู่ซ้ำซ้อนกันในระบบ
