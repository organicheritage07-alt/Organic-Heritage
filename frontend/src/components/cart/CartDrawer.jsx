import React, { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaPlus, FaMinus, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cartItems, loading, total, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleQuantityChange = (cartId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return;
        updateQuantity(cartId, newQuantity);
    };

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    const formatPrice = (price) => {
        return `Rs ${Number(price).toLocaleString('en-PK')}`;
    };

    return (
        <>
            {/* Overlay */}
            <div className={`cart-drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />

            {/* Drawer */}
            <div ref={drawerRef} className={`cart-drawer ${isOpen ? 'open' : ''}`}>
                <div className="cart-drawer-header">
                    <h3>
                        <FaShoppingCart /> Your Cart ({cartItems.length})
                    </h3>
                    <button className="cart-drawer-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cart-drawer-body">
                    {loading ? (
                        <div className="cart-drawer-loading">
                            <div className="spinner"></div>
                            <p>Loading cart...</p>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <FaShoppingCart size={48} />
                            <p>Your cart is empty</p>
                            <button className="cart-drawer-shop-btn" onClick={onClose}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-drawer-items">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="cart-drawer-item">
                                        <img 
                                            src={item.product?.image || '/placeholder.png'} 
                                            alt={item.product?.name}
                                            className="cart-drawer-item-img"
                                        />
                                        <div className="cart-drawer-item-info">
                                            <h4>{item.product?.name}</h4>
                                            <p>{formatPrice(item.product?.price)}</p>
                                            <div className="cart-drawer-item-qty">
                                                <button 
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            className="cart-drawer-item-remove"
                                            onClick={() => removeFromCart(item._id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-drawer-footer">
                                <div className="cart-drawer-total">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="cart-drawer-buttons">
                                    <button className="cart-drawer-view-btn" onClick={handleViewCart}>
                                        View Cart
                                    </button>
                                    <button className="cart-drawer-checkout-btn" onClick={handleCheckout}>
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;