import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { 
    FaTrash, FaPlus, FaMinus, FaShoppingCart, 
    FaArrowLeft, FaLock, FaLongArrowAltLeft 
} from 'react-icons/fa';
import './cart.css';

const Cart = () => {
    const { cartItems, loading, total, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleQuantityChange = (cartId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return;
        updateQuantity(cartId, newQuantity);
    };

    const handleRemove = async (cartId, productName) => {
        if (window.confirm(`Remove ${productName} from cart?`)) {
            await removeFromCart(cartId);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear entire cart?')) {
            await clearCart();
        }
    };

    const formatPrice = (price) => {
        return `Rs ${Number(price).toLocaleString('en-PK')}`;
    };

    if (loading) {
        return (
            <div className="cart-page-oh">
                <div className="cart-oh-loading">
                    <div className="cart-oh-spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page-oh">
                <div className="cart-oh-empty">
                    <div className="cart-oh-empty-icon">
                        <FaShoppingCart />
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Browse our products and add items you love!</p>
                    <Link to="/" className="cart-oh-btn-shop">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="cart-page-oh">
            {/* Back Button - Fixed Top Left */}
            <div className="cart-back-btn-wrapper">
                <button onClick={handleBack} className="cart-back-btn">
                    <FaLongArrowAltLeft /> <span>Back</span>
                </button>
            </div>

            <div className="cart-oh-container">
                <div className="cart-oh-header">
                    <div className="cart-oh-header-left">
                        <h1>Shopping Bag</h1>
                        <span className="cart-oh-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className="cart-oh-header-right">
                        <Link to="/" className="cart-oh-continue-link">
                            <FaArrowLeft /> Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="cart-oh-content">
                    <div className="cart-oh-items-wrapper">
                        <div className="cart-oh-items-header">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>

                        <div className="cart-oh-items">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-oh-item">
                                    <div className="cart-oh-item-product">
                                        <div className="cart-oh-item-image">
                                            <img 
                                                src={item.product?.image || '/placeholder.png'} 
                                                alt={item.product?.name}
                                            />
                                        </div>
                                        <div className="cart-oh-item-details">
                                            <h3>{item.product?.name}</h3>
                                            <p className="cart-oh-item-subtitle">{item.product?.subtitle || item.product?.category}</p>
                                            <div className="cart-oh-item-price">
                                                <span className="cart-oh-current-price">{formatPrice(item.product?.price)}</span>
                                                {item.product?.originalPrice > item.product?.price && (
                                                    <span className="cart-oh-original-price">
                                                        {formatPrice(item.product?.originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="cart-oh-item-quantity">
                                        <div className="cart-oh-qty-control">
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
                                        <button 
                                            className="cart-oh-remove-btn"
                                            onClick={() => handleRemove(item._id, item.product?.name)}
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </div>

                                    <div className="cart-oh-item-total">
                                        <span className="cart-oh-item-total-price">
                                            {formatPrice((item.product?.price || 0) * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="cart-oh-summary">
                        <div className="cart-oh-summary-header">
                            <h3>Order Summary</h3>
                        </div>

                        <div className="cart-oh-summary-body">
                            <div className="cart-oh-summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="cart-oh-summary-row">
                                <span>Shipping</span>
                                <span className="cart-oh-free-shipping">Free</span>
                            </div>
                            <div className="cart-oh-summary-row">
                                <span>Tax</span>
                                <span>Calculated at checkout</span>
                            </div>

                            <div className="cart-oh-summary-divider"></div>

                            <div className="cart-oh-summary-row cart-oh-total">
                                <span>Estimated Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>

                        <div className="cart-oh-summary-actions">
                            <button 
                                className="cart-oh-btn-checkout"
                                onClick={() => navigate('/checkout')}
                            >
                                <FaLock /> SECURE CHECKOUT
                            </button>
                            <button className="cart-oh-btn-clear" onClick={handleClearCart}>
                                Clear Cart
                            </button>
                        </div>

                        <div className="cart-oh-trust">
                            <div className="cart-oh-trust-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                <span>Secure Payment</span>
                            </div>
                            <div className="cart-oh-trust-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                <span>30-Day Returns</span>
                            </div>
                            <div className="cart-oh-trust-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                <span>Free Shipping</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;