# แผนการเตรียมระบบขึ้นใช้งานจริง (Production Deployment Plan)

ระบบนี้จะย้ายจากแบบจำลองในเครื่อง (Mock Client State) ไปสู่แอปพลิเคชันจริงโดยใช้ฐานข้อมูล PostgreSQL และควบคุมเวอร์ชันผ่าน GitHub

---

## 🗄️ 1. โครงสร้างฐานข้อมูล PostgreSQL (Database Schema Design)

ข้อมูลระบบจะถูกเก็บบนฐานข้อมูลเชิงสัมพันธ์ PostgreSQL แบ่งออกเป็นตาราง `kols` และ `campaigns`

### 1.1 ตาราง `kols` (ข้อมูลผู้ใช้งาน/อินฟลูเอนเซอร์)
```sql
CREATE TABLE kols (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- TIKTOK, INSTAGRAM, YOUTUBE, FACEBOOK
    followers INT DEFAULT 0,
    status VARCHAR(100) NOT NULL, -- 1. รอเซ็นสัญญา, 2. กำลังผลิตดราฟต์, 3. รอแบรนด์ตรวจ, 4. รอโพสต์จริง, 5. ออนแอร์แล้ว
    contact VARCHAR(255),
    client_price INT DEFAULT 0,
    net_cost INT DEFAULT 0,
    profit INT GENERATED ALWAYS AS (client_price - net_cost) STORED,
    behavioral_remark TEXT,
    deal_conditions TEXT,
    draft_deadline DATE,
    live_deadline DATE,
    draft_link VARCHAR(500),
    live_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 ตาราง `campaigns` (ตารางบริหารแคมเปญและการเงิน)
```sql
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    product_name VARCHAR(255),
    usp TEXT,
    target_audience TEXT,
    tone VARCHAR(100),
    budget INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, ARCHIVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางเชื่อมความสัมพันธ์แบบ Many-to-Many ระหว่าง campaigns และ kols
CREATE TABLE campaign_kols (
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    kol_id VARCHAR(50) REFERENCES kols(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, kol_id)
);
```

---

## 🚀 2. การควบคุมเวอร์ชันและท่อส่งซอฟต์แวร์ด้วย GitHub
- ย้ายการจัดการโค้ดขึ้น **GitHub** แทนระบบเดิม
- รันระบบทดสอบและตรวจสอบความเรียบร้อยของโค้ดด้วย **GitHub Actions** (ไฟล์ `.github/workflows/ci.yml`)
- ระบบจะทำหน้าที่ตรวจสอบคุณภาพโค้ด (Linting) และการคอมไพล์ไทป์สคริปต์ก่อนปล่อยงานจริง

---

## 🛠️ 3. แผนงานปรับปรุงโค้ดระบบหลังบ้าน (Backend Server Setup)
- ติดตั้งไลบรารี `pg` และ `@types/pg` ในโปรเจกต์
- เขียนโมดูลเชื่อมต่อฐานข้อมูลโดยดึงค่าจากตัวแปรสภาพแวดล้อม `DATABASE_URL`
- เพิ่ม API Endpoints สำหรับดำเนินการทางสถิติและข้อมูล:
  - `GET /api/kols` (เรียกดูรายการทั้งหมด)
  - `POST /api/kols` (เพิ่มรายใหม่)
  - `PUT /api/kols/:id` (แก้ไขข้อมูล/สถานะ)
  - `DELETE /api/kols/:id` (ลบรายการ)
