# RetailPOS - نظام نقاط البيع الحديث

نظام POS متكامل للمحلات التجارية (Retail) مع دعم العمل Online/Offline

## 🚀 المميزات

### ✅ المميزات المنفذة (MVP)
- 🔐 نظام تسجيل دخول آمن (JWT)
- 🛒 واجهة كاشير حديثة وسريعة
- 📦 إدارة المخزون الكاملة
- 🔍 دعم Barcode Scanner
- 💰 طرق دفع متعددة (كاش / بطاقة)
- 📊 لوحة تحكم بالإحصائيات
- 👥 إدارة المستخدمين (Admin / Cashier)
- 🧾 نظام الفواتير
- 💾 دعم Offline Mode (SQLite)
- 🔄 مزامنة تلقائية مع السيرفر

### 🎨 التصميم
- واجهة عصرية مستوحاة من Foodics
- ألوان مريحة للعين
- دعم كامل للغة العربية (RTL)
- Responsive Design

## 📋 المتطلبات

### Backend
- Python 3.10+
- PostgreSQL 14+
- pip

### Frontend
- Node.js 18+
- npm أو yarn

## ⚙️ التثبيت والإعداد

### 1. إعداد قاعدة البيانات

```bash
# تثبيت PostgreSQL وإنشاء قاعدة البيانات
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql

CREATE DATABASE retailpos_db;
CREATE USER retailpos_user WITH PASSWORD 'retailpos_password';
GRANT ALL PRIVILEGES ON DATABASE retailpos_db TO retailpos_user;
\q
```

### 2. إعداد Backend

```bash
cd backend

# إنشاء virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate  # Windows

# تثبيت المكتبات
pip install -r requirements.txt

# نسخ ملف البيئة
cp .env.example .env

# تعديل ملف .env بالإعدادات الصحيحة
nano .env

# تهيئة قاعدة البيانات
python init_db.py

# تشغيل السيرفر
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. إعداد Frontend

```bash
cd frontend

# تثبيت المكتبات
npm install

# تشغيل في وضع التطوير
npm run dev

# أو تشغيل مع Electron
npm run electron:dev
```

## 🔑 بيانات الدخول الافتراضية

```
Username: admin
Password: admin123
```

## 📁 هيكل المشروع

```
RetailPOS/
├── backend/
│   ├── app/
│   │   ├── api/          # API Endpoints
│   │   ├── core/         # Core utilities
│   │   ├── db/           # Database config
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── main.py           # FastAPI app
│   ├── init_db.py        # DB initialization
│   └── requirements.txt
│
├── frontend/
│   ├── electron/         # Electron main process
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Pages
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand stores
│   │   └── styles/       # CSS styles
│   ├── package.json
│   └── vite.config.js
│
└── docs/                 # Documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - معلومات المستخدم الحالي
- `POST /api/auth/logout` - تسجيل الخروج

### Products
- `GET /api/products` - جلب كل المنتجات
- `GET /api/products/{id}` - جلب منتج محدد
- `GET /api/products/barcode/{barcode}` - البحث بالباركود
- `POST /api/products` - إضافة منتج (Admin)
- `PUT /api/products/{id}` - تعديل منتج (Admin)
- `DELETE /api/products/{id}` - حذف منتج (Admin)

### Sales
- `POST /api/sales` - إنشاء عملية بيع
- `GET /api/sales` - جلب المبيعات
- `GET /api/sales/{id}` - جلب فاتورة محددة
- `GET /api/sales/dashboard/stats` - إحصائيات Dashboard

### Users
- `GET /api/users` - جلب المستخدمين (Admin)
- `POST /api/users` - إضافة مستخدم (Admin)
- `PUT /api/users/{id}` - تعديل مستخدم (Admin)
- `DELETE /api/users/{id}` - حذف مستخدم (Admin)

## 🛠️ التطوير

### إضافة منتج جديد

```python
# عبر API
POST /api/products
{
  "barcode": "1234567890",
  "name": "قميص أبيض",
  "name_ar": "قميص أبيض",
  "category": "ملابس",
  "price": 150.00,
  "cost": 80.00,
  "stock_quantity": 50
}
```

### إتمام عملية بيع

```python
POST /api/sales
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 150.00,
      "discount": 0
    }
  ],
  "payment_method": "cash",
  "amount_paid": 350.00,
  "discount": 0
}
```

## 📱 دعم Offline Mode

النظام يدعم العمل offline تلقائياً:

1. **عند انقطاع الإنترنت**: يتحول النظام تلقائياً إلى SQLite
2. **التخزين المؤقت**: جميع العمليات تُخزن محلياً
3. **المزامنة التلقائية**: عند عودة الإنترنت، تتم المزامنة تلقائياً

## 🖨️ طباعة الفواتير

النظام جاهز للتكامل مع:
- Thermal Printers (80mm)
- طابعات USB
- طابعات Network

## 🔒 الأمان

- تشفير كلمات المرور (bcrypt)
- JWT tokens للمصادقة
- HTTPS في Production
- SQL injection protection
- XSS protection

## 📊 قاعدة البيانات

### Models الرئيسية

1. **User** - المستخدمين
2. **Product** - المنتجات
3. **Sale** - الفواتير
4. **SaleItem** - عناصر الفاتورة
5. **Settings** - الإعدادات

## 🚀 Build للإنتاج

### Backend
```bash
# استخدم Gunicorn للإنتاج
pip install gunicorn
gunicorn main:app --workers 4 --bind 0.0.0.0:8000
```

### Frontend (Electron)
```bash
npm run build
npm run electron:build
```

## 🔮 المميزات القادمة

- [ ] التقارير المتقدمة (Excel Export)
- [ ] إدارة العملاء
- [ ] نظام الولاء
- [ ] تكامل مع Payment Gateways
- [ ] دعم الفروع المتعددة
- [ ] تطبيق موبايل
- [ ] Backup تلقائي

## 📝 الترخيص

MIT License - مفتوح المصدر

## 👨‍💻 المطور

**Lutfi**
- Email: lutfi@example.com
- GitHub: @lutfi

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:

1. Fork المشروع
2. إنشاء feature branch
3. Commit التغييرات
4. Push إلى البranch
5. فتح Pull Request

---

