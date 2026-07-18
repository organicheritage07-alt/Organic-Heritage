import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:5000/api';

    const fetchCart = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setCartItems(response.data.items || []);
                setTotal(response.data.total || 0);
                
                const count = response.data.items?.reduce(
                    (acc, item) => acc + item.quantity, 0
                ) || 0;
                setItemCount(count);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                setCartItems([]);
                setTotal(0);
                setItemCount(0);
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ OPEN CART FUNCTION
    const openCart = () => {
        setIsCartOpen(true);
    };

    // ✅ CLOSE CART FUNCTION
    const closeCart = () => {
        setIsCartOpen(false);
    };

    // ✅ TOGGLE CART FUNCTION
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    // ✅ UPDATED ADD TO CART - WITH LOGIN CHECK
    const addToCart = async (productId, quantity = 1) => {
        // ✅ CHECK IF USER IS LOGGED IN
        const token = localStorage.getItem('token');
        
        if (!token) {
            // ✅ Save current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            
            // ✅ Show toast message
            toast.error('Please login to add items to your cart', {
                duration: 3000,
                style: {
                    background: '#1B2E1A',
                    color: '#ffffff',
                    borderRadius: '8px',
                },
                icon: '🔒'
            });
            
            // ✅ Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            
            return false;
        }

        try {
            const response = await axios.post(`${API_URL}/cart`, 
                { productId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                toast.success('Added to cart! 🛒', {
                    duration: 2000,
                    style: {
                        background: '#2D6A4F',
                        color: '#ffffff',
                        borderRadius: '8px',
                    }
                });
                await fetchCart();
                // ✅ Open cart drawer after adding
                setIsCartOpen(true);
                return true;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            
            // ✅ Handle specific errors
            if (error.response?.status === 401) {
                toast.error('Please login to add items to your cart');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else {
                toast.error(error.response?.data?.message || 'Failed to add to cart');
            }
            return false;
        }
    };

    const updateQuantity = async (cartId, quantity) => {
        try {
            const response = await axios.put(`${API_URL}/cart/${cartId}`,
                { quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                await fetchCart();
                return true;
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
            return false;
        }
    };

    const removeFromCart = async (cartId) => {
        try {
            const response = await axios.delete(`${API_URL}/cart/${cartId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success('Item removed from cart');
                await fetchCart();
                return true;
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item');
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const response = await axios.delete(`${API_URL}/cart/clear/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setCartItems([]);
                setTotal(0);
                setItemCount(0);
                toast.success('Cart cleared');
                return true;
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
            return false;
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    useEffect(() => {
        const newTotal = cartItems.reduce((sum, item) => {
            return sum + (item.product?.price || 0) * item.quantity;
        }, 0);
        setTotal(newTotal);

        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setItemCount(count);
    }, [cartItems]);

    const value = {
        cartItems,
        loading,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};