import { useEffect } from 'react';
import { useSalesStore } from '../store';
import { 
  TrendingUp, ShoppingBag, AlertTriangle, Package,
  DollarSign, Users, Calendar 
} from 'lucide-react';

export default function Dashboard() {
  const { dashboardStats, fetchDashboardStats } = useSalesStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const stats = dashboardStats || {
    total_sales_today: 0,
    total_transactions_today: 0,
    low_stock_products: 0,
    total_products: 0,
  };

  const statCards = [
    {
      title: 'مبيعات اليوم',
      value: `${stats.total_sales_today.toFixed(2)} ج.م`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'المعاملات اليوم',
      value: stats.total_transactions_today,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'مخزون منخفض',
      value: stats.low_stock_products,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'إجمالي المنتجات',
      value: stats.total_products,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً بك في نظام RetailPOS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
            <TrendingUp className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium">التقارير</span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
            <Package className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium">المنتجات</span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
            <ShoppingBag className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium">المبيعات</span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
            <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <span className="text-sm font-medium">المستخدمين</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">النشاط الأخير</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">عملية بيع جديدة</p>
              <p className="text-sm text-gray-500">منذ 5 دقائق</p>
            </div>
            <span className="font-bold text-green-600">250.00 ج.م</span>
          </div>
        </div>
      </div>
    </div>
  );
}
