import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';

// ✅ CartProvider
import { CartProvider } from './context/CartContext';

// Components
import Preloader from './components/Preloader/Preloader';
import Navbar from './components/landing/Navbar/Navbar';
import HeroSection from './components/landing/HeroSection/HeroSection';
import TrustBadges from './components/landing/TrustBadges/TrustBadges';
import IngredientsSpotlight from './components/landing/IngredientsSpotlight/IngredientsSpotlight';
import BenefitsSection from './components/landing/Benefits/BenefitsSection';
import FeaturedProducts from './components/landing/FeaturedProducts/FeaturedProducts';
import TrustPillars from './components/landing/TrustPillars/TrustPillars';
import FAQ from './components/landing/FAQ/FAQ'; // ✅ ADD THIS
import Testimonials from './components/landing/Testimonials/Testimonials';
import Footer from './components/landing/Footer/Footer';

// ✅ Sticky Contact Sidebar
import StickyContact from './components/landing/StickyContact/StickyContact';

// Auth Components
import Auth from './components/auth/Auth';
import AuthCallback from './components/auth/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// ✅ Cart Component
import Cart from './components/cart/Cart';

// ✅ Product Detail Component
import ProductDetail from './components/productdetail/productdetail';

// ✅ Checkout Components
import Checkout from './components/checkout/Checkout';
import OrderConfirmation from './components/order-confirmation/OrderConfirmation';

// ✅ Orders Component
import Orders from './components/orders/Orders';

// ✅ Pages Components
import ProductsPage from './components/pages/ProductsPage/ProductsPage';
import ContactPage from './components/pages/ContactPage/ContactPage';
import StoryPage from './components/pages/StoryPage/StoryPage';
import IngredientsPage from './components/pages/IngredientsPage/IngredientsPage';

function App() {
    const [loading, setLoading] = useState(true);
    const [heroVisible, setHeroVisible] = useState(false);

    const handlePreloaderComplete = useCallback(() => {
        setLoading(false);
        setTimeout(() => {
            setHeroVisible(true);
        }, 100);
    }, []);

    useEffect(() => {
        if (!loading) {
            document.body.style.overflow = 'auto';
            document.body.style.position = 'static';
            document.body.style.width = 'auto';
            document.body.style.height = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }, [loading]);

    return (
        <Provider store={store}>
            <CartProvider>
                <BrowserRouter>
                    <Toaster 
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#2D6A4F',
                                color: '#fff',
                                borderRadius: '0px',
                            },
                        }}
                    />

                    {loading && (
                        <div style={{ 
                            position: 'fixed', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            zIndex: 99999,
                            pointerEvents: 'auto'
                        }}>
                            <Preloader onComplete={handlePreloaderComplete} />
                        </div>
                    )}

                    <Routes>
                        {/* ===== AUTH ROUTES ===== */}
                        <Route path="/login" element={<Auth />} />
                        <Route path="/register" element={<Auth />} />
                        <Route path="/profile" element={<Navigate to="/login" replace />} />

                        {/* ===== GOOGLE OAUTH CALLBACK ===== */}
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* ===== ADMIN ROUTES ===== */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute adminOnly={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />

                        {/* ===== MAIN WEBSITE ROUTE ===== */}
                        <Route path="/" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <HeroSection visible={heroVisible} />
                                <TrustBadges />
                                <IngredientsSpotlight />
                                <BenefitsSection />
                                <FeaturedProducts />
                                <TrustPillars />
                                <FAQ />  {/* ✅ ADDED - After TrustPillars */}
                                <Testimonials />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== PRODUCTS PAGE ROUTE ===== */}
                        <Route path="/products" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <ProductsPage />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== CONTACT PAGE ROUTE ===== */}
                        <Route path="/contact" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <ContactPage />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== STORY PAGE ROUTE ===== */}
                        <Route path="/story" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <StoryPage />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== INGREDIENTS PAGE ROUTE ===== */}
                        <Route path="/ingredients" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <IngredientsPage />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== PRODUCT DETAIL ROUTE ===== */}
                        <Route path="/product/:id" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <ProductDetail />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== CART ROUTE ===== */}
                        <Route path="/cart" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <Cart />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== CHECKOUT ROUTE ===== */}
                        <Route path="/checkout" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <Checkout />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== ORDER CONFIRMATION ROUTE ===== */}
                        <Route path="/order-confirmation/:id" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <OrderConfirmation />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />

                        {/* ===== ORDERS HISTORY ROUTE ===== */}
                        <Route path="/orders" element={
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 1,
                                width: '100%',
                                minHeight: '100vh'
                            }}>
                                <Navbar />
                                <Orders />
                                <Footer />
                                <StickyContact />
                            </div>
                        } />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </Provider>
    );
}

export default App;