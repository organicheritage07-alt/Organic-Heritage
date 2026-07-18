import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    FaCheck, FaTimes, FaTrash, FaEye, FaSyncAlt, FaClock,
    FaStar, FaRegStar, FaCommentDots, FaUser, FaBox,
    FaCalendarAlt, FaFilter, FaSearch, FaArrowLeft,
    FaThumbsUp, FaThumbsDown, FaExclamationTriangle,
    FaInbox, FaCheckCircle, FaTimesCircle, FaEllipsisV,
    FaEnvelope
} from 'react-icons/fa';
import './Reviews.css';

const API_URL = 'http://localhost:5000/api/reviews';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [filter, setFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [mobileView, setMobileView] = useState('list');
    const token = localStorage.getItem('token');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/all?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setReviews(response.data.reviews);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: 'Approve Review?',
            text: 'This review will be visible on the frontend',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2D5A27',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`${API_URL}/admin/${id}/approve`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({ title: 'Approved!', icon: 'success', timer: 1500, showConfirmButton: false });
                fetchReviews();
                setSelectedReview(null);
                setMobileView('list');
            } catch (error) {
                Swal.fire({ title: 'Error!', text: 'Failed to approve', icon: 'error', confirmButtonColor: '#2D5A27' });
            }
        }
    };

    const handleReject = async (id) => {
        const { value: adminNote } = await Swal.fire({
            title: 'Reject Review',
            text: 'Provide a reason (optional)',
            input: 'textarea',
            inputPlaceholder: 'Why is this review being rejected?',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        });

        if (adminNote !== undefined) {
            try {
                await axios.patch(`${API_URL}/admin/${id}/reject`, { adminNote }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({ title: 'Rejected!', icon: 'info', timer: 1500, showConfirmButton: false });
                fetchReviews();
                setSelectedReview(null);
                setMobileView('list');
            } catch (error) {
                Swal.fire({ title: 'Error!', text: 'Failed to reject', icon: 'error', confirmButtonColor: '#2D5A27' });
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Review?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/admin/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                fetchReviews();
                setSelectedReview(null);
                setMobileView('list');
            } catch (error) {
                Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#2D5A27' });
            }
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'pending': { 
                label: 'Pending', 
                color: '#F59E0B', 
                bg: '#FFF7ED',
                icon: <FaClock />
            },
            'approved': { 
                label: 'Approved', 
                color: '#10B981', 
                bg: '#ECFDF5',
                icon: <FaCheckCircle />
            },
            'rejected': { 
                label: 'Rejected', 
                color: '#DC2626', 
                bg: '#FEE2E2',
                icon: <FaTimesCircle />
            }
        };
        return configs[status] || configs['pending'];
    };

    const getStatusBadge = (status) => {
        const cfg = getStatusConfig(status);
        return (
            <span className="rv-status-badge" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                {cfg.icon} {cfg.label}
            </span>
        );
    };

    const renderStars = (rating) => {
        return (
            <div className="rv-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= rating ? 'filled' : 'empty'}>
                        {star <= rating ? <FaStar /> : <FaRegStar />}
                    </span>
                ))}
            </div>
        );
    };

    const filteredReviews = reviews.filter(review => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            review.userName?.toLowerCase().includes(q) ||
            review.userEmail?.toLowerCase().includes(q) ||
            review.title?.toLowerCase().includes(q) ||
            review.comment?.toLowerCase().includes(q) ||
            review.productName?.toLowerCase().includes(q)
        );
    });

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    };

    const formatFullDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="reviews-admin-container">
            {/* Header */}
            <div className="rv-header">
                <div className="rv-header-left">
                    <div className="rv-header-icon">
                        <FaCommentDots />
                    </div>
                    <div>
                        <h2>Reviews Management</h2>
                        <p>Manage customer reviews and testimonials</p>
                    </div>
                </div>
                <div className="rv-header-actions">
                    <button className="rv-refresh-btn" onClick={fetchReviews}>
                        <FaSyncAlt /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="rv-stats">
                <div className={`rv-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    <div className="rv-stat-icon" style={{ color: '#2D5A27' }}>
                        <FaInbox />
                    </div>
                    <div className="rv-stat-info">
                        <span className="rv-stat-number">{stats.total}</span>
                        <span className="rv-stat-label">Total Reviews</span>
                    </div>
                </div>
                <div className={`rv-stat-card ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                    <div className="rv-stat-icon" style={{ color: '#F59E0B' }}>
                        <FaClock />
                    </div>
                    <div className="rv-stat-info">
                        <span className="rv-stat-number">{stats.pending}</span>
                        <span className="rv-stat-label">Pending</span>
                    </div>
                    {stats.pending > 0 && <div className="rv-stat-alert">{stats.pending}</div>}
                </div>
                <div className={`rv-stat-card ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
                    <div className="rv-stat-icon" style={{ color: '#10B981' }}>
                        <FaCheckCircle />
                    </div>
                    <div className="rv-stat-info">
                        <span className="rv-stat-number">{stats.approved}</span>
                        <span className="rv-stat-label">Approved</span>
                    </div>
                </div>
                <div className={`rv-stat-card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
                    <div className="rv-stat-icon" style={{ color: '#DC2626' }}>
                        <FaTimesCircle />
                    </div>
                    <div className="rv-stat-info">
                        <span className="rv-stat-number">{stats.rejected}</span>
                        <span className="rv-stat-label">Rejected</span>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="rv-main-layout">
                {/* List Panel */}
                <div className={`rv-list-panel ${mobileView === 'detail' ? 'mobile-hidden' : ''}`}>
                    {/* Toolbar */}
                    <div className="rv-toolbar">
                        <div className="rv-search-box">
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder="Search reviews..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="rv-filter-tabs">
                        <button className={`rv-filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                            <FaClock /> Pending
                        </button>
                        <button className={`rv-filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
                            <FaCheck /> Approved
                        </button>
                        <button className={`rv-filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
                            <FaTimes /> Rejected
                        </button>
                        <button className={`rv-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            <FaEye /> All
                        </button>
                    </div>

                    {/* Reviews List */}
                    {loading ? (
                        <div className="rv-loading">
                            <div className="rv-spinner"></div>
                            <p>Loading reviews...</p>
                        </div>
                    ) : (
                        <div className="rv-reviews-list">
                            {filteredReviews.length === 0 ? (
                                <div className="rv-empty">
                                    <div className="rv-empty-icon">
                                        <FaCommentDots />
                                    </div>
                                    <h3>No reviews found</h3>
                                    <p>Customer reviews will appear here</p>
                                </div>
                            ) : (
                                filteredReviews.map((review) => {
                                    const isSelected = selectedReview?._id === review._id;
                                    return (
                                        <div 
                                            key={review._id} 
                                            className={`rv-review-item ${review.status} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => { setSelectedReview(review); setMobileView('detail'); }}
                                        >
                                            <div className="rv-review-row">
                                                <div className="rv-review-avatar">
                                                    {review.userName?.charAt(0) || 'U'}
                                                </div>
                                                <div className="rv-review-content">
                                                    <div className="rv-review-top">
                                                        <div className="rv-review-user-info">
                                                            <strong>{review.userName}</strong>
                                                            <span className="rv-review-email">{review.userEmail}</span>
                                                        </div>
                                                        <div className="rv-review-time">
                                                            {formatDate(review.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="rv-review-stars">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <div className="rv-review-title">
                                                        {review.title || 'No Title'}
                                                    </div>
                                                    <div className="rv-review-preview">
                                                        {review.comment?.length > 60 ? review.comment.substring(0, 60) + '...' : review.comment}
                                                    </div>
                                                    <div className="rv-review-footer">
                                                        {getStatusBadge(review.status)}
                                                        <span className="rv-review-product">
                                                            <FaBox /> {review.productName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className={`rv-detail-panel ${mobileView === 'list' ? 'mobile-hidden' : ''}`}>
                    {!selectedReview ? (
                        <div className="rv-detail-empty">
                            <div className="rv-detail-empty-icon">
                                <FaCommentDots />
                            </div>
                            <h3>Select a review</h3>
                            <p>Click on any review from the list to view details</p>
                        </div>
                    ) : (
                        <div className="rv-detail-content">
                            {/* Detail Header */}
                            <div className="rv-detail-header">
                                <button className="rv-back-btn" onClick={() => setMobileView('list')}>
                                    <FaArrowLeft /> Back
                                </button>
                                <div className="rv-detail-actions">
                                    {selectedReview.status === 'pending' && (
                                        <>
                                            <button className="rv-detail-action-btn approve" onClick={() => handleApprove(selectedReview._id)}>
                                                <FaThumbsUp /> Approve
                                            </button>
                                            <button className="rv-detail-action-btn reject" onClick={() => handleReject(selectedReview._id)}>
                                                <FaThumbsDown /> Reject
                                            </button>
                                        </>
                                    )}
                                    {(selectedReview.status === 'approved' || selectedReview.status === 'rejected') && (
                                        <button className="rv-detail-action-btn delete" onClick={() => handleDelete(selectedReview._id)}>
                                            <FaTrash /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Review Card */}
                            <div className="rv-review-card">
                                <div className="rv-review-card-header">
                                    <div className="rv-review-card-avatar">
                                        {selectedReview.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="rv-review-card-info">
                                        <h3>{selectedReview.userName}</h3>
                                        <div className="rv-review-card-meta">
                                            <span><FaEnvelope /> {selectedReview.userEmail}</span>
                                            <span><FaCalendarAlt /> {formatFullDate(selectedReview.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="rv-review-card-status">
                                        {getStatusBadge(selectedReview.status)}
                                    </div>
                                </div>

                                <div className="rv-review-card-body">
                                    <div className="rv-review-card-rating">
                                        {renderStars(selectedReview.rating)}
                                        <span className="rv-rating-text">{selectedReview.rating} out of 5</span>
                                    </div>

                                    <div className="rv-review-card-title">
                                        {selectedReview.title || 'No Title'}
                                    </div>

                                    <div className="rv-review-card-comment">
                                        {selectedReview.comment}
                                    </div>

                                    <div className="rv-review-card-product">
                                        <div className="rv-product-label">
                                            <FaBox /> Product
                                        </div>
                                        <div className="rv-product-name">
                                            {selectedReview.productName}
                                        </div>
                                    </div>

                                    {selectedReview.adminNote && (
                                        <div className="rv-admin-note">
                                            <div className="rv-admin-note-header">
                                                <FaExclamationTriangle /> Admin Note
                                            </div>
                                            <div className="rv-admin-note-body">
                                                {selectedReview.adminNote}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;