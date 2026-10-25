require("dotenv").config();
const express = require("express");
const pool = require("./db");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const { getNutritionInfo } = require("./services/external-api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Native CORS middleware (ไม่ต้องพึ่ง external package)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve frontend static files (เปิด http://localhost:3000 ได้ทันที)
app.use(express.static(path.join(__dirname, "frontend")));

// Setup Swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========================================
// 1. Recipes Endpoints (Core Catalog)
// ==========================================

// 1.1 GET /api/v1/recipes
app.get("/api/v1/recipes", async (req, res) => {
  try {
    const { category_id, search } = req.query;
    let sql = `
      SELECT 
        recipes.id, 
        recipes.category_id,
        recipes.name AS recipe_name, 
        categories.name AS category_name, 
        recipes.cook_time_minutes 
      FROM recipes
      JOIN categories ON recipes.category_id = categories.id
    `;
    const params = [];
    const conditions = [];

    if (category_id) {
      conditions.push("recipes.category_id = ?");
      params.push(category_id);
    }
    if (search) {
      conditions.push("recipes.name LIKE ?");
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY recipes.id DESC";

    const [rows] = await pool.query(sql, params);
    res.status(200).json({ message: "ดึงข้อมูลสูตรอาหารสำเร็จ", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// 1.2 GET /api/v1/recipes/:id
app.get("/api/v1/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        recipes.id, 
        recipes.category_id,
        recipes.name AS recipe_name, 
        categories.name AS category_name, 
        recipes.ingredients,
        recipes.cook_time_minutes 
      FROM recipes
      JOIN categories ON recipes.category_id = categories.id
      WHERE recipes.id = ?
    `,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: { message: "Recipe not found" } });
    }
    res.status(200).json({ message: "ดึงข้อมูลสูตรอาหารสำเร็จ", data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// 1.3 POST /api/v1/recipes
app.post("/api/v1/recipes", async (req, res) => {
  try {
    const { category_id, name, ingredients, cook_time_minutes } = req.body;
    if (!category_id || !name || !ingredients || !cook_time_minutes) {
      return res
        .status(400)
        .json({ error: { message: "Bad Request: Missing required fields" } });
    }
    const [result] = await pool.query(
      `
      INSERT INTO recipes (category_id, name, ingredients, cook_time_minutes)
      VALUES (?, ?, ?, ?)
    `,
      [category_id, name, ingredients, cook_time_minutes]
    );
    res
      .status(201)
      .json({ message: "สร้างสูตรอาหารสำเร็จ", data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// 1.4 PUT /api/v1/recipes/:id
app.put("/api/v1/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, ingredients, cook_time_minutes } = req.body;
    if (!category_id || !name || !ingredients || !cook_time_minutes) {
      return res
        .status(400)
        .json({ error: { message: "Bad Request: Missing required fields" } });
    }
    const [result] = await pool.query(
      `
      UPDATE recipes 
      SET category_id = ?, name = ?, ingredients = ?, cook_time_minutes = ?
      WHERE id = ?
    `,
      [category_id, name, ingredients, cook_time_minutes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: { message: "Recipe not found" } });
    }
    res.status(200).json({ message: "อัปเดตสูตรอาหารสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// 1.5 DELETE /api/v1/recipes/:id
app.delete("/api/v1/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM recipes WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: { message: "Recipe not found" } });
    }
    res.status(200).json({ message: "ลบสูตรอาหารสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// ==========================================
// 2. Categories Endpoints
// ==========================================

// 2.1 GET /api/v1/categories
app.get("/api/v1/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM categories");
    res.status(200).json({ message: "ดึงข้อมูลหมวดหมู่สำเร็จ", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// ==========================================
// 3. Nutrition & Resilience Integration (W11)
// ==========================================

// 3.1 GET /api/v1/recipes/:id/nutrition
app.get("/api/v1/recipes/:id/nutrition", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT name FROM recipes WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: "Recipe not found" } });
    }

    const recipeName = rows[0].name;
    const nutritionInfo = await getNutritionInfo(recipeName);

    res.status(200).json({
      message: "ดึงข้อมูลโภชนาการสำเร็จ",
      recipe: recipeName,
      nutrition: nutritionInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// ==========================================
// 4. Review & Rating Service Integration (W13)
// ==========================================

// 4.1 GET /api/v1/recipes/:id/reviews
app.get("/api/v1/recipes/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT id, recipe_id, reviewer_name, rating, comment, created_at 
      FROM reviews 
      WHERE recipe_id = ? 
      ORDER BY created_at DESC
    `,
      [id]
    );
    res.status(200).json({ message: "ดึงข้อมูลรีวิวสำเร็จ", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// 4.2 POST /api/v1/recipes/:id/reviews
app.post("/api/v1/recipes/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name, rating, comment } = req.body;

    if (!reviewer_name || rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: {
          message:
            "Bad Request: Missing or invalid fields (rating must be between 1 and 5)",
        },
      });
    }

    // ตรวจสอบว่าสูตรอาหารมีอยู่จริง (Data Validation ข้ามบริการ)
    const [recipes] = await pool.query("SELECT id FROM recipes WHERE id = ?", [id]);
    if (recipes.length === 0) {
      return res.status(404).json({ error: { message: "Recipe not found" } });
    }

    const [result] = await pool.query(
      `
      INSERT INTO reviews (recipe_id, reviewer_name, rating, comment)
      VALUES (?, ?, ?, ?)
    `,
      [id, reviewer_name, rating, comment || null]
    );

    res.status(201).json({
      message: "เพิ่มรีวิวสำเร็จ",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// 4.3 DELETE /api/v1/reviews/:id
app.delete("/api/v1/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM reviews WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: { message: "Review not found" } });
    }
    res.status(200).json({ message: "ลบรีวิวสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

// Export app สำหรับ Automated Tests และเริ่มฟังค์ชัน Listen เมื่อรันโดยตรง
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    console.log(`Frontend accessible at http://localhost:${PORT}/`);
  });
}

module.exports = app;
