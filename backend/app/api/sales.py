from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, date

from app.db.session import get_db
from app.models.models import Sale, SaleItem, Product, User
from app.schemas.schemas import (
    Sale as SaleSchema,
    SaleCreate,
    DashboardStats,
    SalesReport
)
from app.api.auth import get_current_user

router = APIRouter()


def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"INV-{timestamp}"


@router.post("/", response_model=SaleSchema)
async def create_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new sale"""
    # Validate products and calculate totals
    subtotal = 0
    sale_items = []
    
    for item in sale_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )
        
        item_total = (item.unit_price * item.quantity) - item.discount
        subtotal += item_total
        
        sale_items.append({
            "product_id": item.product_id,
            "product_name": product.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "discount": item.discount,
            "total_price": item_total
        })
        
        # Update stock
        product.stock_quantity -= item.quantity
    
    # Calculate tax (15% VAT for Egypt)
    tax = subtotal * 0.15
    total = subtotal + tax - sale_data.discount
    
    # Calculate change
    change = sale_data.amount_paid - total
    if change < 0:
        raise HTTPException(status_code=400, detail="Insufficient payment amount")
    
    # Create sale
    db_sale = Sale(
        invoice_number=generate_invoice_number(),
        cashier_id=current_user.id,
        customer_name=sale_data.customer_name,
        customer_phone=sale_data.customer_phone,
        subtotal=subtotal,
        tax=tax,
        discount=sale_data.discount,
        total=total,
        payment_method=sale_data.payment_method,
        amount_paid=sale_data.amount_paid,
        change_amount=change,
        notes=sale_data.notes
    )
    
    db.add(db_sale)
    db.flush()
    
    # Create sale items
    for item_data in sale_items:
        db_item = SaleItem(sale_id=db_sale.id, **item_data)
        db.add(db_item)
    
    db.commit()
    db.refresh(db_sale)
    
    return db_sale


@router.get("/", response_model=List[SaleSchema])
async def get_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sales with optional date filters"""
    query = db.query(Sale)
    
    if start_date:
        query = query.filter(func.date(Sale.created_at) >= start_date)
    
    if end_date:
        query = query.filter(func.date(Sale.created_at) <= end_date)
    
    sales = query.order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/{sale_id}", response_model=SaleSchema)
async def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sale by ID"""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.get("/invoice/{invoice_number}", response_model=SaleSchema)
async def get_sale_by_invoice(
    invoice_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sale by invoice number"""
    sale = db.query(Sale).filter(Sale.invoice_number == invoice_number).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    today = date.today()
    
    # Today's sales
    today_sales = db.query(func.sum(Sale.total)).filter(
        func.date(Sale.created_at) == today
    ).scalar() or 0
    
    # Today's transactions
    today_transactions = db.query(func.count(Sale.id)).filter(
        func.date(Sale.created_at) == today
    ).scalar() or 0
    
    # Low stock products
    low_stock = db.query(func.count(Product.id)).filter(
        Product.stock_quantity <= Product.min_stock,
        Product.is_active == True
    ).scalar() or 0
    
    # Total products
    total_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True
    ).scalar() or 0
    
    return {
        "total_sales_today": today_sales,
        "total_transactions_today": today_transactions,
        "low_stock_products": low_stock,
        "total_products": total_products
    }


@router.get("/reports/daily", response_model=List[SalesReport])
async def get_daily_sales_report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily sales report"""
    sales = db.query(
        func.date(Sale.created_at).label('date'),
        func.sum(Sale.total).label('total_sales'),
        func.count(Sale.id).label('total_transactions'),
        func.sum(func.case((Sale.payment_method == 'cash', Sale.total), else_=0)).label('cash_sales'),
        func.sum(func.case((Sale.payment_method == 'card', Sale.total), else_=0)).label('card_sales')
    ).filter(
        and_(
            func.date(Sale.created_at) >= start_date,
            func.date(Sale.created_at) <= end_date
        )
    ).group_by(func.date(Sale.created_at)).all()
    
    return [
        {
            "date": str(sale.date),
            "total_sales": sale.total_sales or 0,
            "total_transactions": sale.total_transactions or 0,
            "cash_sales": sale.cash_sales or 0,
            "card_sales": sale.card_sales or 0
        }
        for sale in sales
    ]
