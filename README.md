# Time Attendance Frontend

นี่คือ README สำหรับโปรเจค Frontend ของระบบ Time Attendance (React + Bootstrap) เพื่อให้เพื่อนของคุณสามารถโคลนและรันโปรเจคได้

---

## 1. Requirements

- Node.js >= 18
- npm หรือ yarn
- Backend Spring Boot รันอยู่ (สามารถใช้ ngrok สำหรับ expose server)

---

## 2. โคลนโปรเจค

```bash
git clone <your-repo-url>
cd frontend-pyp
```

---

## 3. ติดตั้ง dependencies

```bash
npm install
```

---

## 4. ตั้งค่า environment variables

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```
REACT_APP_API_URL=http://localhost:8080/api
```

> ถ้า backend ใช้ ngrok ให้เปลี่ยนเป็น URL ของ ngrok เช่น:
>
```
REACT_APP_API_URL=https://<your-ngrok-id>.ngrok-free.app/api
```

---

## 5. รันโปรเจค

```bash
npm start
```

โปรเจคจะรันที่ `http://localhost:3000`

---

## 6. การใช้งาน

- หน้า Login: เข้าสู่ระบบด้วย email/username และ password
- Admin Dashboard: ดูรายชื่อผู้ใช้, CRUD ผู้ใช้
- User Dashboard: เช็กเวลา Clock In / Clock Out

---

## 7. Tips

- ทุกครั้งที่เปลี่ยนค่าใน `.env` ต้อง **restart** React server
- ตรวจสอบว่า backend รันอยู่และสามารถเข้าถึงได้จาก frontend (localhost หรือ ngrok)
- หากเกิด CORS หรือ 403 ให้ตรวจสอบ token และ role ของผู้ใช้

---

## 8. API Usage

- `POST /register` : ลงทะเบียนผู้ใช้
- `POST /login` : เข้าสู่ระบบ
- `GET /attendance/my` : ดึงประวัติการเข้า-ออกของตัวเอง
- `POST /attendance/clockin` : บันทึกเวลาเข้า
- `POST /attendance/clockout` : บันทึกเวลาออก
- `GET /admin/users` : ดึงผู้ใช้ทั้งหมด (ADMIN)
- `POST /admin/users` : สร้างผู้ใช้ใหม่ (ADMIN)
- `PUT /admin/users/{id}` : แก้ไขผู้ใช้ (ADMIN)
- `DELETE /admin/users/{id}` : ลบผู้ใช้ (ADMIN)

"# TimeAttendance-FrontEnd" 
