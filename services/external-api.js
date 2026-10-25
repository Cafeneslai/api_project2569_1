const axios = require('axios');

/**
 * ฟังก์ชันสำหรับจำลองการหน่วงเวลา (Delay)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ฟังก์ชันดึงข้อมูลโภชนาการจาก External API พร้อม Retry, Timeout และ Fallback
 * @param {string} recipeName - ชื่อสูตรอาหาร
 * @returns {object} - ข้อมูลโภชนาการ หรือข้อมูล Fallback
 */
async function getNutritionInfo(recipeName) {
  // จำลอง URL ของ API ภายนอก
  // หากต้องการทดสอบ Failure Scenario:
  // ให้เปลี่ยน URL นี้เป็น 'https://httpstat.us/500' (Server Error) 
  // หรือ 'http://invalid-url-for-testing-timeout.local' (Timeout/Network Error)
  const EXTERNAL_API_URL = "https://dummyjson.com/recipes/search";
  
  const MAX_RETRIES = 2; // ลองใหม่ 2 ครั้ง (รวมแรกเป็น 3)
  const TIMEOUT_MS = 3000; // Timeout ที่ 3 วินาที

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`[Integration] Calling External API (Attempt ${attempt})...`);
      
      const response = await axios.get(EXTERNAL_API_URL, {
        params: { q: recipeName },
        timeout: TIMEOUT_MS 
      });

      // จำลองการใช้ข้อมูลจาก API
      if (response.data && response.data.recipes && response.data.recipes.length > 0) {
        return {
          source: 'external_api',
          calories: response.data.recipes[0].caloriesPerServing || 300,
          status: 'success'
        };
      } else {
        return {
          source: 'external_api',
          calories: 250, // ค่า default กรณีค้นหาไม่เจอใน dummy API
          status: 'success_no_data'
        };
      }
      
    } catch (error) {
      console.error(`[Integration] Attempt ${attempt} failed: ${error.message}`);
      
      // ตรวจสอบว่าเป็นครั้งสุดท้ายหรือยัง
      if (attempt > MAX_RETRIES) {
        console.warn(`[Integration] All retries failed. Using Fallback data.`);
        // Fallback: ส่งข้อมูลสำรองกลับไปแทนการพ่น 500
        return {
          source: 'fallback',
          calories: "N/A",
          message: "ไม่สามารถดึงข้อมูลโภชนาการได้ในขณะนี้ (External API is down)",
          status: 'fallback'
        };
      }

      // รอ 2 วินาทีก่อนลองใหม่ (Fixed Delay)
      console.log(`[Integration] Waiting 2 seconds before retry...`);
      await delay(2000);
    }
  }
}

module.exports = {
  getNutritionInfo
};
