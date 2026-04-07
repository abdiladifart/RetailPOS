import { create } from 'zustand';
import { authAPI, productsAPI, salesAPI } from '../services/api';

// Auth Store
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  
  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('access_token', data.access_token);
      const userResponse = await authAPI.getCurrentUser();
      set({ user: userResponse.data, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  },
  
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    
    try {
      const { data } = await authAPI.getCurrentUser();
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));

// Cart Store
export const useCartStore = create((set, get) => ({
  items: [],
  discount: 0,
  
  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find(item => item.product_id === product.id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        items: [...items, {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          discount: 0,
          stock_available: product.stock_quantity,
        }],
      });
    }
  },
  
  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.product_id !== productId) });
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set({
      items: get().items.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      ),
    });
  },
  
  updateItemDiscount: (productId, discount) => {
    set({
      items: get().items.map(item =>
        item.product_id === productId ? { ...item, discount } : item
      ),
    });
  },
  
  setDiscount: (discount) => set({ discount }),
  
  clearCart: () => set({ items: [], discount: 0 }),
  
  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity - item.discount);
    }, 0);
  },
  
  getTax: () => {
    return get().getSubtotal() * 0.15; // 15% VAT
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getTax() - get().discount;
  },
}));

// Products Store
export const useProductsStore = create((set) => ({
  products: [],
  categories: [],
  loading: false,
  
  fetchProducts: async (params) => {
    set({ loading: true });
    try {
      const { data } = await productsAPI.getAll(params);
      set({ products: data, loading: false });
    } catch (error) {
      console.error('Fetch products error:', error);
      set({ loading: false });
    }
  },
  
  fetchCategories: async () => {
    try {
      const { data } = await productsAPI.getCategories();
      set({ categories: data });
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  },
  
  searchProduct: async (barcode) => {
    try {
      const { data } = await productsAPI.getByBarcode(barcode);
      return data;
    } catch (error) {
      return null;
    }
  },
}));

// Sales Store
export const useSalesStore = create((set) => ({
  sales: [],
  dashboardStats: null,
  loading: false,
  
  createSale: async (saleData) => {
    set({ loading: true });
    try {
      const { data } = await salesAPI.create(saleData);
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Sale creation failed' 
      };
    }
  },
  
  fetchDashboardStats: async () => {
    try {
      const { data } = await salesAPI.getDashboardStats();
      set({ dashboardStats: data });
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  },
  
  fetchSales: async (params) => {
    set({ loading: true });
    try {
      const { data } = await salesAPI.getAll(params);
      set({ sales: data, loading: false });
    } catch (error) {
      console.error('Fetch sales error:', error);
      set({ loading: false });
    }
  },
}));
