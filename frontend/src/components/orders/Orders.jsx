import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaBox, FaEye, FaClock, FaCheckCircle, FaTruck, 
    FaSearch, FaSyncAlt
} from 'react-icons/fa';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [token, navigate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://organic-heritage.onrender.com/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const response = await axios.put(
                `https://organic-heritage.onrender.com/api/orders/${orderId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                await fetchOrders();
                alert('Order cancelled successfully');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            'pending': 'oh-status-pending',
            'processing': 'oh-status-processing',
            'shipped': 'oh-status-shipped',
            'delivered': 'oh-status-delivered',
            'cancelled': 'oh-status-cancelled'
        };
        return `oh-status-badge ${classes[status] || ''}`;
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

    const formatPrice = (price) => {
        return `Rs ${Number(price).toLocaleString('en-PK')}`;
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus !== 'all' && order.status !== filterStatus) return false;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return order.orderNumber?.toLowerCase().includes(search) ||
                   order.shippingAddress?.name?.toLowerCase().includes(search);
        }
        return true;
    });

    if (loading) {
        return (
            <div className="oh-orders-loading">
                <div className="oh-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="oh-orders-error">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={fetchOrders} className="oh-btn-retry">
                    <FaSyncAlt /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="oh-orders-page">
            <div className="oh-orders-container">
                {/* Header */}
                <div className="oh-orders-header">
                    <div className="oh-orders-header-left">
                        <h1>My Orders</h1>
                        <p>Track and manage your orders</p>
                    </div>
                    <div className="oh-orders-header-right">
                        <button onClick={fetchOrders} className="oh-btn-refresh">
                            <FaSyncAlt /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="oh-orders-stats">
                    <div className="oh-stat-card oh-stat-total">
                        <span className="oh-stat-value">{orders.length}</span>
                        <span className="oh-stat-label">Total Orders</span>
                    </div>
                    <div className="oh-stat-card oh-stat-pending">
                        <span className="oh-stat-value">{orders.filter(o => o.status === 'pending').length}</span>
                        <span className="oh-stat-label">Pending</span>
                    </div>
                    <div className="oh-stat-card oh-stat-processing">
                        <span className="oh-stat-value">{orders.filter(o => o.status === 'processing').length}</span>
                        <span className="oh-stat-label">Processing</span>
                    </div>
                    <div className="oh-stat-card oh-stat-shipped">
                        <span className="oh-stat-value">{orders.filter(o => o.status === 'shipped').length}</span>
                        <span className="oh-stat-label">Shipped</span>
                    </div>
                    <div className="oh-stat-card oh-stat-delivered">
                        <span className="oh-stat-value">{orders.filter(o => o.status === 'delivered').length}</span>
                        <span className="oh-stat-label">Delivered</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="oh-orders-toolbar">
                    <div className="oh-search-wrapper">
                        <FaSearch className="oh-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order # or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="oh-search-input"
                        />
                    </div>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="oh-filter-select"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="oh-orders-empty">
                        <FaBox size={48} />
                        <h3>No orders found</h3>
                        <p>
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'You haven\'t placed any orders yet'}
                        </p>
                        <Link to="/" className="oh-btn-shop-now">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="oh-orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="oh-order-card">
                                <div className="oh-order-card-header">
                                    <div className="oh-order-info-left">
                                        <span className="oh-order-number">#{order.orderNumber}</span>
                                        <span className="oh-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="oh-order-info-right">
                                        <span className="oh-order-total">{formatPrice(order.total)}</span>
                                        <span className={getStatusBadge(order.status)}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="oh-order-card-body">
                                    <div className="oh-order-items-preview">
                                        {order.items.slice(0, 3).map((item, index) => (
                                            <div key={index} className="oh-order-item-preview">
                                                <img src={item.image || '/placeholder.png'} alt={item.name} />
                                                <span>{item.name}</span>
                                                <span className="oh-item-qty">x{item.quantity}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <span className="oh-more-items">+{order.items.length - 3} more</span>
                                        )}
                                    </div>
                                </div>

                                <div className="oh-order-card-footer">
                                    <div className="oh-order-shipping">
                                        <span className="oh-shipping-label">Deliver to:</span>
                                        <span className="oh-shipping-name">{order.shippingAddress?.name}</span>
                                    </div>
                                    <div className="oh-order-actions">
                                        {order.status === 'pending' && (
                                            <button className="oh-btn-cancel" onClick={() => handleCancelOrder(order._id)}>
                                                Cancel Order
                                            </button>
                                        )}
                                        <Link to={`/order-confirmation/${order._id}`} className="oh-btn-view-order">
                                            <FaEye /> View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;