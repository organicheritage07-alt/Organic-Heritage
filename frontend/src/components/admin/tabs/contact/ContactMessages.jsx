import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    FaEye, FaTrash, FaReply, FaSyncAlt, FaCheckCircle,
    FaClock, FaEnvelope, FaUser, FaCalendarAlt,
    FaTimes, FaPaperPlane, FaSearch, FaFilter,
    FaChevronRight, FaCheck, FaCheckDouble,
    FaPhone, FaMapMarkerAlt, FaCommentDots,
    FaInbox, FaArrowLeft, FaExclamationTriangle,
    FaEllipsisV, FaSortAmountDown, FaRegEnvelope,
    FaRegCheckCircle, FaRegPaperPlane, FaRegClock
} from 'react-icons/fa';
import './ContactMessages.css';

const API_URL = 'http://localhost:5000/api/contact';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
    const [filter, setFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'detail'
    const token = localStorage.getItem('token');

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/all?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessages(response.data.messages);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            Swal.fire({ 
                title: 'Error!', 
                text: 'Failed to fetch messages', 
                icon: 'error',
                confirmButtonColor: '#2D5A27'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [filter]);

    const handleViewMessage = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSelectedMessage(response.data.message);
                setMobileView('detail');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error viewing message:', error);
            Swal.fire({ 
                title: 'Error!', 
                text: 'Failed to load message details', 
                icon: 'error',
                confirmButtonColor: '#2D5A27'
            });
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) {
            Swal.fire({ 
                title: 'Error', 
                text: 'Please enter a reply message', 
                icon: 'warning',
                confirmButtonColor: '#2D5A27'
            });
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/admin/${id}/reply`, 
                { reply: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Swal.fire({ 
                    title: 'Success!', 
                    text: 'Reply sent successfully to customer', 
                    icon: 'success',
                    confirmButtonColor: '#2D5A27',
                    timer: 2500,
                    showConfirmButton: false
                });
                setShowReplyModal(false);
                setReplyText('');
                fetchMessages();
                setSelectedMessage(null);
                setMobileView('list');
            }
        } catch (error) {
            console.error('Reply error:', error);
            Swal.fire({ 
                title: 'Error!', 
                text: error.response?.data?.message || 'Failed to send reply', 
                icon: 'error',
                confirmButtonColor: '#2D5A27'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Message?',
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
                Swal.fire({ 
                    title: 'Deleted!', 
                    icon: 'success', 
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchMessages();
                setSelectedMessage(null);
                setMobileView('list');
            } catch (error) {
                Swal.fire({ 
                    title: 'Error!', 
                    text: 'Failed to delete', 
                    icon: 'error',
                    confirmButtonColor: '#2D5A27'
                });
            }
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'unread': { 
                label: 'Unread', 
                color: '#F59E0B', 
                bg: '#FFF7ED',
                icon: <FaRegClock />,
                dot: '#F59E0B'
            },
            'read': { 
                label: 'Read', 
                color: '#3B82F6', 
                bg: '#EFF6FF',
                icon: <FaRegCheckCircle />,
                dot: '#3B82F6'
            },
            'replied': { 
                label: 'Replied', 
                color: '#10B981', 
                bg: '#ECFDF5',
                icon: <FaRegPaperPlane />,
                dot: '#10B981'
            }
        };
        return configs[status] || configs['unread'];
    };

    const getStatusBadge = (status) => {
        const cfg = getStatusConfig(status);
        return (
            <span className="msg-status-badge" style={{ 
                color: cfg.color, 
                backgroundColor: cfg.bg 
            }}>
                {cfg.icon} {cfg.label}
            </span>
        );
    };

    // Filter and sort messages
    const filteredMessages = messages
        .filter(msg => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                msg.name?.toLowerCase().includes(q) ||
                msg.email?.toLowerCase().includes(q) ||
                msg.subject?.toLowerCase().includes(q) ||
                msg.message?.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            return 0;
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
        <div className="contact-messages-container">
            {/* Header */}
            <div className="cm-header">
                <div className="cm-header-left">
                    <div className="cm-header-icon">
                        <FaInbox />
                    </div>
                    <div>
                        <h2>Contact Messages</h2>
                        <p>Manage customer inquiries and support requests</p>
                    </div>
                </div>
                <div className="cm-header-actions">
                    <button className="cm-refresh-btn" onClick={fetchMessages}>
                        <FaSyncAlt /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="cm-stats">
                <div className={`cm-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    <div className="cm-stat-icon" style={{ color: '#2D5A27' }}>
                        <FaInbox />
                    </div>
                    <div className="cm-stat-info">
                        <span className="cm-stat-number">{stats.total}</span>
                        <span className="cm-stat-label">Total Messages</span>
                    </div>
                    {stats.unread > 0 && <div className="cm-stat-alert">{stats.unread}</div>}
                </div>
                <div className={`cm-stat-card ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                    <div className="cm-stat-icon" style={{ color: '#F59E0B' }}>
                        <FaRegClock />
                    </div>
                    <div className="cm-stat-info">
                        <span className="cm-stat-number">{stats.unread}</span>
                        <span className="cm-stat-label">Unread</span>
                    </div>
                </div>
                <div className={`cm-stat-card ${filter === 'read' ? 'active' : ''}`} onClick={() => setFilter('read')}>
                    <div className="cm-stat-icon" style={{ color: '#3B82F6' }}>
                        <FaRegCheckCircle />
                    </div>
                    <div className="cm-stat-info">
                        <span className="cm-stat-number">{stats.read}</span>
                        <span className="cm-stat-label">Read</span>
                    </div>
                </div>
                <div className={`cm-stat-card ${filter === 'replied' ? 'active' : ''}`} onClick={() => setFilter('replied')}>
                    <div className="cm-stat-icon" style={{ color: '#10B981' }}>
                        <FaRegPaperPlane />
                    </div>
                    <div className="cm-stat-info">
                        <span className="cm-stat-number">{stats.replied}</span>
                        <span className="cm-stat-label">Replied</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="cm-main-layout">
                {/* Messages List Panel */}
                <div className={`cm-list-panel ${mobileView === 'detail' ? 'mobile-hidden' : ''}`}>
                    {/* Toolbar */}
                    <div className="cm-toolbar">
                        <div className="cm-search-box">
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="cm-toolbar-right">
                            <select 
                                className="cm-sort-select" 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="cm-filter-tabs">
                        <button className={`cm-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            All
                        </button>
                        <button className={`cm-filter-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                            Unread
                        </button>
                        <button className={`cm-filter-tab ${filter === 'read' ? 'active' : ''}`} onClick={() => setFilter('read')}>
                            Read
                        </button>
                        <button className={`cm-filter-tab ${filter === 'replied' ? 'active' : ''}`} onClick={() => setFilter('replied')}>
                            Replied
                        </button>
                    </div>

                    {/* Messages List */}
                    {loading ? (
                        <div className="cm-loading">
                            <div className="cm-spinner"></div>
                            <p>Loading messages...</p>
                        </div>
                    ) : (
                        <div className="cm-messages-list">
                            {filteredMessages.length === 0 ? (
                                <div className="cm-empty">
                                    <div className="cm-empty-icon">
                                        <FaEnvelope />
                                    </div>
                                    <h3>No messages found</h3>
                                    <p>Customer inquiries will appear here</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => {
                                    const cfg = getStatusConfig(msg.status);
                                    const isSelected = selectedMessage?._id === msg._id;
                                    return (
                                        <div 
                                            key={msg._id} 
                                            className={`cm-message-item ${msg.status === 'unread' ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleViewMessage(msg._id)}
                                        >
                                            <div className="cm-message-row">
                                                <div className="cm-message-avatar">
                                                    {msg.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="cm-message-content">
                                                    <div className="cm-message-top">
                                                        <div className="cm-message-sender-info">
                                                            <strong>{msg.name}</strong>
                                                            <span className="cm-message-email">{msg.email}</span>
                                                        </div>
                                                        <div className="cm-message-time">
                                                            {msg.status === 'unread' && (
                                                                <span className="cm-unread-dot"></span>
                                                            )}
                                                            {formatDate(msg.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="cm-message-subject">
                                                        {msg.subject || 'No Subject'}
                                                    </div>
                                                    <div className="cm-message-preview">
                                                        {msg.message.length > 80 ? msg.message.substring(0, 80) + '...' : msg.message}
                                                    </div>
                                                    <div className="cm-message-footer">
                                                        {getStatusBadge(msg.status)}
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
                <div className={`cm-detail-panel ${mobileView === 'list' ? 'mobile-hidden' : ''}`}>
                    {!selectedMessage ? (
                        <div className="cm-detail-empty">
                            <div className="cm-detail-empty-icon">
                                <FaCommentDots />
                            </div>
                            <h3>Select a message</h3>
                            <p>Click on any message from the list to view details</p>
                        </div>
                    ) : (
                        <div className="cm-detail-content">
                            {/* Detail Header */}
                            <div className="cm-detail-header">
                                <button className="cm-back-btn" onClick={() => setMobileView('list')}>
                                    <FaArrowLeft /> Back
                                </button>
                                <div className="cm-detail-actions">
                                    <button className="cm-detail-action-btn reply" onClick={() => setShowReplyModal(true)}>
                                        <FaReply /> Reply
                                    </button>
                                    <button className="cm-detail-action-btn delete" onClick={() => handleDelete(selectedMessage._id)}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>

                            {/* Contact Info Card */}
                            <div className="cm-contact-card">
                                <div className="cm-contact-avatar">
                                    {selectedMessage.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="cm-contact-info">
                                    <h3>{selectedMessage.name}</h3>
                                    <div className="cm-contact-meta">
                                        <span><FaEnvelope /> {selectedMessage.email}</span>
                                        <span><FaCalendarAlt /> {formatFullDate(selectedMessage.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="cm-contact-status">
                                    {getStatusBadge(selectedMessage.status)}
                                </div>
                            </div>

                            {/* Message Thread */}
                            <div className="cm-message-thread">
                                {/* Original Message */}
                                <div className="cm-thread-message incoming">
                                    <div className="cm-thread-avatar">
                                        {selectedMessage.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="cm-thread-bubble">
                                        <div className="cm-thread-header">
                                            <strong>{selectedMessage.name}</strong>
                                            <span>{formatFullDate(selectedMessage.createdAt)}</span>
                                        </div>
                                        <div className="cm-thread-subject">
                                            <FaEnvelope /> {selectedMessage.subject || 'No Subject'}
                                        </div>
                                        <div className="cm-thread-body">
                                            {selectedMessage.message}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Reply */}
                                {selectedMessage.adminReply && (
                                    <div className="cm-thread-message outgoing">
                                        <div className="cm-thread-bubble">
                                            <div className="cm-thread-header">
                                                <strong>Admin</strong>
                                                <span>{formatFullDate(selectedMessage.repliedAt)}</span>
                                            </div>
                                            <div className="cm-thread-body">
                                                {selectedMessage.adminReply}
                                            </div>
                                            <div className="cm-thread-check">
                                                <FaCheckDouble /> Replied
                                            </div>
                                        </div>
                                        <div className="cm-thread-avatar admin">
                                            A
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Reply Bar */}
                            <div className="cm-quick-reply">
                                <input 
                                    type="text" 
                                    placeholder="Type a quick reply..."
                                    onClick={() => setShowReplyModal(true)}
                                    readOnly
                                />
                                <button onClick={() => setShowReplyModal(true)}>
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedMessage && (
                <div className="cm-modal-overlay" onClick={() => { setShowReplyModal(false); setReplyText(''); }}>
                    <div className="cm-modal cm-reply-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cm-modal-header">
                            <div className="cm-modal-header-info">
                                <h3>Reply to {selectedMessage.name}</h3>
                                <span>{selectedMessage.email}</span>
                            </div>
                            <button className="cm-modal-close" onClick={() => { setShowReplyModal(false); setReplyText(''); }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="cm-modal-body">
                            {/* Original Message Reference */}
                            <div className="cm-reply-reference">
                                <div className="cm-reply-ref-header">
                                    <FaEnvelope /> Original Message
                                </div>
                                <div className="cm-reply-ref-subject">
                                    {selectedMessage.subject || 'No Subject'}
                                </div>
                                <div className="cm-reply-ref-body">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Reply Input */}
                            <div className="cm-reply-input-area">
                                <label>Your Reply</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply here..."
                                    rows="6"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="cm-modal-footer">
                            <button className="cm-modal-btn cancel" onClick={() => { setShowReplyModal(false); setReplyText(''); }}>
                                Cancel
                            </button>
                            <button className="cm-modal-btn send" onClick={() => handleReply(selectedMessage._id)}>
                                <FaPaperPlane /> Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessages;