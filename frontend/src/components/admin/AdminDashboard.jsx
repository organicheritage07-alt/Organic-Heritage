// AdminDashboard.jsx - With Real-time Badge Counts & All Tabs
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaCog, FaChevronLeft, FaChevronRight, 
  FaHome, FaSignOutAlt, FaBoxes,
  FaBox, FaListUl, FaStar, FaEnvelope, FaLeaf
} from 'react-icons/fa';
import axios from 'axios';
import Users from './tabs/users/users';
import Settings from './tabs/settings/settings';
import Products from './tabs/products/products';
import Orders from './tabs/orders/orders';
import Benefits from './tabs/benefits/benefits';
import Reviews from './tabs/reviews/reviews';
import ContactMessages from './tabs/contact/contactMessages';
import Ingredients from './tabs/ingredients/ingredients'; // ✅ IMPORT INGREDIENTS
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Notification counts state
  const [counts, setCounts] = useState({
    users: { total: 0, new: 0 },
    orders: { pending: 0 },
    reviews: { pending: 0 },
    products: { lowStock: 0 },
    benefits: { inactive: 0 },
    contact: { unread: 0 },
    ingredients: { inactive: 0 } // ✅ ADD INGREDIENTS COUNT
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Fetch notification counts
  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications/counts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCounts(response.data.counts);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    
    const handleResize = () => {
      if (window.innerWidth >= 769) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Fetch counts on mount
    fetchCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  // Nav items with badge config
  const navItems = [
    { 
      id: 'users', 
      label: 'Users', 
      icon: <FaUsers />, 
      component: <Users />,
      badge: counts.users.new > 0 ? `${counts.users.new} New` : null,
      badgeColor: '#3B82F6',
      badgeType: 'new'
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: <FaBoxes />, 
      component: <Products />,
      badge: counts.products.lowStock > 0 ? `${counts.products.lowStock} Low` : null,
      badgeColor: '#F59E0B',
      badgeType: 'low'
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <FaBox />, 
      component: <Orders />,
      badge: counts.orders.pending > 0 ? `${counts.orders.pending} Pending` : null,
      badgeColor: '#EF4444',
      badgeType: 'pending'
    },
    { 
      id: 'benefits', 
      label: 'Benefits', 
      icon: <FaListUl />, 
      component: <Benefits />,
      badge: counts.benefits.inactive > 0 ? `${counts.benefits.inactive} Inactive` : null,
      badgeColor: '#8B5CF6',
      badgeType: 'inactive'
    },
    { 
      id: 'ingredients', 
      label: 'Ingredients', 
      icon: <FaLeaf />, 
      component: <Ingredients />,
      badge: counts.ingredients?.inactive > 0 ? `${counts.ingredients.inactive} Inactive` : null,
      badgeColor: '#10B981',
      badgeType: 'inactive'
    },
    { 
      id: 'reviews', 
      label: 'Reviews', 
      icon: <FaStar />, 
      component: <Reviews />,
      badge: counts.reviews.pending > 0 ? `${counts.reviews.pending} Pending` : null,
      badgeColor: '#10B981',
      badgeType: 'pending'
    },
    { 
      id: 'contact', 
      label: 'Messages', 
      icon: <FaEnvelope />, 
      component: <ContactMessages />,
      badge: counts.contact?.unread > 0 ? `${counts.contact.unread} Unread` : null,
      badgeColor: '#F59E0B',
      badgeType: 'unread'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <FaCog />, 
      component: <Settings />,
      badge: null,
      badgeColor: null,
      badgeType: null
    },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const toggleSidebar = () => {
    if (window.innerWidth >= 769) {
      setSidebarHovered(!sidebarHovered);
    } else {
      setMobileSidebarOpen(!mobileSidebarOpen);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  // Get current component to render
  const currentComponent = navItems.find(item => item.id === activeTab)?.component;

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-left">
            <button className="admin-hamburger" onClick={toggleSidebar}>
              {mobileSidebarOpen ? <FaChevronLeft size={18} /> : <FaChevronRight size={18} />}
            </button>
            <img src="/logo.png" alt="Organic Heritage" className="admin-topbar-logo" />
          </div>
          <div className="admin-topbar-center">
            <h1>Organic Heritage Admin</h1>
            <span className="admin-topbar-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-user-info" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <span>{user.name || user.fullName}</span>
              <div className="admin-avatar">
                {user.name?.charAt(0) || user.fullName?.charAt(0) || 'A'}
              </div>
              {profileDropdownOpen && (
                <div className="admin-profile-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="apd-header">
                    <div className="apd-avatar">{user.name?.charAt(0) || user.fullName?.charAt(0) || 'A'}</div>
                    <div>
                      <strong>{user.name || user.fullName}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="apd-divider" />
                  <button onClick={() => handleTabClick('settings')}>
                    <FaCog /> Settings
                  </button>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <div className={`admin-sidebar-overlay ${mobileSidebarOpen ? 'show' : ''}`} onClick={() => setMobileSidebarOpen(false)} />

      <div className="admin-body">
        {/* Sidebar - Hover Effect */}
        <aside 
          className={`admin-sidebar ${sidebarHovered ? 'hovered' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}
          onMouseEnter={() => window.innerWidth >= 769 && setSidebarHovered(true)}
          onMouseLeave={() => window.innerWidth >= 769 && setSidebarHovered(false)}
        >
          <div className="admin-sidebar-header">
            <div className="sidebar-logo-wrapper">
              <img src="/logo.png" alt="Organic Heritage" className="sidebar-logo" />
              <span className="sidebar-brand">Organic Heritage</span>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {/* Badge with label */}
                {item.badge !== null && (
                  <span 
                    className="sidebar-badge" 
                    style={{ backgroundColor: item.badgeColor }}
                  >
                    {item.badge}
                  </span>
                )}
                {activeTab === item.id && <span className="sidebar-active-indicator"></span>}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <button className="admin-sidebar-item home-btn" onClick={goToHome}>
              <span className="sidebar-icon"><FaHome /></span>
              <span className="sidebar-label">View Site</span>
            </button>
            <button className="admin-sidebar-item logout-btn" onClick={handleLogout}>
              <span className="sidebar-icon"><FaSignOutAlt /></span>
              <span className="sidebar-label">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.2 }}
            >
              {currentComponent}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;