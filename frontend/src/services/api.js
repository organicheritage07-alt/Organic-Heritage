import axios from 'axios';

// ✅ Environment variable use karein, fallback bhi diya hai
const API_URL = import.meta.env.VITE_API_URL || 'https://organic-heritage.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor - Token attach karein
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - 401 error handle karein
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ Cart APIs ============
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (productId, quantity = 1) => 
        api.post('/cart', { productId, quantity }),
    updateQuantity: (cartId, quantity) => 
        api.put(`/cart/${cartId}`, { quantity }),
    removeFromCart: (cartId) => 
        api.delete(`/cart/${cartId}`),
    clearCart: () => 
        api.delete('/cart/clear/all')
};

// ============ Product APIs ============
export const productAPI = {
    getAll: () => api.get('/products'),
    getOne: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories/all')
};

// ============ Auth APIs ============
export const authAPI = {
    login: (email, password) => 
        api.post('/auth/login', { email, password }),
    register: (userData) => 
        api.post('/auth/verify-otp-register', userData),
    getProfile: () => 
        api.get('/auth/profile')
};

// ============ Benefits APIs ============
export const benefitsAPI = {
    getAll: () => api.get('/benefits')
};

// ============ Ingredients APIs ============
export const ingredientsAPI = {
    getAll: () => api.get('/ingredients')
};

// ============ Reviews APIs ============
export const reviewsAPI = {
    getAll: () => api.get('/reviews'),
    create: (data) => api.post('/reviews', data)
};

// ============ Orders APIs ============
export const ordersAPI = {
    getAll: () => api.get('/orders'),
    create: (data) => api.post('/orders', data),
    getOne: (id) => api.get(`/orders/${id}`)
};

// ============ Contact APIs ============
export const contactAPI = {
    send: (data) => api.post('/contact', data)
};

// Default export
export default api;