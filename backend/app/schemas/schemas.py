from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    CASHIER = "cashier"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CASHIER


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class User(UserInDB):
    pass


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# Product Schemas
class ProductBase(BaseModel):
    barcode: str
    name: str
    name_ar: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: float = Field(gt=0)
    cost: float = Field(ge=0, default=0)
    stock_quantity: int = Field(ge=0, default=0)
    min_stock: int = Field(ge=0, default=0)
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    min_stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductInDB(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Product(ProductInDB):
    pass


# Sale Item Schemas
class SaleItemBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)
    discount: float = Field(ge=0, default=0)


class SaleItemCreate(SaleItemBase):
    pass


class SaleItemInDB(SaleItemBase):
    id: int
    sale_id: int
    product_name: str
    total_price: float

    class Config:
        from_attributes = True


class SaleItem(SaleItemInDB):
    pass


# Sale Schemas
class SaleBase(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    payment_method: PaymentMethod
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    discount: float = Field(ge=0, default=0)
    amount_paid: float = Field(gt=0)


class SaleInDB(SaleBase):
    id: int
    invoice_number: str
    cashier_id: int
    subtotal: float
    tax: float
    discount: float
    total: float
    amount_paid: float
    change_amount: float
    is_synced: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Sale(SaleInDB):
    items: List[SaleItem] = []
    cashier: Optional[User] = None


# Dashboard/Reports Schemas
class DashboardStats(BaseModel):
    total_sales_today: float
    total_transactions_today: int
    low_stock_products: int
    total_products: int


class SalesReport(BaseModel):
    date: str
    total_sales: float
    total_transactions: int
    cash_sales: float
    card_sales: float


class ProductSalesReport(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    total_revenue: float
