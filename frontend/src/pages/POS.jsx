import { useState, useEffect, useRef } from 'react';
import { useCartStore, useProductsStore, useSalesStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, Banknote, Receipt, X 
} from 'lucide-react';

export default function POS() {
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const barcodeInputRef = useRef(null);

  const { user } = useAuthStore();
  const { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    getSubtotal, 
    getTax, 
    getTotal, 
    clearCart,
    discount
  } = useCartStore();
  
  const { products, fetchProducts, searchProduct } = useProductsStore();
  const { createSale } = useSalesStore();

  useEffect(() => {
    fetchProducts({ limit: 100 });
  }, []);

  // Auto-focus barcode input
  useEffect(() => {
    if (!showPayment) {
      barcodeInputRef.current?.focus();
    }
  }, [showPayment, items]);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const product = await searchProduct(barcode);
    if (product) {
      addItem(product);
      toast.success(`تمت إضافة ${product.name}`);
      setBarcode('');
    } else {
      toast.error('المنتج غير موجود');
    }
  };

  const handleProductClick = (product) => {
    addItem(product);
    toast.success(`تمت إضافة ${product.name}`);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    setShowPayment(true);
    setAmountPaid(getTotal().toFixed(2));
  };

  const handleCompleteSale = async () => {
    const total = getTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paid < total) {
      toast.error('المبلغ المدفوع غير كافٍ');
      return;
    }

    const saleData = {
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount
      })),
      payment_method: paymentMethod,
      amount_paid: paid,
      discount: discount,
      customer_name: customerName || null,
    };

    const result = await createSale(saleData);
    
    if (result.success) {
      toast.success('تمت عملية البيع بنجاح');
      
      // Print receipt (will implement later)
      console.log('Print receipt:', result.data);
      
      // Clear cart and reset
      clearCart();
      setShowPayment(false);
      setAmountPaid('');
      setCustomerName('');
      setPaymentMethod('cash');
    } else {
      toast.error(result.error || 'فشلت عملية البيع');
    }
  };

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const change = parseFloat(amountPaid || 0) - total;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="ابحث عن منتج..."
              />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="flex-1">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="امسح الباركود..."
                dir="ltr"
              />
            </form>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white p-4 rounded-lg shadow-soft hover:shadow-card transition-shadow text-right"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.stock_quantity} متوفر
                </p>
                <p className="text-lg font-bold text-primary-600">
                  {product.price.toFixed(2)} ج.م
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white shadow-xl flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            السلة ({items.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>السلة فارغة</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 flex-1">
                    {item.product_name}
                  </h3>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 bg-white rounded border hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 bg-white rounded border hover:bg-gray-100"
                      disabled={item.quantity >= item.stock_available}
                    >
                      <Plus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                  
                  <span className="font-bold text-gray-900">
                    {(item.unit_price * item.quantity - item.discount).toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-4 border-t space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span className="font-medium">{subtotal.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الضريبة (15%)</span>
              <span className="font-medium">{tax.toFixed(2)} ج.م</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الخصم</span>
                <span className="font-medium">-{discount.toFixed(2)} ج.م</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-lg font-bold pt-3 border-t">
            <span>الإجمالي</span>
            <span className="text-primary-600">{total.toFixed(2)} ج.م</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Receipt className="w-5 h-5" />
            إتمام الدفع
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">إتمام الدفع</h2>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العميل (اختياري)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الدفع
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">نقدي</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">بطاقة</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ المدفوع
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  dir="ltr"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">{total.toFixed(2)} ج.م</span>
                </div>
                {change >= 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الباقي</span>
                    <span className="font-bold">{change.toFixed(2)} ج.م</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCompleteSale}
                className="w-full bg-success hover:bg-success-dark text-white font-medium py-3 rounded-lg transition-colors"
              >
                تأكيد البيع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
