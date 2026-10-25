DROP DATABASE IF EXISTS recipe_db;
CREATE DATABASE recipe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recipe_db;

-- 1. Table for Categories (หมวดหมู่อาหาร)
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Table for Recipes (สูตรอาหาร)
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  ingredients TEXT NOT NULL,
  cook_time_minutes INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 3. Table for Reviews (รีวิวและคะแนน)
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  reviewer_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
