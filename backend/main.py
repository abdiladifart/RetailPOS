from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from app.api import auth, products, sales, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup if not exists"""
    db_file = Path("retailpos.db")
    if not db_file.exists():
        print("🔄 Database not found, initializing...")
        # Import here to avoid circular imports
        from app.db.session import engine, Base, SessionLocal
        from app.models.models import User, Product
        from app.core.security import get_password_hash

        # Create tables
        Base.metadata.create_all(bind=engine)

        # Create admin user
        db = SessionLocal()
        try:
            admin = User(
                username="admin",
                email="admin@retailpos.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role="ADMIN",
                is_active=True
            )
            db.add(admin)

            # Create sample products
            products_list = [
                Product(barcode="1001", name="T-Shirt Classic", name_ar="تيشيرت كلاسيك",
                        category="Clothing", price=150.0, cost=80.0, stock_quantity=50, is_active=True),
                Product(barcode="1002", name="Jeans Blue", name_ar="جينز أزرق",
                        category="Clothing", price=350.0, cost=200.0, stock_quantity=30, is_active=True),
                Product(barcode="1003", name="Sneakers White", name_ar="حذاء رياضي أبيض",
                        category="Footwear", price=450.0, cost=250.0, stock_quantity=20, is_active=True),
            ]
            for product in products_list:
                db.add(product)

            db.commit()
            print("✅ Database initialized successfully!")
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            db.rollback()
        finally:
            db.close()

    yield


# Create FastAPI app with lifespan
app = FastAPI(
    title="RetailPOS API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://retailpos-69vc.onrender.com",
        "https://*.vercel.app",
        "https://retail-pos-liard.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to RetailPOS API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
