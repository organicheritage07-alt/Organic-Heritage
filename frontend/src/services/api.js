import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

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

export const productAPI = {
    getAll: () => api.get('/products'),
    getOne: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories/all')
};

export const authAPI = {
    login: (email, password) => 
        api.post('/auth/login', { email, password }),
    register: (userData) => 
        api.post('/auth/verify-otp-register', userData),
    getProfile: () => 
        api.get('/auth/profile')
};

export default api;