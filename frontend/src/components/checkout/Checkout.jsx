import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
    FaArrowLeft, FaTruck, FaShieldAlt, FaUndo, 
    FaCreditCard, FaMoneyBillWave, FaMapMarkerAlt, 
    FaPhone, FaCheckCircle, FaLock, FaClock,
    FaHome, FaEnvelope, FaInfoCircle, FaPercent,
    FaWhatsapp, FaHeadset, FaStar, FaShippingFast,
    FaBoxOpen, FaWallet, FaCalendarCheck, FaUser,
    FaChevronRight, FaTag, FaGift, FaLeaf,
    FaCheck, FaPhoneAlt, FaLongArrowAltLeft
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, total, clearCart, loading } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        country: 'Pakistan',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        postalCode: '',
        phone: '',
        saveInfo: false,
        sameBilling: true,
        deliveryNote: ''
    });

    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, loading, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Back button handler - goes to previous page
    const handleBack = () => {
        navigate(-1);
    };

    const applyCoupon = () => {
        if (couponCode.toLowerCase() === 'welcome20') {
            setDiscountAmount(total * 0.2);
            setCouponApplied(true);
            toast.success('Coupon applied! 20% off');
        } else if (couponCode.toLowerCase() === 'organic10') {
            setDiscountAmount(total * 0.1);
            setCouponApplied(true);
            toast.success('Coupon applied! 10% off');
        } else {
            toast.error('Invalid coupon code');
        }
    };

    const removeCoupon = () => {
        setCouponApplied(false);
        setDiscountAmount(0);
        setCouponCode('');
        toast.success('Coupon removed');
    };

    const showOrderSuccessPopup = (order) => {
        return new Promise((resolve) => {
            const itemsList = order.items && order.items.length > 0 
                ? order.items.slice(0, 3).map(item => `
                    <div class="popup-item-row">
                        <span class="popup-item-name">${item.name} &times; ${item.quantity}</span>
                        <span class="popup-item-price">Rs ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('') + (order.items.length > 3 
                    ? `<div class="popup-more-items">+${order.items.length - 3} more item${order.items.length - 3 > 1 ? 's' : ''}</div>` 
                    : '')
                : '';

            Swal.fire({
                icon: 'success',
                title: 'Order Placed Successfully',
                html: `
                    <div style="text-align: center;">
                        <span class="popup-leaf-icon">&#127807;</span>

                        <h3 style="color: #1B2E1A; font-family: 'Playfair Display', serif; margin: 0 0 4px 0; font-size: 1.2rem; font-weight: 700;">
                            Thank You for Your Order
                        </h3>
                        <p class="popup-thank-subtitle">
                            Your order has been placed successfully. We appreciate your trust in us.
                        </p>

                        <div class="popup-order-card">
                            <div class="popup-row">
                                <span class="popup-label">Order Number</span>
                                <span class="popup-value">${order.orderNumber || 'N/A'}</span>
                            </div>
                            <div class="popup-row">
                                <span class="popup-label">Total Amount</span>
                                <span class="popup-value price">Rs ${Number(order.total).toLocaleString()}</span>
                            </div>
                            <div class="popup-row">
                                <span class="popup-label">Payment Method</span>
                                <span class="popup-value">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                            </div>
                        </div>

                        ${itemsList ? `
                            <div class="popup-items-list">
                                ${itemsList}
                            </div>
                        ` : ''}

                        <div class="popup-email-notice">
                            <p>
                                <strong>Confirmation email</strong> has been sent to your registered address with all order details.
                            </p>
                        </div>

                        <div class="popup-status-badges">
                            <span class="popup-status-badge confirmed">Confirmed</span>
                            <span class="popup-status-badge processing">Processing</span>
                        </div>
                    </div>
                `,
                confirmButtonText: 'View Order',
                confirmButtonColor: '#2D6A4F',
                showCancelButton: true,
                cancelButtonText: 'Continue Shopping',
                cancelButtonColor: '#6B7280',
                allowOutsideClick: false,
                width: 460,
                padding: '0',
                customClass: {
                    popup: 'order-success-popup',
                    confirmButton: 'popup-confirm-btn',
                    cancelButton: 'popup-cancel-btn'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    resolve('view');
                } else {
                    resolve('continue');
                }
            });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['firstName', 'lastName', 'address', 'city', 'phone'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            const fieldLabels = {
                'firstName': 'First Name',
                'lastName': 'Last Name',
                'address': 'Address',
                'city': 'City',
                'phone': 'Phone Number'
            };
            const missingLabels = missingFields.map(f => fieldLabels[f] || f);
            toast.error(`Please fill in: ${missingLabels.join(', ')}`);
            return;
        }

        setIsProcessing(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login to place order');
                navigate('/login');
                return;
            }

            const subtotal = total;
            const shipping = 0;
            const grandTotal = subtotal + shipping - discountAmount;

            const items = cartItems.map(item => {
                const productData = item.product || {};
                return {
                    product: productData._id || productData.id || item._id || 'unknown',
                    name: productData.name || 'Product',
                    price: Number(productData.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    image: productData.image || productData.images?.[0] || '/placeholder.png'
                };
            });

            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            const fullAddress = formData.address.trim() + (formData.apartment ? `, ${formData.apartment.trim()}` : '');

            const notesParts = [];
            if (formData.email) notesParts.push(`Email: ${formData.email}`);
            if (formData.deliveryNote) notesParts.push(`Delivery Instructions: ${formData.deliveryNote}`);
            if (formData.apartment) notesParts.push(`Apartment: ${formData.apartment}`);
            if (formData.postalCode) notesParts.push(`Postal Code: ${formData.postalCode}`);
            const notesString = notesParts.join(' | ');

            const orderData = {
                items: items,
                subtotal: Number(subtotal),
                shipping: Number(shipping),
                discount: Number(discountAmount),
                total: Number(grandTotal),
                shippingAddress: {
                    name: fullName,
                    address: fullAddress,
                    city: formData.city.trim(),
                    phone: formData.phone.trim(),
                    zipCode: formData.postalCode.trim() || ''
                },
                paymentMethod: 'cod',
                notes: notesString || 'No additional notes'
            };

            console.log('Sending order data:', JSON.stringify(orderData, null, 2));

            const response = await axios.post(
                'http://localhost:5000/api/orders',
                orderData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            if (response.data.success) {
                const order = response.data.order;
                const action = await showOrderSuccessPopup(order);
                clearCart();

                if (action === 'view') {
                    navigate(`/order-confirmation/${order._id}`);
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error('Order error:', error.response?.data || error.message);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 400) {
                toast.error('Invalid order data. Please check all fields.');
            } else if (error.response?.status === 401) {
                toast.error('Please login to place order');
                navigate('/login');
            } else {
                toast.error('Failed to place order. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const formatPrice = (price) => {
        return `Rs ${Number(price).toLocaleString('en-PK')}`;
    };

    const subtotal = total;
    const shipping = 0;
    const grandTotal = subtotal + shipping - discountAmount;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="spinner"></div>
                <p>Loading checkout...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-empty">
                <div className="empty-icon">&#128722;</div>
                <h2>Your cart is empty</h2>
                <p>Add some products to your cart before checking out.</p>
                <Link to="/" className="btn-continue-shopping">
                    <FaArrowLeft /> Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Back Button - Top Left */}
            <div className="back-button-wrapper">
                <button onClick={handleBack} className="back-button">
                    <FaLongArrowAltLeft /> <span>Back</span>
                </button>
            </div>

            {/* Top Bar */}
            <div className="checkout-top-bar">
                <div className="checkout-top-bar-inner">
                    <div className="checkout-top-bar-left">
                        <span><FaCheckCircle /> Free Shipping on All Orders</span>
                        <span><FaCheckCircle /> Cash on Delivery Available</span>
                        <span><FaCheckCircle /> 100% Organic Products</span>
                    </div>
                    <div className="checkout-top-bar-right">
                        <FaPhoneAlt /> +92 300 1234567
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="checkout-nav">
                <div className="checkout-nav-inner">
                    <Link to="/" className="checkout-logo">
                        <div className="checkout-logo-icon">
                            <FaLeaf />
                        </div>
                        <span className="checkout-logo-text">ORGANIC<span>HERITAGE</span></span>
                    </Link>
                    <div className="checkout-nav-steps">
                        <div className="nav-step completed">
                            <FaCheckCircle /> Cart
                        </div>
                        <div className="nav-step-divider"></div>
                        <div className="nav-step active">
                            <FaUser /> Information
                        </div>
                        <div className="nav-step-divider"></div>
                        <div className="nav-step">
                            <FaCheckCircle /> Confirmation
                        </div>
                    </div>
                </div>
            </div>

            <div className="checkout-container">
                <div className="checkout-main">
                    {/* LEFT - FORM */}
                    <div className="checkout-form-area">
                        <div className="checkout-form-header">
                            <h2>Shipping Information</h2>
                            <p>Complete your order details below</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Contact */}
                            <div className="form-section">
                                <div className="form-section-title">
                                    <div className="form-section-number">1</div>
                                    <h3>Contact Information</h3>
                                </div>
                                <div className="form-group">
                                    <label>Email Address <span className="required">*</span></label>
                                    <div className="input-wrapper">
                                        <FaEnvelope className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            className="form-input with-icon"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery */}
                            <div className="form-section">
                                <div className="form-section-title">
                                    <div className="form-section-number">2</div>
                                    <h3>Delivery Address</h3>
                                </div>

                                <div className="form-group">
                                    <label>Country / Region</label>
                                    <div className="input-wrapper">
                                        <FaHome className="input-icon" />
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="form-input with-icon"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="form-row two-col">
                                    <div className="form-group">
                                        <label>First Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="First name"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Last name"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Street Address <span className="required">*</span></label>
                                    <div className="input-wrapper">
                                        <FaHome className="input-icon" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="House #, Street name, Area"
                                            required
                                            className="form-input with-icon"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Apartment, Suite, etc. (optional)</label>
                                    <input
                                        type="text"
                                        name="apartment"
                                        value={formData.apartment}
                                        onChange={handleChange}
                                        placeholder="Apartment, floor, building (optional)"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-row two-col">
                                    <div className="form-group">
                                        <label>City <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code (optional)</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            placeholder="e.g. 60000"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number <span className="required">*</span></label>
                                    <div className="input-wrapper">
                                        <FaPhone className="input-icon" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="03XX-XXXXXXX"
                                            required
                                            className="form-input with-icon"
                                        />
                                    </div>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="saveInfo"
                                            checked={formData.saveInfo}
                                            onChange={handleChange}
                                        />
                                        <span className="checkmark"></span>
                                        Save this information for next time
                                    </label>
                                </div>
                            </div>

                            {/* Delivery Note */}
                            <div className="form-section">
                                <div className="form-section-title">
                                    <div className="form-section-number">3</div>
                                    <h3>Delivery Instructions</h3>
                                </div>
                                <div className="form-group">
                                    <textarea
                                        name="deliveryNote"
                                        value={formData.deliveryNote}
                                        onChange={handleChange}
                                        placeholder="e.g. Leave at the door, Call before delivery, etc."
                                        rows="3"
                                        className="form-textarea"
                                    />
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="form-section">
                                <div className="form-section-title">
                                    <div className="form-section-number">4</div>
                                    <h3>Payment Method</h3>
                                </div>

                                <div className="payment-security-bar">
                                    <FaLock /> All transactions are secure and encrypted
                                </div>

                                <div className="payment-options">
                                    <div className="payment-option active">
                                        <div className="payment-option-left">
                                            <div className="payment-radio">
                                                <div className="radio-inner"></div>
                                            </div>
                                            <div className="payment-icon-wrapper">
                                                <FaMoneyBillWave />
                                            </div>
                                            <div className="payment-details">
                                                <strong>Cash on Delivery (COD)</strong>
                                                <span>Pay when you receive your order</span>
                                            </div>
                                        </div>
                                        <span className="payment-badge">Recommended</span>
                                    </div>

                                    <div className="payment-option disabled">
                                        <div className="payment-option-left">
                                            <div className="payment-radio"></div>
                                            <div className="payment-icon-wrapper gray">
                                                <FaCreditCard />
                                            </div>
                                            <div className="payment-details">
                                                <strong>Credit / Debit Card</strong>
                                                <span>Coming soon</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-complete-order"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Placing Your Order...
                                    </>
                                ) : (
                                    <>
                                        <FaLock /> Place Order &mdash; {formatPrice(grandTotal)}
                                    </>
                                )}
                            </button>

                            <p className="order-guarantee">
                                <FaShieldAlt /> 30-Day Money Back Guarantee &bull; Secure Checkout
                            </p>
                        </form>
                    </div>

                    {/* RIGHT - ORDER SUMMARY */}
                    <div className="checkout-summary-area">
                        <div className="summary-header">
                            <h3><FaBoxOpen /> Order Summary</h3>
                            <span className="items-count">{cartItems.length} items</span>
                        </div>

                        <div className="summary-items">
                            {cartItems.map((item, index) => {
                                const productData = item.product || {};
                                return (
                                    <div key={item._id || index} className="summary-item">
                                        <div className="item-image-wrapper">
                                            <img 
                                                src={productData.image || productData.images?.[0] || '/placeholder.png'} 
                                                alt={productData.name || 'Product'}
                                                className="summary-item-image"
                                            />
                                            <span className="item-qty-badge">{item.quantity}</span>
                                        </div>
                                        <div className="summary-item-info">
                                            <span className="summary-item-name">{productData.name || 'Product'}</span>
                                            <span className="summary-item-variant">{productData.category || 'Organic Product'}</span>
                                        </div>
                                        <span className="summary-item-price">
                                            {formatPrice((Number(productData.price) || 0) * (Number(item.quantity) || 1))}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Coupon */}
                        <div className="coupon-section">
                            {couponApplied ? (
                                <div className="coupon-applied">
                                    <div className="coupon-applied-left">
                                        <FaTag className="coupon-icon" />
                                        <div>
                                            <span className="coupon-code">{couponCode}</span>
                                            <span className="coupon-discount">-{formatPrice(discountAmount)} saved</span>
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} className="remove-coupon">
                                        <FaUndo /> Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="coupon-input-group">
                                    <div className="coupon-input-wrapper">
                                        <FaGift className="coupon-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="coupon-input"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={applyCoupon}
                                        className="coupon-btn"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free">FREE</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="summary-row discount">
                                    <span><FaTag /> Discount</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total</span>
                                <span className="total-price">{formatPrice(grandTotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="summary-row savings">
                                    <span><FaGift /> You saved</span>
                                    <span>{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        {/* Delivery Info */}
                        <div className="delivery-info-box">
                            <div className="delivery-info-item">
                                <FaShippingFast className="delivery-icon" />
                                <div>
                                    <strong>Free Delivery</strong>
                                    <span>On all orders across Pakistan</span>
                                </div>
                            </div>
                            <div className="delivery-info-item">
                                <FaCalendarCheck className="delivery-icon" />
                                <div>
                                    <strong>Estimated Delivery</strong>
                                    <span>{deliveryDate.toLocaleDateString('en-PK', { 
                                        weekday: 'long', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <FaShieldAlt />
                                <span>Secure</span>
                            </div>
                            <div className="trust-badge">
                                <FaUndo />
                                <span>Returns</span>
                            </div>
                            <div className="trust-badge">
                                <FaCheckCircle />
                                <span>Genuine</span>
                            </div>
                            <div className="trust-badge">
                                <FaHeadset />
                                <span>24/7</span>
                            </div>
                        </div>

                        {/* Customer Support */}
                        <div className="customer-support">
                            <FaWhatsapp className="whatsapp-icon" />
                            <div>
                                <span>Need help? Chat with us</span>
                                <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer">
                                    +92 300 1234567
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;