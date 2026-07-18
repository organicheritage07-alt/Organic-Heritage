import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaCheckCircle, FaPrint, FaHome, FaBox, FaUser,
    FaMapMarkerAlt, FaPhone, FaEnvelope, FaGift,
    FaClock, FaTruck, FaTag, FaLeaf, FaCalendarAlt,
    FaArrowLeft, FaDownload
} from 'react-icons/fa';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:5000/api/orders/${id}`,
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
            'pending': '#F59E0B',
            'processing': '#3B82F6',
            'shipped': '#8B5CF6',
            'delivered': '#10B981',
            'cancelled': '#EF4444'
        };
        return colors[status] || '#6B7280';
    };

    const getStatusBg = (status) => {
        const bg = {
            'pending': '#FEF3C7',
            'processing': '#DBEAFE',
            'shipped': '#EDE9FE',
            'delivered': '#D1FAE5',
            'cancelled': '#FEE2E2'
        };
        return bg[status] || '#F3F4F6';
    };

    if (loading) {
        return (
            <div className="confirmation-loading">
                <div className="spinner"></div>
                <p>Loading your order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="confirmation-error">
                <div className="error-icon">📋</div>
                <h2>Order Not Found</h2>
                <p>{error || 'We could not find your order.'}</p>
                <Link to="/" className="btn-home">
                    <FaHome /> Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="confirmation-page">
            {/* Top Bar */}
            <div className="confirmation-top-bar">
                <div className="confirmation-top-bar-inner">
                    <Link to="/" className="confirmation-logo">
                        <FaLeaf />
                        <span>Organic Heritage</span>
                    </Link>
                    <div className="confirmation-top-actions">
                        <button onClick={handlePrint} className="top-action-btn">
                            <FaPrint /> Print
                        </button>
                        <Link to="/orders" className="top-action-btn">
                            <FaBox /> My Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="confirmation-header">
                <div className="confirmation-header-inner">
                    <div className="confirmation-header-left">
                        <div className="confirmation-icon-circle">
                            <FaCheckCircle />
                        </div>
                        <div>
                            <h1>Order Confirmed</h1>
                            <p>Thank you for your purchase. Your order has been placed successfully.</p>
                        </div>
                    </div>
                    <div className="confirmation-header-right">
                        <span className="order-status-badge" style={{
                            background: getStatusBg(order.status),
                            color: getStatusColor(order.status),
                            border: `1px solid ${getStatusColor(order.status)}`
                        }}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="confirmation-container">
                {/* Order Info Cards */}
                <div className="confirmation-order-cards">
                    <div className="order-card">
                        <span className="card-label">Order Number</span>
                        <span className="card-value">{order.orderNumber}</span>
                    </div>
                    <div className="order-card">
                        <span className="card-label">Order Date</span>
                        <span className="card-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="order-card">
                        <span className="card-label">Payment Method</span>
                        <span className="card-value">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                    </div>
                    <div className="order-card highlight">
                        <span className="card-label">Total Amount</span>
                        <span className="card-value total">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Tracking Timeline */}
                <div className="order-tracking">
                    <h3>Order Status</h3>
                    <div className="tracking-timeline">
                        <div className={`tracking-step ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                            <div className="tracking-icon">✅</div>
                            <div className="tracking-content">
                                <strong>Order Placed</strong>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className={`tracking-line ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}></div>
                        <div className={`tracking-step ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                            <div className="tracking-icon">📦</div>
                            <div className="tracking-content">
                                <strong>Processing</strong>
                                <span>Order is being prepared</span>
                            </div>
                        </div>
                        <div className={`tracking-line ${order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}></div>
                        <div className={`tracking-step ${order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                            <div className="tracking-icon">🚚</div>
                            <div className="tracking-content">
                                <strong>Shipped</strong>
                                <span>On the way to you</span>
                            </div>
                        </div>
                        <div className={`tracking-line ${order.status === 'delivered' ? 'active' : ''}`}></div>
                        <div className={`tracking-step ${order.status === 'delivered' ? 'active' : ''}`}>
                            <div className="tracking-icon">✅</div>
                            <div className="tracking-content">
                                <strong>Delivered</strong>
                                <span>Order delivered successfully</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="confirmation-items-section">
                    <h3>Order Items</h3>
                    <div className="items-table-wrapper">
                        <table className="items-table">
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
                                            <div className="item-cell">
                                                <img src={item.image || '/placeholder.png'} alt={item.name} />
                                                <span>{item.name}</span>
                                            </div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td className="item-total">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="totals-label">Subtotal</td>
                                    <td className="totals-value">{formatPrice(order.subtotal)}</td>
                                </tr>
                                {order.discount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="totals-label discount">Discount</td>
                                        <td className="totals-value discount">-{formatPrice(order.discount)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="3" className="totals-label">Shipping</td>
                                    <td className="totals-value">{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</td>
                                </tr>
                                <tr className="grand-total">
                                    <td colSpan="3" className="totals-label">Total</td>
                                    <td className="totals-value grand">{formatPrice(order.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="confirmation-shipping">
                    <h3><FaMapMarkerAlt /> Shipping Address</h3>
                    <div className="shipping-details">
                        <p className="shipping-name">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}{order.shippingAddress.zipCode ? `, ${order.shippingAddress.zipCode}` : ''}</p>
                        <p><FaPhone /> {order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="confirmation-notes">
                        <h3>📝 Order Notes</h3>
                        <p>{order.notes}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="confirmation-actions">
                    <Link to="/" className="btn-secondary">
                        <FaHome /> Continue Shopping
                    </Link>
                    <Link to="/orders" className="btn-primary">
                        <FaBox /> My Orders
                    </Link>
                    <button onClick={handlePrint} className="btn-print">
                        <FaPrint /> Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;