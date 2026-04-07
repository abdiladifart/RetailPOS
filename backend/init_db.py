from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine, sqlite_engine
from app.models.models import User, Product, Sale, SaleItem, Settings
from app.core.security import get_password_hash


def init_db():
    """Initialize database tables"""
    print("Creating database tables...")
    
    # Create tables for both PostgreSQL and SQLite
    Base.metadata.create_all(bind=engine)
    Base.metadata.create_all(bind=sqlite_engine)
    
    print("Database tables created successfully!")


def create_default_admin(db: Session):
    """Create default admin user"""
    admin = db.query(User).filter(User.username == "admin").first()
    
    if not admin:
        admin = User(
            username="admin",
            email="admin@retailpos.com",
            full_name="System Administrator",
            role="admin",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Default admin created: username=admin, password=admin123")
    else:
        print("Admin user already exists")


def create_sample_products(db: Session):
    """Create sample products for testing"""
    products = [
        {
            "barcode": "1001",
            "name": "T-Shirt Classic",
            "name_ar": "تيشيرت كلاسيك",
            "category": "Clothing",
            "price": 150.00,
            "cost": 80.00,
            "stock_quantity": 50
        },
        {
            "barcode": "1002",
            "name": "Jeans Blue",
            "name_ar": "جينز أزرق",
            "category": "Clothing",
            "price": 350.00,
            "cost": 200.00,
            "stock_quantity": 30
        },
        {
            "barcode": "1003",
            "name": "Sneakers White",
            "name_ar": "حذاء رياضي أبيض",
            "category": "Footwear",
            "price": 450.00,
            "cost": 250.00,
            "stock_quantity": 20
        }
    ]
    
    for prod_data in products:
        existing = db.query(Product).filter(Product.barcode == prod_data["barcode"]).first()
        if not existing:
            product = Product(**prod_data)
            db.add(product)
    
    db.commit()
    print(f"Sample products created!")


if __name__ == "__main__":
    from app.db.session import SessionLocal
    
    # Initialize database
    init_db()
    
    # Create default data
    db = SessionLocal()
    try:
        create_default_admin(db)
        create_sample_products(db)
    finally:
        db.close()
    
    print("\n✅ Database initialization completed!")
    print("You can now start the server with: uvicorn main:app --reload")
