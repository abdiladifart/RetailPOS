# دليل البدء السريع - RetailPOS

## 🚀 خطوات التشغيل السريع

### الخطوة 1: تثبيت PostgreSQL

#### على Ubuntu/Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# إنشاء قاعدة البيانات
sudo -u postgres psql -c "CREATE DATABASE retailpos_db;"
sudo -u postgres psql -c "CREATE USER retailpos_user WITH PASSWORD 'retailpos_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE retailpos_db TO retailpos_user;"
```

#### على Windows:
1. قم بتحميل PostgreSQL من: https://www.postgresql.org/download/windows/
2. قم بالتثبيت واتبع التعليمات
3. افتح pgAdmin أو psql وقم بتنفيذ:
```sql
CREATE DATABASE retailpos_db;
CREATE USER retailpos_user WITH PASSWORD 'retailpos_password';
GRANT ALL PRIVILEGES ON DATABASE retailpos_db TO retailpos_user;
```

### الخطوة 2: إعداد Backend

```bash
cd backend

# إنشاء virtual environment
python3 -m venv venv

# تفعيل virtual environment
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate  # Windows

# تثبيت المكتبات
pip install -r requirements.txt

# نسخ ملف الإعدادات
cp .env.example .env

# تهيئة قاعدة البيانات وإنشاء بيانات تجريبية
python init_db.py

# تشغيل السيرفر
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**✅ السيرفر يعمل الآن على:** http://localhost:8000

### الخطوة 3: إعداد Frontend

**في terminal جديد:**

```bash
cd frontend

# تثبيت المكتبات
npm install

# للتشغيل في المتصفح فقط
npm run dev

# أو للتشغيل مع Electron
npm run electron:dev
```

**✅ التطبيق يعمل الآن على:** http://localhost:5173

### الخطوة 4: تسجيل الدخول

افتح المتصفح على http://localhost:5173 واستخدم:

```
Username: admin
Password: admin123
```

## 📦 البيانات التجريبية

يتم إنشاء البيانات التالية تلقائياً:

### المستخدمين:
- **Admin**: username: `admin`, password: `admin123`

### المنتجات:
1. **T-Shirt Classic** - 150 ج.م (50 قطعة)
2. **Jeans Blue** - 350 ج.م (30 قطعة)
3. **Sneakers White** - 450 ج.م (20 قطعة)

## 🔧 استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات:
```bash
# تأكد من أن PostgreSQL يعمل
sudo systemctl status postgresql

# تأكد من بيانات الاتصال في ملف .env
DATABASE_URL=postgresql://retailpos_user:retailpos_password@localhost:5432/retailpos_db
```

### خطأ في تثبيت المكتبات:
```bash
# تأكد من تفعيل virtual environment
source venv/bin/activate

# أعد تثبيت المكتبات
pip install --upgrade pip
pip install -r requirements.txt
```

### Port 8000 مستخدم:
```bash
# استخدم port آخر
uvicorn main:app --reload --port 8001
```

## 📝 اختبار النظام

### 1. اختبار API مباشرة:
افتح http://localhost:8000/docs للوصول إلى Swagger UI

### 2. اختبار إضافة منتج:
```bash
curl -X POST "http://localhost:8000/api/products" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "2001",
    "name": "Test Product",
    "price": 100.00,
    "stock_quantity": 10
  }'
```

### 3. اختبار نقطة البيع:
1. سجل الدخول
2. اذهب إلى "نقطة البيع"
3. اضغط على منتج أو امسح باركود
4. أضف المنتجات للسلة
5. اضغط "إتمام الدفع"
6. أدخل المبلغ واختر طريقة الدفع
7. اضغط "تأكيد البيع"

## 🎯 الخطوات التالية

1. **تخصيص الألوان**: عدّل ملف `frontend/tailwind.config.js`
2. **إضافة منتجاتك**: استخدم صفحة "المنتجات" أو الـ API
3. **إعداد الطابعة**: راجع قسم Printer في الوثائق
4. **إعداد Barcode Scanner**: قم بتوصيل الماسح وجربه في صفحة POS

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع ملف README.md الرئيسي
2. تحقق من logs في terminal
3. افتح issue على GitHub

---

🎉 **مبروك! نظام RetailPOS جاهز للاستخدام**
