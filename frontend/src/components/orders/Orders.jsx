import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaBox, FaEye, FaClock, FaCheckCircle, FaTruck, 
    FaSearch, FaSyncAlt, FaArrowLeft,
    FaPrint, FaDownload
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
            const response = await axios.get('http://localhost:5000/api/orders', {
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
                `http://localhost:5000/api/orders/${orderId}/cancel`,
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
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return `status-badge ${classes[status] || ''}`;
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
            <div className="orders-loading">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-error">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={fetchOrders} className="btn-retry">
                    <FaSyncAlt /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                {/* Header */}
                <div className="orders-header">
                    <div className="orders-header-left">
                        <h1>My Orders</h1>
                        <p className="orders-subtitle">
                            Track and manage your orders
                        </p>
                    </div>
                    <div className="orders-header-right">
                        <button onClick={fetchOrders} className="btn-refresh">
                            <FaSyncAlt /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="orders-stats">
                    <div className="stat-card total">
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-value">
                            {orders.filter(o => o.status === 'pending').length}
                        </span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-card processing">
                        <span className="stat-value">
                            {orders.filter(o => o.status === 'processing').length}
                        </span>
                        <span className="stat-label">Processing</span>
                    </div>
                    <div className="stat-card shipped">
                        <span className="stat-value">
                            {orders.filter(o => o.status === 'shipped').length}
                        </span>
                        <span className="stat-label">Shipped</span>
                    </div>
                    <div className="stat-card delivered">
                        <span className="stat-value">
                            {orders.filter(o => o.status === 'delivered').length}
                        </span>
                        <span className="stat-label">Delivered</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="orders-toolbar">
                    <div className="search-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order # or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
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
                    <div className="orders-empty">
                        <FaBox size={48} />
                        <h3>No orders found</h3>
                        <p>
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'You haven\'t placed any orders yet'}
                        </p>
                        <Link to="/" className="btn-shop-now">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-info-left">
                                        <span className="order-number">
                                            #{order.orderNumber}
                                        </span>
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="order-info-right">
                                        <span className="order-total">
                                            {formatPrice(order.total)}
                                        </span>
                                        <span className={getStatusBadge(order.status)}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-items-preview">
                                        {order.items.slice(0, 3).map((item, index) => (
                                            <div key={index} className="order-item-preview">
                                                <img 
                                                    src={item.image || '/placeholder.png'} 
                                                    alt={item.name}
                                                />
                                                <span>{item.name}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <span className="more-items">
                                                +{order.items.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-shipping">
                                        <span className="shipping-label">Deliver to:</span>
                                        <span className="shipping-name">
                                            {order.shippingAddress?.name}
                                        </span>
                                    </div>
                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <button 
                                                className="btn-cancel"
                                                onClick={() => handleCancelOrder(order._id)}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        <Link 
                                            to={`/order-confirmation/${order._id}`}
                                            className="btn-view-order"
                                        >
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