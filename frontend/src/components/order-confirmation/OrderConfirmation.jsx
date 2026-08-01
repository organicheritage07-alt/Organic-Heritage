import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaCheckCircle, FaPrint, FaHome, FaBox, FaUser,
    FaMapMarkerAlt, FaPhone, FaEnvelope, FaGift,
    FaClock, FaTruck, FaTag, FaLeaf, FaCalendarAlt,
    FaArrowLeft, FaDownload, FaRegCheckCircle
} from 'react-icons/fa';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    `https://organic-heritage.onrender.com/api/orders/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setOrder(response.data.order);
                } else {
                    setError('Order not found');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, navigate]);

    const formatPrice = (price) => {
        return `Rs ${Number(price).toLocaleString('en-PK')}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': <FaClock />,
            'processing': <FaBox />,
            'shipped': <FaTruck />,
            'delivered': <FaCheckCircle />,
            'cancelled': <FaClock />
        };
        return icons[status] || <FaBox />;
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#d97706',
            'processing': '#2563eb',
            'shipped': '#7c3aed',
            'delivered': '#059669',
            'cancelled': '#dc2626'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusBg = (status) => {
        const bg = {
            'pending': '#fef3c7',
            'processing': '#dbeafe',
            'shipped': '#ede9fe',
            'delivered': '#d1fae5',
            'cancelled': '#fee2e2'
        };
        return bg[status] || '#f3f4f6';
    };

    if (loading) {
        return (
            <div className="oh-confirm-loading">
                <div className="oh-confirm-spinner"></div>
                <p>Loading your order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="oh-confirm-error">
                <div className="oh-error-icon">📋</div>
                <h2>Order Not Found</h2>
                <p>{error || 'We could not find your order.'}</p>
                <Link to="/" className="oh-btn-home">
                    <FaHome /> Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="oh-confirm-page">
            {/* Top Bar */}
            <div className="oh-confirm-top-bar">
                <div className="oh-confirm-top-bar-inner">
                    <Link to="/" className="oh-confirm-logo">
                        <FaLeaf />
                        <span>Organic Heritage</span>
                    </Link>
                    <div className="oh-confirm-top-actions">
                        <button onClick={handlePrint} className="oh-top-action-btn">
                            <FaPrint /> Print
                        </button>
                        <Link to="/orders" className="oh-top-action-btn">
                            <FaBox /> My Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="oh-confirm-header">
                <div className="oh-confirm-header-inner">
                    <div className="oh-confirm-header-left">
                        <div className="oh-confirm-icon-circle">
                            <FaCheckCircle />
                        </div>
                        <div>
                            <h1>Order Confirmed</h1>
                            <p>Thank you for your purchase. Your order has been placed successfully.</p>
                        </div>
                    </div>
                    <div className="oh-confirm-header-right">
                        <span className="oh-order-status-badge" style={{
                            background: getStatusBg(order.status),
                            color: getStatusColor(order.status),
                            border: `2px solid ${getStatusColor(order.status)}`
                        }}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="oh-confirm-container">
                {/* Order Info Cards */}
                <div className="oh-confirm-order-cards">
                    <div className="oh-info-card">
                        <span className="oh-card-label">Order Number</span>
                        <span className="oh-card-value">{order.orderNumber}</span>
                    </div>
                    <div className="oh-info-card">
                        <span className="oh-card-label">Order Date</span>
                        <span className="oh-card-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="oh-info-card">
                        <span className="oh-card-label">Payment Method</span>
                        <span className="oh-card-value">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                    </div>
                    <div className="oh-info-card oh-highlight">
                        <span className="oh-card-label">Total Amount</span>
                        <span className="oh-card-value oh-total">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Tracking Timeline - PROFESSIONAL ICONS */}
                <div className="oh-order-tracking">
                    <h3>Order Status</h3>
                    <div className="oh-tracking-timeline">
                        <div className={`oh-tracking-step ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'oh-active' : ''}`}>
                            <div className="oh-tracking-icon-wrap">
                                <FaRegCheckCircle />
                            </div>
                            <div className="oh-tracking-content">
                                <strong>Order Placed</strong>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className={`oh-tracking-line ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'oh-active' : ''}`}></div>
                        <div className={`oh-tracking-step ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'oh-active' : ''}`}>
                            <div className="oh-tracking-icon-wrap">
                                <FaBox />
                            </div>
                            <div className="oh-tracking-content">
                                <strong>Processing</strong>
                                <span>Order is being prepared</span>
                            </div>
                        </div>
                        <div className={`oh-tracking-line ${order.status === 'shipped' || order.status === 'delivered' ? 'oh-active' : ''}`}></div>
                        <div className={`oh-tracking-step ${order.status === 'shipped' || order.status === 'delivered' ? 'oh-active' : ''}`}>
                            <div className="oh-tracking-icon-wrap">
                                <FaTruck />
                            </div>
                            <div className="oh-tracking-content">
                                <strong>Shipped</strong>
                                <span>On the way to you</span>
                            </div>
                        </div>
                        <div className={`oh-tracking-line ${order.status === 'delivered' ? 'oh-active' : ''}`}></div>
                        <div className={`oh-tracking-step ${order.status === 'delivered' ? 'oh-active' : ''}`}>
                            <div className="oh-tracking-icon-wrap">
                                <FaCheckCircle />
                            </div>
                            <div className="oh-tracking-content">
                                <strong>Delivered</strong>
                                <span>Order delivered successfully</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="oh-confirm-items-section">
                    <h3>Order Items</h3>
                    <div className="oh-items-table-wrapper">
                        <table className="oh-items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="oh-item-cell">
                                                <img src={item.image || '/placeholder.png'} alt={item.name} />
                                                <span>{item.name}</span>
                                            </div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td className="oh-item-total">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="oh-totals-label">Subtotal</td>
                                    <td className="oh-totals-value">{formatPrice(order.subtotal)}</td>
                                </tr>
                                {order.discount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="oh-totals-label oh-discount">Discount</td>
                                        <td className="oh-totals-value oh-discount">-{formatPrice(order.discount)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="3" className="oh-totals-label">Shipping</td>
                                    <td className="oh-totals-value">{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</td>
                                </tr>
                                <tr className="oh-grand-total">
                                    <td colSpan="3" className="oh-totals-label">Total</td>
                                    <td className="oh-totals-value oh-grand">{formatPrice(order.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="oh-confirm-shipping">
                    <h3><FaMapMarkerAlt /> Shipping Address</h3>
                    <div className="oh-shipping-details">
                        <p className="oh-shipping-name">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}{order.shippingAddress.zipCode ? `, ${order.shippingAddress.zipCode}` : ''}</p>
                        <p><FaPhone /> {order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="oh-confirm-notes">
                        <h3>Order Notes</h3>
                        <p>{order.notes}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="oh-confirm-actions">
                    <Link to="/" className="oh-btn-secondary">
                        <FaHome /> Continue Shopping
                    </Link>
                    <Link to="/orders" className="oh-btn-primary">
                        <FaBox /> My Orders
                    </Link>
                    <button onClick={handlePrint} className="oh-btn-print">
                        <FaPrint /> Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;