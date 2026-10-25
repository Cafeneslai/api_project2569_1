// frontend/app.js - Logic for Recipe Hub Frontend

// Auto-detect API_BASE:
// ถ้าเปิดผ่าน Live Server (พอร์ต 5500 หรือพอร์ตอื่นๆ) ให้ยิงไปหา Express Backend ที่พอร์ต 3000
// แต่ถ้าเปิดผ่าน http://localhost:3000 ให้ใช้ path สัมพัทธ์ /api/v1
const API_BASE = window.location.port === '3000' 
  ? '/api/v1' 
  : 'http://localhost:3000/api/v1';

// Global state
let currentSelectedRecipeId = null;
let currentSelectedRecipeName = '';

// DOM Elements
const recipesGrid = document.getElementById('recipes-grid');
const loadingSpinner = document.getElementById('loading-spinner');
const errorContainer = document.getElementById('error-container');
const errorDesc = document.getElementById('error-desc');
const emptyContainer = document.getElementById('empty-container');
const recipeCountBadge = document.getElementById('recipe-count-badge');
const selectCategory = document.getElementById('select-category');
const inputSearch = document.getElementById('input-search');
const btnSearchClear = document.getElementById('btn-search-clear');
const btnRefresh = document.getElementById('btn-refresh');
const btnRetryLoad = document.getElementById('btn-retry-load');

// Modal Elements - Create Recipe
const modalAddRecipe = document.getElementById('modal-add-recipe');
const btnOpenAddModal = document.getElementById('btn-open-add-modal');
const btnCloseAddModal = document.getElementById('btn-close-add-modal');
const btnCancelCreate = document.getElementById('btn-cancel-create');
const formCreateRecipe = document.getElementById('form-create-recipe');
const selectNewCategory = document.getElementById('select-new-category');
const formErrorAlert = document.getElementById('form-error-alert');

// Modal Elements - Edit Recipe
const modalEditRecipe = document.getElementById('modal-edit-recipe');
const btnCloseEditModal = document.getElementById('btn-close-edit-modal');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const formEditRecipe = document.getElementById('form-edit-recipe');
const selectEditCategory = document.getElementById('select-edit-category');

// Modal Elements - Detail & Nutrition & Reviews
const modalDetail = document.getElementById('modal-detail');
const btnCloseDetail = document.getElementById('btn-close-detail');
const btnModalCloseBottom = document.getElementById('btn-modal-close-bottom');
const detailName = document.getElementById('detail-name');
const detailCategoryBadge = document.getElementById('detail-category-badge');
const detailCookTime = document.getElementById('detail-cook-time');
const detailId = document.getElementById('detail-id');
const detailIngredients = document.getElementById('detail-ingredients');

// Nutrition Elements
const btnRefreshNutrition = document.getElementById('btn-refresh-nutrition');
const nutritionLoading = document.getElementById('nutrition-loading');
const nutritionCard = document.getElementById('nutrition-card');
const nutritionCalories = document.getElementById('nutrition-calories');
const nutritionStatusBadge = document.getElementById('nutrition-status-badge');
const nutritionSourceBadge = document.getElementById('nutrition-source-badge');
const nutritionMessage = document.getElementById('nutrition-message');

// Review Elements
const reviewCountBadge = document.getElementById('review-count-badge');
const formAddReview = document.getElementById('form-add-review');
const reviewAuthor = document.getElementById('review-author');
const reviewRating = document.getElementById('review-rating');
const reviewComment = document.getElementById('review-comment');
const reviewsList = document.getElementById('reviews-list');
const reviewsEmpty = document.getElementById('reviews-empty');

// Toast Notification
const toast = document.getElementById('toast');

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'toast-error' : 'toast-success'}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// ==========================================
// 1. Initial Load & Categories
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadRecipes();
  setupEventListeners();
});

function setupEventListeners() {
  btnRefresh.addEventListener('click', () => loadRecipes());
  btnRetryLoad.addEventListener('click', () => loadRecipes());

  // Search input with debounce
  let searchTimeout = null;
  inputSearch.addEventListener('input', () => {
    btnSearchClear.style.display = inputSearch.value.trim() ? 'inline-block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadRecipes();
    }, 400);
  });

  btnSearchClear.addEventListener('click', () => {
    inputSearch.value = '';
    btnSearchClear.style.display = 'none';
    loadRecipes();
  });

  selectCategory.addEventListener('change', () => loadRecipes());

  // Modal Add Recipe
  btnOpenAddModal.addEventListener('click', () => {
    formCreateRecipe.reset();
    formErrorAlert.style.display = 'none';
    modalAddRecipe.style.display = 'flex';
  });

  const closeAddModal = () => (modalAddRecipe.style.display = 'none');
  btnCloseAddModal.addEventListener('click', closeAddModal);
  btnCancelCreate.addEventListener('click', closeAddModal);

  // Form Submit Recipe
  formCreateRecipe.addEventListener('submit', handleCreateRecipe);

  // Modal Detail
  const closeDetailModal = () => (modalDetail.style.display = 'none');
  btnCloseDetail.addEventListener('click', closeDetailModal);
  btnModalCloseBottom.addEventListener('click', closeDetailModal);

  // Modal Edit Recipe
  const closeEditModal = () => (modalEditRecipe.style.display = 'none');
  btnCloseEditModal.addEventListener('click', closeEditModal);
  btnCancelEdit.addEventListener('click', closeEditModal);
  formEditRecipe.addEventListener('submit', handleEditRecipe);

  // Detail Modal Actions (Edit & Delete)
  const btnEditFromDetail = document.getElementById('btn-edit-from-detail');
  const btnDeleteFromDetail = document.getElementById('btn-delete-from-detail');
  if (btnEditFromDetail) {
    btnEditFromDetail.addEventListener('click', () => {
      if (currentSelectedRecipeId) openEditRecipeModal(currentSelectedRecipeId);
    });
  }
  if (btnDeleteFromDetail) {
    btnDeleteFromDetail.addEventListener('click', () => {
      if (currentSelectedRecipeId && currentSelectedRecipeName) {
        handleDeleteRecipe(currentSelectedRecipeId, currentSelectedRecipeName);
      }
    });
  }

  // Nutrition Refresh
  btnRefreshNutrition.addEventListener('click', () => {
    if (currentSelectedRecipeId && currentSelectedRecipeName) {
      loadNutrition(currentSelectedRecipeId, currentSelectedRecipeName);
    }
  });

  // Review Submit
  formAddReview.addEventListener('submit', handleAddReview);

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modalAddRecipe) closeAddModal();
    if (e.target === modalDetail) closeDetailModal();
    if (e.target === modalEditRecipe) closeEditModal();
  });
}

// ==========================================
// 2. Fetch Categories (GET /categories)
// ==========================================
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    const categories = result.data || [];

    // Populate search filter dropdown
    selectCategory.innerHTML = '<option value="">ทั้งหมดทุกหมวดหมู่</option>';
    // Populate modal add recipe dropdown
    selectNewCategory.innerHTML = '<option value="">-- เลือกหมวดหมู่ --</option>';
    // Populate modal edit recipe dropdown
    selectEditCategory.innerHTML = '<option value="">-- เลือกหมวดหมู่ --</option>';

    categories.forEach((cat) => {
      const opt1 = document.createElement('option');
      opt1.value = cat.id;
      opt1.textContent = cat.name;
      selectCategory.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = cat.id;
      opt2.textContent = cat.name;
      selectNewCategory.appendChild(opt2);

      const opt3 = document.createElement('option');
      opt3.value = cat.id;
      opt3.textContent = cat.name;
      selectEditCategory.appendChild(opt3);
    });
  } catch (error) {
    console.warn('Failed to load categories:', error);
  }
}

// ==========================================
// 3. Fetch Recipes (GET /recipes)
// ==========================================
async function loadRecipes() {
  showLoading(true);
  hideError();
  recipesGrid.innerHTML = '';

  const params = new URLSearchParams();
  const catId = selectCategory.value;
  const search = inputSearch.value.trim();

  if (catId) params.append('category_id', catId);
  if (search) params.append('search', search);

  const url = `${API_BASE}/recipes${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`เซิร์ฟเวอร์ตอบกลับรหัส: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    const recipes = result.data || [];

    showLoading(false);
    recipeCountBadge.textContent = `${recipes.length} รายการ`;

    if (recipes.length === 0) {
      emptyContainer.style.display = 'block';
      return;
    }

    emptyContainer.style.display = 'none';
    renderRecipeCards(recipes);
  } catch (error) {
    showLoading(false);
    showError(error.message);
  }
}

function renderRecipeCards(recipes) {
  recipesGrid.innerHTML = '';

  recipes.forEach((recipe) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('data-id', recipe.id);

    card.innerHTML = `
      <div>
        <div class="card-top">
          <h3 class="recipe-name">${escapeHtml(recipe.recipe_name)}</h3>
          <span class="badge badge-category">${escapeHtml(recipe.category_name || 'ทั่วไป')}</span>
        </div>
        <div class="recipe-details-row">
          <span>⏱️ ${recipe.cook_time_minutes} นาที</span>
          <span>•</span>
          <span>รหัส #${recipe.id}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm btn-view-recipe" data-id="${recipe.id}">
          🔍 ดูสูตร & โภชนาการ
        </button>
        <button class="btn btn-secondary btn-sm btn-edit-recipe" data-id="${recipe.id}">
          ✏️ แก้ไข
        </button>
        <button class="btn btn-danger-outline btn-delete-recipe" data-id="${recipe.id}" data-name="${escapeHtml(recipe.recipe_name)}">
          ลบ
        </button>
      </div>
    `;

    // Hook buttons
    const btnView = card.querySelector('.btn-view-recipe');
    btnView.addEventListener('click', () => openRecipeDetail(recipe.id));

    const btnEdit = card.querySelector('.btn-edit-recipe');
    btnEdit.addEventListener('click', () => openEditRecipeModal(recipe.id));

    const btnDelete = card.querySelector('.btn-delete-recipe');
    btnDelete.addEventListener('click', () => handleDeleteRecipe(recipe.id, recipe.recipe_name));

    recipesGrid.appendChild(card);
  });
}

// ==========================================
// 4. View Recipe Details (GET /recipes/:id)
// ==========================================
async function openRecipeDetail(recipeId) {
  currentSelectedRecipeId = recipeId;
  modalDetail.style.display = 'flex';

  detailName.textContent = 'กำลังโหลดข้อมูล...';
  detailIngredients.textContent = '...';
  nutritionCalories.textContent = '--';
  nutritionMessage.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}`);
    if (!res.ok) throw new Error(`ไม่พบสูตรอาหาร (HTTP ${res.status})`);
    const result = await res.json();
    const recipe = result.data;

    currentSelectedRecipeName = recipe.recipe_name;
    detailName.textContent = recipe.recipe_name;
    detailCategoryBadge.textContent = recipe.category_name || 'หมวดหมู่';
    detailCookTime.textContent = `${recipe.cook_time_minutes} นาที`;
    detailId.textContent = `#${recipe.id}`;
    detailIngredients.textContent = recipe.ingredients;

    // Load Nutrition & Reviews in parallel
    loadNutrition(recipe.id, recipe.recipe_name);
    loadReviews(recipe.id);
  } catch (error) {
    showToast(error.message, 'error');
    modalDetail.style.display = 'none';
  }
}

// ==========================================
// 5. Fetch Nutrition (GET /recipes/:id/nutrition)
// ==========================================
async function loadNutrition(recipeId, recipeName) {
  nutritionLoading.style.display = 'flex';
  nutritionCard.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}/nutrition`);
    const result = await res.json();

    nutritionLoading.style.display = 'none';
    nutritionCard.style.display = 'flex';

    if (result.nutrition) {
      const nut = result.nutrition;
      nutritionCalories.textContent = nut.calories !== undefined ? nut.calories : 'N/A';

      if (nut.source === 'fallback') {
        nutritionStatusBadge.className = 'badge badge-warning';
        nutritionStatusBadge.textContent = 'ระบบสำรอง (Fallback)';
        nutritionSourceBadge.textContent = 'Local Cache / Default';
        nutritionMessage.textContent = nut.message || 'Third-Party API ขัดข้อง กำลังใช้ข้อมูลสำรอง';
      } else {
        nutritionStatusBadge.className = 'badge badge-success';
        nutritionStatusBadge.textContent = 'เชื่อมต่อปกติ';
        nutritionSourceBadge.textContent = 'External API (DummyJSON)';
        nutritionMessage.textContent = 'ดึงข้อมูลสำเร็จจาก Nutrition API ภายนอก';
      }
    }
  } catch (error) {
    nutritionLoading.style.display = 'none';
    nutritionCard.style.display = 'flex';
    nutritionCalories.textContent = 'N/A';
    nutritionStatusBadge.className = 'badge badge-warning';
    nutritionStatusBadge.textContent = 'เชื่อมต่อไม่สำเร็จ';
    nutritionMessage.textContent = 'ไม่สามารถดึงข้อมูลโภชนาการได้';
  }
}

// ==========================================
// 6. Fetch Reviews (GET /recipes/:id/reviews)
// ==========================================
async function loadReviews(recipeId) {
  reviewsList.innerHTML = '<div style="text-align:center;color:#64748b;">กำลังโหลดรีวิว...</div>';
  reviewsEmpty.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}/reviews`);
    if (!res.ok) throw new Error('โหลดรีวิวไม่สำเร็จ');
    const result = await res.json();
    const reviews = result.data || [];

    reviewCountBadge.textContent = `${reviews.length} รีวิว`;
    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
      reviewsEmpty.style.display = 'block';
      return;
    }

    reviewsEmpty.style.display = 'none';
    reviews.forEach((rev) => {
      const item = document.createElement('div');
      item.className = 'review-item';

      const stars = '⭐'.repeat(rev.rating);
      const dateStr = rev.created_at ? new Date(rev.created_at).toLocaleString('th-TH') : '';

      item.innerHTML = `
        <div>
          <div class="review-reviewer">${escapeHtml(rev.reviewer_name)}</div>
          <div class="review-rating-stars">${stars} (${rev.rating}/5)</div>
          <p class="review-comment-text">${escapeHtml(rev.comment || 'ไม่มีความคิดเห็นเพิ่มเติม')}</p>
          <div class="review-date">${dateStr}</div>
        </div>
        <div>
          <button class="btn btn-danger-outline btn-sm btn-del-review" data-id="${rev.id}">
            ลบ
          </button>
        </div>
      `;

      item.querySelector('.btn-del-review').addEventListener('click', () => {
        handleDeleteReview(rev.id, recipeId);
      });

      reviewsList.appendChild(item);
    });
  } catch (error) {
    reviewsList.innerHTML = `<div style="color:#ef4444;text-align:center;">เกิดข้อผิดพลาดในการโหลดรีวิว: ${error.message}</div>`;
  }
}

// ==========================================
// 7. Create Recipe (POST /recipes)
// ==========================================
async function handleCreateRecipe(e) {
  e.preventDefault();

  const name = document.getElementById('input-recipe-name').value.trim();
  const category_id = parseInt(selectNewCategory.value, 10);
  const cook_time_minutes = parseInt(document.getElementById('input-cook-time').value, 10);
  const ingredients = document.getElementById('input-ingredients').value.trim();

  // Client-Side Validation
  if (!name) {
    showFormError('กรุณาระบุชื่อสูตรอาหาร');
    return;
  }
  if (!category_id) {
    showFormError('กรุณาเลือกหมวดหมู่อาหาร');
    return;
  }
  if (isNaN(cook_time_minutes) || cook_time_minutes <= 0) {
    showFormError('เวลาที่ใช้ปรุงต้องเป็นตัวเลขที่มากกว่า 0');
    return;
  }
  if (!ingredients) {
    showFormError('กรุณาระบุวัตถุดิบและส่วนผสม');
    return;
  }

  formErrorAlert.style.display = 'none';
  const submitBtn = document.getElementById('btn-submit-create');
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังบันทึก...';

  try {
    const res = await fetch(`${API_BASE}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category_id,
        cook_time_minutes,
        ingredients,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `สร้างสูตรอาหารไม่สำเร็จ (HTTP ${res.status})`);
    }

    modalAddRecipe.style.display = 'none';
    showToast('สร้างสูตรอาหารใหม่สำเร็จ!', 'success');
    loadRecipes();
  } catch (error) {
    showFormError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึกสูตรอาหาร';
  }
}

function showFormError(msg) {
  formErrorAlert.textContent = msg;
  formErrorAlert.style.display = 'block';
}

// ==========================================
// 7.1 Edit Recipe (PUT /recipes/:id)
// ==========================================
async function openEditRecipeModal(recipeId) {
  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}`);
    if (!res.ok) throw new Error('ไม่พบข้อมูลสูตรอาหาร');
    const result = await res.json();
    const recipe = result.data;

    document.getElementById('input-edit-id').value = recipe.id;
    document.getElementById('input-edit-name').value = recipe.recipe_name;
    document.getElementById('select-edit-category').value = recipe.category_id || '';
    document.getElementById('input-edit-cook-time').value = recipe.cook_time_minutes;
    document.getElementById('input-edit-ingredients').value = recipe.ingredients;

    document.getElementById('edit-form-error-alert').style.display = 'none';
    modalEditRecipe.style.display = 'flex';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleEditRecipe(e) {
  e.preventDefault();

  const id = document.getElementById('input-edit-id').value;
  const name = document.getElementById('input-edit-name').value.trim();
  const category_id = parseInt(document.getElementById('select-edit-category').value, 10);
  const cook_time_minutes = parseInt(document.getElementById('input-edit-cook-time').value, 10);
  const ingredients = document.getElementById('input-edit-ingredients').value.trim();
  const errorAlert = document.getElementById('edit-form-error-alert');

  // Client-Side Validation
  if (!name) {
    errorAlert.textContent = 'กรุณาระบุชื่อสูตรอาหาร';
    errorAlert.style.display = 'block';
    return;
  }
  if (!category_id) {
    errorAlert.textContent = 'กรุณาเลือกหมวดหมู่อาหาร';
    errorAlert.style.display = 'block';
    return;
  }
  if (isNaN(cook_time_minutes) || cook_time_minutes <= 0) {
    errorAlert.textContent = 'เวลาที่ใช้ปรุงต้องเป็นตัวเลขที่มากกว่า 0';
    errorAlert.style.display = 'block';
    return;
  }
  if (!ingredients) {
    errorAlert.textContent = 'กรุณาระบุวัตถุดิบและส่วนผสม';
    errorAlert.style.display = 'block';
    return;
  }

  errorAlert.style.display = 'none';
  const submitBtn = document.getElementById('btn-submit-edit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังบันทึกการแก้ไข...';

  try {
    const res = await fetch(`${API_BASE}/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category_id,
        cook_time_minutes,
        ingredients,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `อัปเดตสูตรอาหารไม่สำเร็จ (HTTP ${res.status})`);
    }

    modalEditRecipe.style.display = 'none';
    showToast('แก้ไขข้อมูลสูตรอาหารสำเร็จ!', 'success');
    loadRecipes();

    // If detail modal is open for this recipe, update it
    if (modalDetail.style.display === 'flex' && currentSelectedRecipeId == id) {
      openRecipeDetail(id);
    }
  } catch (error) {
    errorAlert.textContent = error.message;
    errorAlert.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึกการแก้ไข';
  }
}

// ==========================================
// 8. Add Review (POST /recipes/:id/reviews)
// ==========================================
async function handleAddReview(e) {
  e.preventDefault();

  if (!currentSelectedRecipeId) return;

  const reviewer_name = reviewAuthor.value.trim();
  const rating = parseInt(reviewRating.value, 10);
  const comment = reviewComment.value.trim();

  // Client-Side Validation
  if (!reviewer_name) {
    showToast('กรุณาระบุชื่อผู้รีวิว', 'error');
    return;
  }
  if (isNaN(rating) || rating < 1 || rating > 5) {
    showToast('คะแนนต้องอยู่ระหว่าง 1-5 ดาว', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-review');
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังส่ง...';

  try {
    const res = await fetch(`${API_BASE}/recipes/${currentSelectedRecipeId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewer_name,
        rating,
        comment,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'ส่งรีวิวไม่สำเร็จ');
    }

    formAddReview.reset();
    showToast('เพิ่มรีวิวสำเร็จ ขอบคุณสำหรับความคิดเห็น!', 'success');
    loadReviews(currentSelectedRecipeId);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'ส่งความคิดเห็น';
  }
}

// ==========================================
// 9. Delete Recipe (DELETE /recipes/:id)
// ==========================================
async function handleDeleteRecipe(recipeId, recipeName) {
  const confirmed = confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสูตรอาหาร "${recipeName}"?\n(รีวิวทั้งหมดของสูตรนี้จะถูกลบไปด้วย)`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`ลบสูตรอาหารไม่สำเร็จ (HTTP ${res.status})`);
    }

    showToast(`ลบสูตรอาหาร "${recipeName}" สำเร็จแล้ว`, 'success');
    if (modalDetail.style.display === 'flex' && currentSelectedRecipeId == recipeId) {
      modalDetail.style.display = 'none';
    }
    loadRecipes();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==========================================
// 10. Delete Review (DELETE /reviews/:id)
// ==========================================
async function handleDeleteReview(reviewId, recipeId) {
  const confirmed = confirm('คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?');
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`ลบรีวิวไม่สำเร็จ (HTTP ${res.status})`);
    }

    showToast('ลบรีวิวสำเร็จ', 'success');
    loadReviews(recipeId);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Helpers
function showLoading(show) {
  loadingSpinner.style.display = show ? 'block' : 'none';
}

function showError(message) {
  errorDesc.textContent = message;
  errorContainer.style.display = 'block';
}

function hideError() {
  errorContainer.style.display = 'none';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
