import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiLogOut, FiChevronDown, FiChevronRight, FiClipboard } from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import CartDrawer from '../../cart/CartDrawer';
import { logoutUser } from '../../../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLink, setActiveLink] = useState('home');

  // ✅ USE CART CONTEXT - Get isCartOpen, openCart, closeCart
  const { itemCount, isCartOpen, openCart, closeCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const lastScrollY = useRef(0);

  // Scroll behavior: show on scroll up, hide on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial show
    setTimeout(() => setIsVisible(true), 300);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'story', label: 'Our Story', href: '/story' },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'ingredients', label: 'Ingredients', href: '/ingredients' },
    
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  const handleLinkClick = (id, href) => {
    setActiveLink(id);
    setMobileMenuOpen(false);
    navigate(href);
  };

  const handleAccountClick = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleOrdersClick = () => {
    navigate('/orders');
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    dispatch(logoutUser());
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // ✅ USE openCart FROM CONTEXT
  const handleCartClick = () => {
    openCart(); // ✅ This will open the cart drawer
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ===== DESKTOP NAVBAR - 3 PREMIUM CAPSULES ===== */}
      <nav className={`navbar-desktop ${isVisible ? 'navbar-visible' : ''} ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="capsules-wrapper">
          
          {/* LEFT CAPSULE - Logo */}
          <div className="capsule-left">
            <a href="/" className="brand-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              <div className="brand-logo-ring">
                <div className="brand-logo-inner">
                  <img src="/logo.png" alt="Organic Heritage" className="brand-logo-img" onError={(e) => e.target.style.display='none'} />
                </div>
              </div>
              <div className="brand-text">
                <span className="brand-organic">Organic</span>
                <span className="brand-heritage">Heritage</span>
              </div>
            </a>
          </div>

          {/* CENTER CAPSULE - Navigation */}
          <div className="capsule-center">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`nav-link ${activeLink === link.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id, link.href);
                }}
              >
                <span className="nav-link-text">{link.label}</span>
                <span className="nav-link-dot"></span>
                {activeLink === link.id && <span className="nav-link-glow"></span>}
              </a>
            ))}
          </div>

          {/* RIGHT CAPSULE - Actions */}
          <div className="capsule-right">
            <div className="search-capsule">
              <div className={`search-expand ${searchOpen ? 'open' : ''}`}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="action-btn search-btn" onClick={() => setSearchOpen(!searchOpen)}>
                {searchOpen ? <FiX /> : <FiSearch />}
              </button>
            </div>

            <button className="action-btn cart-btn" onClick={handleCartClick}>
              <FiShoppingCart />
              {itemCount > 0 && (
                <span className="cart-badge">
                  <span className="cart-badge-pulse"></span>
                  <span className="cart-badge-text">{itemCount}</span>
                </span>
              )}
            </button>

            {!isAuthenticated ? (
              <button className="action-btn user-btn" onClick={handleAccountClick}>
                <FiUser />
              </button>
            ) : (
              <div className="user-menu">
                <button className="action-btn user-btn">
                  <FiUser />
                </button>
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-name">{user?.name?.split(' ')[0] || 'User'}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                  {/* ===== ORDER HISTORY BUTTON ===== */}
                  <button onClick={handleOrdersClick} className="user-dropdown-item orders-btn">
                    <FiClipboard /> My Orders
                  </button>
                  <button onClick={handleLogoutClick} className="logout-dropdown-btn">
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              </div>
            )}

            <a href="/shop" className="cta-pill" onClick={(e) => { e.preventDefault(); navigate('/shop'); }}>
              <span className="cta-pill-text">Shop Now</span>
              <span className="cta-pill-arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE HEADER ===== */}
      <div className={`navbar-mobile ${isVisible ? 'navbar-visible' : ''} ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="mobile-container">
          <a href="/" className="mobile-brand-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <div className="mobile-brand-ring">
              <img src="/logo.png" alt="OH" className="mobile-brand-logo" onError={(e) => e.target.style.display='none'} />
            </div>
            <div className="mobile-brand-text">
              <span className="mobile-brand-organic">Organic</span>
              <span className="mobile-brand-heritage">Heritage</span>
            </div>
          </a>

          <div className="mobile-header-actions">
            <button className="mobile-action-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <FiSearch />
            </button>
            <button className="mobile-action-btn cart-mobile-btn" onClick={handleCartClick}>
              <FiShoppingCart />
              {itemCount > 0 && <span className="mobile-cart-badge">{itemCount}</span>}
            </button>
            {!isAuthenticated && (
              <button className="mobile-action-btn" onClick={handleAccountClick}>
                <FiUser />
              </button>
            )}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`mobile-search-bar ${searchOpen ? 'open' : ''}`}>
          <FiSearch className="mobile-search-icon" />
          <input 
            type="text" 
            placeholder="Search organic products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="mobile-search-close" onClick={() => setSearchOpen(false)}><FiX /></button>
        </div>
      </div>

      {/* ===== MOBILE SLIDE MENU (FROM RIGHT) ===== */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="mobile-slide-menu">
            <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
              <FiX />
            </button>

            <div className="mobile-menu-header">
              <div className="mobile-menu-brand">
                <div className="mobile-menu-ring">
                  <img src="/logo.png" alt="OH" className="mobile-menu-logo" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="mobile-menu-title">
                  <span className="menu-title-organic">Organic</span>
                  <span className="menu-title-heritage">Heritage</span>
                </div>
              </div>
            </div>

            {isAuthenticated && user && (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  <FiUser />
                </div>
                <div className="mobile-user-info">
                  <span className="mobile-user-name">{user.name}</span>
                  <span className="mobile-user-email">{user.email}</span>
                </div>
              </div>
            )}

            <nav className="mobile-menu-nav">
              {navLinks.map((link, index) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`mobile-menu-item ${activeLink === link.id ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.id, link.href);
                  }}
                >
                  <span className="mobile-menu-number">0{index + 1}</span>
                  <span className="mobile-menu-label">{link.label}</span>
                  <span className="mobile-menu-arrow">→</span>
                </a>
              ))}

              {/* ===== ORDER HISTORY IN MOBILE MENU ===== */}
              {isAuthenticated && (
                <a
                  href="/orders"
                  className="mobile-menu-item"
                  style={{ animationDelay: '0.48s' }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleOrdersClick();
                  }}
                >
                  <span className="mobile-menu-number">📋</span>
                  <span className="mobile-menu-label">My Orders</span>
                  <span className="mobile-menu-arrow">→</span>
                </a>
              )}

              <a href="#" className="mobile-menu-item cart-menu-item" style={{ animationDelay: '0.56s' }} onClick={(e) => { e.preventDefault(); handleCartClick(); }}>
                <span className="mobile-menu-number">🛒</span>
                <span className="mobile-menu-label">Cart ({itemCount})</span>
                <span className="mobile-menu-arrow">→</span>
              </a>
            </nav>

            <div className="mobile-menu-footer">
              <div className="mobile-menu-buttons">
                {!isAuthenticated ? (
                  <button onClick={handleAccountClick} className="mobile-btn primary">
                    Login / Register
                  </button>
                ) : (
                  <>
                    <button onClick={handleOrdersClick} className="mobile-btn primary">
                      <FiClipboard /> My Orders
                    </button>
                    <button onClick={handleAccountClick} className="mobile-btn secondary">
                      My Account
                    </button>
                    <button onClick={handleLogoutClick} className="mobile-btn secondary">
                      <FiLogOut /> Sign Out
                    </button>
                  </>
                )}
                <a href="/shop" className="mobile-btn accent" onClick={(e) => { e.preventDefault(); navigate('/shop'); setMobileMenuOpen(false); }}>
                  Shop Collection
                </a>
              </div>

              <div className="mobile-menu-social">
                <span>Instagram</span>
                <span>Facebook</span>
                <span>Pinterest</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer for fixed navbar */}
      <div className="navbar-spacer"></div>

      {/* ✅ Cart Drawer - Using isCartOpen from context */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Navbar;