import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
    FaCheckCircle, FaPrint, FaHome, FaBox, FaUser,
    FaMapMarkerAlt, FaPhone, FaEnvelope, FaGift,
    FaClock, FaTruck, FaTag, FaLeaf, FaCalendarAlt,
    FaArrowLeft, FaDownload, FaRegCheckCircle, FaFilePdf
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

    // ✅ PDF DOWNLOAD FUNCTION
    const handleDownloadPDF = () => {
        if (!order) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(45, 90, 39);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('ORGANIC HERITAGE', pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Pure Wellness, Born from Nature', pageWidth / 2, 28, { align: 'center' });

        // Order Info
        doc.setTextColor(45, 90, 39);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDER RECEIPT', 14, 55);

        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order Number: ${order.orderNumber}`, 14, 65);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 71);
        doc.text(`Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}`, 14, 77);
        doc.text(`Status: ${order.status.toUpperCase()}`, 14, 83);

        // Shipping Address
        doc.setTextColor(45, 90, 39);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SHIPPING ADDRESS', 14, 95);

        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(order.shippingAddress.name, 14, 102);
        doc.text(order.shippingAddress.address, 14, 108);
        doc.text(`${order.shippingAddress.city}${order.shippingAddress.zipCode ? `, ${order.shippingAddress.zipCode}` : ''}`, 14, 114);
        doc.text(`Phone: ${order.shippingAddress.phone}`, 14, 120);

        // Items Table
        const tableData = order.items.map(item => [
            item.name,
            item.quantity.toString(),
            formatPrice(item.price),
            formatPrice(item.price * item.quantity)
        ]);

        doc.autoTable({
            startY: 130,
            head: [['Product', 'Qty', 'Price', 'Total']],
            body: tableData,
            headStyles: {
                fillColor: [45, 90, 39],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [60, 60, 60]
            },
            alternateRowStyles: {
                fillColor: [248, 250, 248]
            },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' }
            },
            styles: {
                lineColor: [200, 200, 200],
                lineWidth: 0.5
            }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text('Subtotal:', 120, finalY);
        doc.text(formatPrice(order.subtotal), 185, finalY, { align: 'right' });

        if (order.discount > 0) {
            doc.setTextColor(45, 90, 39);
            doc.text('Discount:', 120, finalY + 7);
            doc.text(`-${formatPrice(order.discount)}`, 185, finalY + 7, { align: 'right' });
            doc.setTextColor(80, 80, 80);
            doc.text('Shipping:', 120, finalY + 14);
            doc.text(order.shipping === 0 ? 'FREE' : formatPrice(order.shipping), 185, finalY + 14, { align: 'right' });
            
            doc.setDrawColor(45, 90, 39);
            doc.setLineWidth(0.5);
            doc.line(120, finalY + 18, 185, finalY + 18);
            
            doc.setTextColor(45, 90, 39);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL:', 120, finalY + 26);
            doc.text(formatPrice(order.total), 185, finalY + 26, { align: 'right' });
        } else {
            doc.text('Shipping:', 120, finalY + 7);
            doc.text(order.shipping === 0 ? 'FREE' : formatPrice(order.shipping), 185, finalY + 7, { align: 'right' });
            
            doc.setDrawColor(45, 90, 39);
            doc.setLineWidth(0.5);
            doc.line(120, finalY + 11, 185, finalY + 11);
            
            doc.setTextColor(45, 90, 39);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL:', 120, finalY + 19);
            doc.text(formatPrice(order.total), 185, finalY + 19, { align: 'right' });
        }

        // Footer
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for shopping with Organic Heritage!', pageWidth / 2, 280, { align: 'center' });
        doc.text('For queries: support@organicheritage.pk', pageWidth / 2, 286, { align: 'center' });

        doc.save(`Order-${order.orderNumber}.pdf`);
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

                {/* Tracking Timeline */}
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

                {/* Shipping Address - PREMIUM CARD */}
                <div className="oh-confirm-shipping">
                    <div className="oh-shipping-card">
                        <div className="oh-shipping-accent"></div>
                        <div className="oh-shipping-body">
                            <div className="oh-shipping-header">
                                <div className="oh-shipping-icon-box">
                                    <FaMapMarkerAlt />
                                </div>
                                <h3>Shipping Address</h3>
                            </div>
                            <div className="oh-shipping-details">
                                <p className="oh-shipping-name">{order.shippingAddress.name}</p>
                                <div className="oh-shipping-address-block">
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}{order.shippingAddress.zipCode ? `, ${order.shippingAddress.zipCode}` : ''}</p>
                                </div>
                                <div className="oh-shipping-phone">
                                    <FaPhone />
                                    <span>{order.shippingAddress.phone}</span>
                                </div>
                            </div>
                        </div>
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
                    <button onClick={handleDownloadPDF} className="oh-btn-pdf">
                        <FaFilePdf /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;