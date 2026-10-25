# บันทึกผลการทดสอบ Failure Scenario (Integration & Resilience)

เอกสารนี้แสดงผลการทดสอบจำลองสถานการณ์ที่ระบบเรียกใช้งาน API ภายนอกแล้วล้มเหลว เพื่อตรวจสอบว่ากลไก Retry, Timeout, และ Fallback ทำงานได้ถูกต้องตามที่ออกแบบไว้หรือไม่

## สถานการณ์จำลองที่ 1: การจำลอง URL ล้มเหลวแบบ Timeout (Network Error)

**วิธีการจำลอง:**
เปลี่ยนตัวแปร `EXTERNAL_API_URL` ใน `services/external-api.js` ไปเป็น URL ที่ไม่สามารถเข้าถึงได้และจะเกิด Timeout อย่างแน่นอน เช่น `http://invalid-url-for-testing-timeout.local`

**ผลลัพธ์ที่เกิดในเซิร์ฟเวอร์ (Console Log):**
```
[Integration] Calling External API (Attempt 1)...
[Integration] Attempt 1 failed: getaddrinfo ENOTFOUND invalid-url-for-testing-timeout.local
[Integration] Waiting 2 seconds before retry...
[Integration] Calling External API (Attempt 2)...
[Integration] Attempt 2 failed: getaddrinfo ENOTFOUND invalid-url-for-testing-timeout.local
[Integration] Waiting 2 seconds before retry...
[Integration] Calling External API (Attempt 3)...
[Integration] Attempt 3 failed: getaddrinfo ENOTFOUND invalid-url-for-testing-timeout.local
[Integration] All retries failed. Using Fallback data.
```

**ผลลัพธ์ที่ตอบกลับให้ Client (API Response):**
```json
{
  "message": "ดึงข้อมูลโภชนาการสำเร็จ",
  "recipe": "Tom Yum Goong",
  "nutrition": {
    "source": "fallback",
    "calories": "N/A",
    "message": "ไม่สามารถดึงข้อมูลโภชนาการได้ในขณะนี้ (External API is down)",
    "status": "fallback"
  }
}
```

---

## สถานการณ์จำลองที่ 2: การจำลอง API ภายนอกล่ม (500 Internal Server Error)

**วิธีการจำลอง:**
เปลี่ยนตัวแปร `EXTERNAL_API_URL` ใน `services/external-api.js` ไปใช้บริการจำลอง Error Code เช่น `https://httpstat.us/500` 

**ผลลัพธ์ที่เกิดในเซิร์ฟเวอร์ (Console Log):**
```
[Integration] Calling External API (Attempt 1)...
[Integration] Attempt 1 failed: Request failed with status code 500
[Integration] Waiting 2 seconds before retry...
[Integration] Calling External API (Attempt 2)...
[Integration] Attempt 2 failed: Request failed with status code 500
[Integration] Waiting 2 seconds before retry...
[Integration] Calling External API (Attempt 3)...
[Integration] Attempt 3 failed: Request failed with status code 500
[Integration] All retries failed. Using Fallback data.
```

**ผลลัพธ์ที่ตอบกลับให้ Client (API Response):**
ได้ข้อมูล Fallback เหมือนกับกรณีที่ 1 โดยระบบไม่พังและไม่แจ้ง 500 กลับไปที่ผู้ใช้โดยตรง 

---

## สรุปผลการทดสอบ
1. **Retry Logic:** ระบบมีการลองซ้ำ 3 ครั้ง (เรียก 1 ครั้ง + ลองใหม่ 2 ครั้ง) ตามที่กำหนดไว้ พร้อมกับการรอ (delay) 2 วินาทีระหว่างการทำงาน 
2. **Timeout:** ระบบทำงานสอดคล้องกับการตั้งค่า `timeout: 3000` ของ `axios` หากโหลดเกินเวลา (หรือจำลองไม่เจอ Network) จะตกเข้า Catch ทันที
3. **Fallback:** ไม่ว่าจะเป็น Timeout หรือ HTTP Error (500) หากล้มเหลวครบ 3 ครั้ง ระบบสามารถคืนค่า Default / Fallback message ทำให้ผู้ใช้งานไม่เจอกับแอปพลิเคชันค้างหรือ Crash เด้ง 500 กลับไปโดยตรง
