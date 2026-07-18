import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import toast from 'react-hot-toast';
import Testimonials from '../../landing/Testimonials/Testimonials'; // ✅ IMPORT TESTIMONIALS
import './ProductsPage.css';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [likedProducts, setLikedProducts] = useState(new Set());
    const [activeCategory, setActiveCategory] = useState('All');
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { addToCart, openCart } = useCart();
    const navigate = useNavigate();

    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const filterRef = useRef(null);
    const cardsRef = useRef([]);

    const API_URL = 'http://localhost:5000/api/products';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const productsRes = await axios.get(API_URL);
                
                if (productsRes.data.success) {
                    setProducts(productsRes.data.products);
                } else {
                    setError('Failed to load products');
                }

                const categoriesRes = await axios.get(`${API_URL}/categories/all`);
                if (categoriesRes.data.success) {
                    setCategories(categoriesRes.data.categories);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter by category and search
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             product.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Intersection Observer with proper cleanup
    useEffect(() => {
        cardsRef.current = cardsRef.current.slice(0, filteredProducts.length);

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.05
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-visible');
                    entry.target.classList.remove('scroll-hidden');
                }
            });
        }, observerOptions);

        const timeoutId = setTimeout(() => {
            const elements = [
                headerRef.current,
                filterRef.current,
                ...cardsRef.current.filter(Boolean)
            ];

            elements.forEach(el => {
                if (el) {
                    el.classList.add('scroll-hidden');
                    el.classList.remove('scroll-visible');
                    observer.observe(el);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [filteredProducts]);

    const toggleLike = (id, e) => {
        e.stopPropagation();
        setLikedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleAddToCart = async (productId, e) => {
        e.stopPropagation();
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            toast.error('Please login to add items to your cart', {
                duration: 3000,
                style: {
                    background: '#1B2E1A',
                    color: '#ffffff',
                    borderRadius: '8px',
                }
            });
            setTimeout(() => {
                navigate('/login');
            }, 1000);
            return;
        }
        
        setAddingToCart(productId);
        
        try {
            const result = await addToCart(productId, 1);
            
            if (result) {
                setTimeout(() => {
                    setAddingToCart(null);
                    openCart();
                }, 400);
            } else {
                setAddingToCart(null);
            }
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            setAddingToCart(null);
        }
    };

    const handleCardClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        const hasHalf = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star-filled">★</span>);
        }
        if (hasHalf) {
            stars.push(<span key="half" className="star-half">★</span>);
        }
        for (let i = stars.length; i < 5; i++) {
            stars.push(<span key={i} className="star-empty">☆</span>);
        }
        return stars;
    };

    const formatPrice = (price) => {
        return `Rs ${Number(price).toLocaleString('en-PK')}`;
    };

    if (error) {
        return (
            <section className="products-page" ref={sectionRef}>
                <div className="pp-container" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <p style={{ color: '#DC2626', fontSize: '1.2rem' }}>⚠️ {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 30px', background: '#1B2E1A', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="products-page" ref={sectionRef}>
                <div className="pp-container" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div className="spinner" style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '4px solid #E5E7EB',
                        borderTopColor: '#2D6A4F',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>Loading Products...</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="products-page" ref={sectionRef}>
                <div className="pp-container">
                    {/* ===== COMPRESSED HEADER ===== */}
                    <div 
                        className="pp-header scroll-animate"
                        ref={headerRef}
                        style={{ transitionDelay: '0s' }}
                    >
                        <span className="pp-tag">Our Collection</span>
                        <h1 className="pp-title">
                            All <span className="pp-highlight">Products</span>
                        </h1>
                        <p className="pp-subtitle">
                            Discover nature's finest organic supplements
                        </p>
                    </div>

                    {/* ===== SEARCH & FILTER ===== */}
                    <div 
                        className="pp-filter-section scroll-animate"
                        ref={filterRef}
                        style={{ transitionDelay: '0.15s' }}
                    >
                        <div className="pp-search-wrapper">
                            <input
                                type="text"
                                className="pp-search-input"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="pp-search-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21l-4.35-4.35"/>
                                </svg>
                            </button>
                        </div>

                        <div className="pp-filter-buttons">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`pp-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ===== PRODUCTS COUNT ===== */}
                    <div className="pp-products-count">
                        <span>{filteredProducts.length} products found</span>
                    </div>

                    {/* ===== PRODUCTS GRID ===== */}
                    <div className="pp-grid">
                        {filteredProducts.length === 0 ? (
                            <div style={{ 
                                gridColumn: '1 / -1', 
                                textAlign: 'center', 
                                padding: '60px 0',
                                color: '#6B7280'
                            }}>
                                <p style={{ fontSize: '1.2rem' }}>No products found in this category</p>
                            </div>
                        ) : (
                            filteredProducts.map((product, index) => {
                                const isAdding = addingToCart === product._id;
                                
                                return (
                                    <div 
                                        key={product._id || product.id} 
                                        className="pp-card scroll-animate"
                                        ref={el => {
                                            cardsRef.current[index] = el;
                                        }}
                                        style={{ transitionDelay: `${0.1 + index * 0.08}s` }}
                                        onMouseEnter={() => setHoveredCard(product._id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        onClick={() => handleCardClick(product._id)}
                                    >
                                        {product.discount > 0 && (
                                            <div className="pp-discount-badge">
                                                -{product.discount}%
                                            </div>
                                        )}

                                        {product.tag && (
                                            <div className="pp-product-tag" style={{
                                                background: product.tag === 'Bestseller' ? '#1B2E1A' : 
                                                             product.tag === 'Hot' ? '#DC2626' :
                                                             product.tag === 'New' ? '#2D6A4F' : '#C4943A'
                                            }}>
                                                {product.tag}
                                            </div>
                                        )}

                                        <div className="pp-image-wrap">
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className={`pp-image ${hoveredCard === product._id ? 'pp-hover' : ''}`}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                }}
                                            />
                                            <div className="pp-img-shadow"></div>
                                        </div>

                                        <div className="pp-body">
                                            <h3 className="pp-name">{product.name}</h3>
                                            <p className="pp-subtitle-text">{product.subtitle}</p>
                                            <p className="pp-description">{product.description}</p>

                                            <div className="pp-rating">
                                                <div className="pp-stars">
                                                    {renderStars(product.rating || 4.5)}
                                                </div>
                                                <span className="pp-reviews">({product.reviews || 0} reviews)</span>
                                            </div>

                                            <div className="pp-price-section">
                                                <div className="pp-price-row">
                                                    <span className="pp-price">{formatPrice(product.price)}</span>
                                                    <span className="pp-old">{formatPrice(product.originalPrice)}</span>
                                                </div>
                                                <div className="pp-save-text">
                                                    You save <span className="pp-save-amount">{formatPrice(product.originalPrice - product.price)}</span>
                                                </div>
                                            </div>

                                            <div className="pp-action-row">
                                                <button 
                                                    className={`pp-cart-btn ${isAdding ? 'adding' : ''}`}
                                                    onClick={(e) => handleAddToCart(product._id, e)}
                                                    disabled={isAdding}
                                                >
                                                    {isAdding ? (
                                                        <>
                                                            <span className="pp-btn-spinner"></span>
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="9" cy="21" r="1"></circle>
                                                                <circle cx="20" cy="21" r="1"></circle>
                                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                            </svg>
                                                            Add to Cart
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    className={`pp-wishlist ${likedProducts.has(product._id) ? 'liked' : ''}`}
                                                    onClick={(e) => toggleLike(product._id, e)}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill={likedProducts.has(product._id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <Testimonials />
        </>
    );
}

export default ProductsPage;