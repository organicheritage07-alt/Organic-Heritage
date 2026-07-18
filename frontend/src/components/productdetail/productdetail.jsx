import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { 
    FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, 
    FaMinus, FaPlus, FaCheck, FaTruck, FaShieldAlt, FaUndo,
    FaLeaf, FaHeart, FaUser, FaArrowRight, FaCheckCircle,
    FaCertificate, FaSeedling, FaFlask, FaAward, FaInfoCircle,
    FaListUl, FaThumbsUp, FaChevronRight, FaExpand, FaTimes,
    FaChevronLeft, FaChevronRight as FaChevronRightNav,
    FaTint, FaSun, FaClock, FaCheckDouble, FaStar as FaStarIcon,
    FaBullseye, FaUsers, FaHandHoldingMedical, FaClipboardList,
    FaRegCheckCircle, FaRegLightbulb, FaRegHeart
, FaBox} from 'react-icons/fa';
import './productdetail.css';

import Testimonials from '../landing/Testimonials/Testimonials';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [images, setImages] = useState([]);

    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [showLightbox, setShowLightbox] = useState(false);
    const imageRef = useRef(null);

    const API_URL = 'http://localhost:5000/api/products';

    // ===== FETCH PRODUCT =====
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/${id}`);
                if (response.data.success) {
                    const prod = response.data.product;
                    setProduct(prod);

                    // Build images array
                    const imgs = [];
                    if (prod.image) imgs.push(prod.image);
                    if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
                        const validAdditionalImages = prod.images.filter(img => 
                            img && typeof img === 'string' && img.trim() !== '' && img !== prod.image
                        );
                        imgs.push(...validAdditionalImages);
                    }
                    setImages(imgs);
                    setSelectedImage(0);

                    fetchRelatedProducts(prod.category);
                } else {
                    setError('Product not found');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const fetchRelatedProducts = async (category) => {
        try {
            const response = await axios.get(API_URL);
            if (response.data.success) {
                const related = response.data.products
                    .filter(p => p.category === category && p._id !== id)
                    .slice(0, 4);
                setRelatedProducts(related);
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    };

    // ===== IMAGE NAVIGATION =====
    const prevImage = useCallback(() => {
        setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const nextImage = useCallback(() => {
        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // ===== KEYBOARD LISTENER =====
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showLightbox) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showLightbox, prevImage, nextImage]);

    // ===== ZOOM HANDLERS =====
    const handleMouseMove = (e) => {
        if (!imageRef.current) return;
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ 
            x: Math.max(0, Math.min(100, x)), 
            y: Math.max(0, Math.min(100, y)) 
        });
    };

    const handleMouseEnter = () => setIsZooming(true);
    const handleMouseLeave = () => setIsZooming(false);

    const openLightbox = () => {
        setShowLightbox(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setShowLightbox(false);
        document.body.style.overflow = 'auto';
    };

    // ===== QUANTITY & CART =====
    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 99) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        setAddingToCart(true);
        await addToCart(product._id, quantity);
        setAddingToCart(false);
    };

    const handleBuyNow = () => {
        addToCart(product._id, quantity);
        navigate('/checkout');
    };

    const formatPrice = (price) => `Rs ${Number(price).toLocaleString('en-PK')}`;

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalf = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={i} />);
        if (hasHalf) stars.push(<FaStarHalfAlt key="half" />);
        for (let i = stars.length; i < 5; i++) stars.push(<FaRegStar key={i} />);
        return stars;
    };

    // ===== LOADING & ERROR STATES =====
    if (loading) {
        return (
            <div className="pd-loading">
                <div className="pd-spinner"></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="pd-error">
                <h2>Product Not Found</h2>
                <p>The product you are looking for does not exist or has been removed.</p>
                <Link to="/" className="pd-btn-back">Continue Shopping</Link>
            </div>
        );
    }

    // ===== CALCULATED VALUES =====
    const discount = product.originalPrice > product.price 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 0;

    // ===== ADMIN DATA =====
    const highlights = product.highlights || [];
    const healthBenefits = product.healthBenefits || [];
    const howToUse = product.howToUse || '';
    const isBestseller = product.tag === 'Bestseller' || product.tag === 'Popular' || product.tag === 'Hot';

    // Parse howToUse into steps
    const parseUsageSteps = (text) => {
        if (!text) return [];
        const byNewline = text.split('\n').filter(s => s.trim().length > 3);
        if (byNewline.length >= 2) return byNewline.slice(0, 4);
        const byPeriod = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
        if (byPeriod.length >= 2) return byPeriod.slice(0, 4);
        return [text];
    };
    const usageSteps = parseUsageSteps(howToUse);

    return (
        <div className="pd-page">
            {/* BREADCRUMB */}
            <div className="pd-breadcrumb-bar">
                <div className="pd-container">
                    <nav className="pd-breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="pd-sep"><FaChevronRight /></span>
                        <Link to="/">Products</Link>
                        <span className="pd-sep"><FaChevronRight /></span>
                        <Link to={`/?category=${product.category}`}>{product.category}</Link>
                        <span className="pd-sep"><FaChevronRight /></span>
                        <span className="pd-current">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* ===== MAIN PRODUCT SECTION ===== */}
            <div className="pd-container">
                <div className="pd-main">
                    {/* LEFT — VERTICAL IMAGE GALLERY */}
                    <div className="pd-gallery-section">
                        <div className="pd-gallery">
                            {images.length > 1 && (
                                <div className="pd-thumbnails-vertical">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            className={`pd-thumb-v ${selectedImage === idx ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(idx)}
                                        >
                                            <img src={img} alt={`${product.name} ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div 
                                className="pd-main-image"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                ref={imageRef}
                            >
                                <div className="pd-studio-stage"></div>

                                {discount > 0 && (
                                    <span className="pd-gallery-discount">-{discount}%</span>
                                )}
                                {isBestseller && (
                                    <span className="pd-gallery-badge">{product.tag?.toUpperCase()}</span>
                                )}

                                <div 
                                    className={`pd-zoom-bg ${isZooming ? 'active' : ''}`}
                                    style={{
                                        backgroundImage: `url(${images[selectedImage] || product.image})`,
                                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    }}
                                />

                                <img 
                                    src={images[selectedImage] || product.image} 
                                    alt={product.name}
                                    className={isZooming ? 'hidden' : ''}
                                    onError={(e) => { e.target.src = product.image; }}
                                />

                                {isZooming && (
                                    <div className="pd-zoom-hint">
                                        <FaExpand /> Move cursor to explore
                                    </div>
                                )}

                                <button 
                                    className="pd-expand-btn"
                                    onClick={openLightbox}
                                    title="View Fullscreen"
                                >
                                    <FaExpand />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — PRODUCT INFO */}
                    <div className="pd-info">
                        <div className="pd-meta-top">
                            <span className="pd-category">{product.category}</span>
                            {product.stock > 0 ? (
                                <span className="pd-stock in-stock">
                                    <FaCheckCircle /> In Stock
                                </span>
                            ) : (
                                <span className="pd-stock out-stock">Out of Stock</span>
                            )}
                        </div>

                        <h1 className="pd-title">{product.name}</h1>
                        {product.subtitle && (
                            <p className="pd-subtitle">{product.subtitle}</p>
                        )}

                        <div className="pd-rating-bar">
                            <div className="pd-stars">{renderStars(product.rating || 4.5)}</div>
                            <span className="pd-rating-text">{product.rating || 4.5} out of 5</span>
                            <span className="pd-reviews-count">({product.reviews || 0} verified reviews)</span>
                        </div>

                        <div className="pd-price-block">
                            <div className="pd-price-row">
                                <span className="pd-current-price">{formatPrice(product.price)}</span>
                                {product.originalPrice > product.price && (
                                    <span className="pd-original-price">{formatPrice(product.originalPrice)}</span>
                                )}
                            </div>
                            {discount > 0 && (
                                <div className="pd-savings">
                                    You save <strong>{formatPrice(product.originalPrice - product.price)}</strong> ({discount}% off)
                                </div>
                            )}
                        </div>

                        <div className="pd-short-desc">
                            <p>{product.description}</p>
                        </div>

                        <div className="pd-trust-badges-row">
                            <span className="pd-trust-badge"><FaCheckCircle /> 100% Natural</span>
                            <span className="pd-trust-badge"><FaLeaf /> Organic</span>
                            <span className="pd-trust-badge"><FaAward /> Premium Quality</span>
                        </div>

                        <div className="pd-actions-section">
                            <div className="pd-quantity-block">
                                <label>Quantity:</label>
                                <div className="pd-qty-selector">
                                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                        <FaMinus />
                                    </button>
                                    <span>{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 99 || quantity >= product.stock}>
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            <div className="pd-buttons">
                                <button 
                                    className={`pd-btn-cart ${addingToCart ? 'loading' : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock <= 0}
                                >
                                    {addingToCart ? 'Adding...' : <><FaShoppingCart /> Add to Cart</>}
                                </button>
                                <button 
                                    className="pd-btn-buy"
                                    onClick={handleBuyNow}
                                    disabled={product.stock <= 0}
                                >
                                    Buy Now <FaArrowRight />
                                </button>
                            </div>
                        </div>

                        <div className="pd-features-grid">
                            <div className="pd-feature">
                                <FaTruck />
                                <div><strong>Free Delivery</strong><span>All over Pakistan</span></div>
                            </div>
                            <div className="pd-feature">
                                <FaShieldAlt />
                                <div><strong>100% Genuine</strong><span>Authentic products</span></div>
                            </div>
                            <div className="pd-feature">
                                <FaUndo />
                                <div><strong>Easy Returns</strong><span>30-day policy</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== GREEN BENEFITS BANNER ===== */}
            <div className="pd-benefits-bar">
                <div className="pd-container">
                    <div className="pd-benefits-grid-bar">
                        <div className="pd-benefit-bar-item">
                            <div className="pd-benefit-bar-icon"><FaTint /></div>
                            <div className="pd-benefit-bar-text">
                                <strong>NOURISHES & FORTIFIES</strong>
                                <span>Essential nutrients for strong hair and healthy skin</span>
                            </div>
                        </div>
                        <div className="pd-benefit-bar-item">
                            <div className="pd-benefit-bar-icon"><FaLeaf /></div>
                            <div className="pd-benefit-bar-text">
                                <strong>REPAIRS & PROTECTS</strong>
                                <span>Repairs damaged cells and protects from external stress</span>
                            </div>
                        </div>
                        <div className="pd-benefit-bar-item">
                            <div className="pd-benefit-bar-icon"><FaSun /></div>
                            <div className="pd-benefit-bar-text">
                                <strong>BRILLIANCE & SOFTNESS</strong>
                                <span>Brings natural glow, softness and vitality</span>
                            </div>
                        </div>
                        <div className="pd-benefit-bar-item">
                            <div className="pd-benefit-bar-icon"><FaHeart /></div>
                            <div className="pd-benefit-bar-text">
                                <strong>BALANCES & RESTORES</strong>
                                <span>Balances body systems for holistic wellness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== 4-COLUMN SINGLE ROW INFO GRID ===== */}
            <div className="pd-info-grid-section">
                <div className="pd-container">
                    <div className="pd-info-grid">

                        {/* COLUMN 1 - KEY HIGHLIGHTS */}
                        <div className="pd-info-col">
                            <div className="pd-col-header">
                                <FaSeedling className="pd-col-icon" />
                                <h3>Key Highlights</h3>
                            </div>
                            <div className="pd-col-body">
                                {highlights.length > 0 ? (
                                    <ul className="pd-highlight-items">
                                        {highlights.map((item, idx) => (
                                            <li key={idx}>
                                                <span className="pd-hl-num">{String(idx + 1).padStart(2, '0')}</span>
                                                <span className="pd-hl-text">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="pd-no-data">No highlights available.</p>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2 - HOW TO USE */}
                        <div className="pd-info-col">
                            <div className="pd-col-header">
                                <FaClipboardList className="pd-col-icon" />
                                <h3>How to Use</h3>
                            </div>
                            <div className="pd-col-body">
                                {usageSteps.length > 0 ? (
                                    <div className="pd-steps-list">
                                        {usageSteps.map((step, idx) => (
                                            <div key={idx} className="pd-step-item">
                                                <div className="pd-step-circle">{idx + 1}</div>
                                                <p>{step.trim()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="pd-no-data">No usage instructions available.</p>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 3 - HEALTH BENEFITS */}
                        <div className="pd-info-col">
                            <div className="pd-col-header">
                                <FaHandHoldingMedical className="pd-col-icon" />
                                <h3>Health Benefits</h3>
                            </div>
                            <div className="pd-col-body">
                                {healthBenefits.length > 0 ? (
                                    <ul className="pd-hb-list">
                                        {healthBenefits.map((benefit, idx) => (
                                            <li key={idx}>
                                                <FaRegHeart />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="pd-no-data">No health benefits listed.</p>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 4 - PRODUCT DETAILS */}
                        <div className="pd-info-col">
                            <div className="pd-col-header">
                                <FaListUl className="pd-col-icon" />
                                <h3>Product Details</h3>
                            </div>
                            <div className="pd-col-body">
                                <div className="pd-detail-rows">
                                    <div className="pd-detail-row">
                                        <FaLeaf />
                                        <div>
                                            <span className="pd-dt-label">Category</span>
                                            <span className="pd-dt-value">{product.category}</span>
                                        </div>
                                    </div>
                                    <div className="pd-detail-row">
                                        <FaBox />
                                        <div>
                                            <span className="pd-dt-label">Stock</span>
                                            <span className="pd-dt-value">{product.stock} units</span>
                                        </div>
                                    </div>
                                    <div className="pd-detail-row">
                                        <FaStar />
                                        <div>
                                            <span className="pd-dt-label">Rating</span>
                                            <span className="pd-dt-value">{product.rating || 4.5} / 5</span>
                                        </div>
                                    </div>
                                    <div className="pd-detail-row">
                                        <FaUsers />
                                        <div>
                                            <span className="pd-dt-label">Reviews</span>
                                            <span className="pd-dt-value">{product.reviews || 0} verified</span>
                                        </div>
                                    </div>
                                    <div className="pd-detail-row">
                                        <FaCheckCircle />
                                        <div>
                                            <span className="pd-dt-label">SKU</span>
                                            <span className="pd-dt-value">{product._id?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ===== TRUST STRIP ===== */}
            <div className="pd-trust-strip">
                <div className="pd-container">
                    <div className="pd-trust-grid">
                        <div className="pd-trust-item">
                            <div className="pd-trust-icon"><FaCertificate /></div>
                            <div className="pd-trust-text">
                                <strong>Certified Organic</strong>
                                <span>Lab tested & verified</span>
                            </div>
                        </div>
                        <div className="pd-trust-item">
                            <div className="pd-trust-icon"><FaSeedling /></div>
                            <div className="pd-trust-text">
                                <strong>100% Natural</strong>
                                <span>No artificial additives</span>
                            </div>
                        </div>
                        <div className="pd-trust-item">
                            <div className="pd-trust-icon"><FaFlask /></div>
                            <div className="pd-trust-text">
                                <strong>Clinically Proven</strong>
                                <span>Backed by research</span>
                            </div>
                        </div>
                        <div className="pd-trust-item">
                            <div className="pd-trust-icon"><FaAward /></div>
                            <div className="pd-trust-text">
                                <strong>Premium Quality</strong>
                                <span>Finest ingredients</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== RELATED PRODUCTS ===== */}
            <div className="pd-container">
                {relatedProducts.length > 0 && (
                    <section className="pd-related">
                        <div className="pd-section-header">
                            <h2>You May Also Like</h2>
                            <div className="pd-header-line"></div>
                        </div>
                        <div className="pd-related-grid">
                            {relatedProducts.map((p) => (
                                <div 
                                    key={p._id} 
                                    className="pd-related-card"
                                    onClick={() => navigate(`/product/${p._id}`)}
                                >
                                    <div className="pd-related-img">
                                        <img src={p.image} alt={p.name} />
                                        {p.originalPrice > p.price && (
                                            <span className="pd-related-discount">
                                                {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="pd-related-info">
                                        <span className="pd-related-cat">{p.category}</span>
                                        <h4>{p.name}</h4>
                                        <div className="pd-related-price">
                                            <span>{formatPrice(p.price)}</span>
                                            {p.originalPrice > p.price && (
                                                <del>{formatPrice(p.originalPrice)}</del>
                                            )}
                                        </div>
                                        <button 
                                            className="pd-related-add-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(p._id, 1);
                                            }}
                                        >
                                            <FaShoppingCart /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ===== TESTIMONIALS ===== */}
            <section className="pd-testimonials-wrap">
                <div className="pd-section-header">
                    <h2>Customer Reviews</h2>
                    <div className="pd-header-line"></div>
                </div>
                <Testimonials />
            </section>

            {/* ===== LIGHTBOX ===== */}
            {showLightbox && (
                <div className="pd-lightbox" onClick={closeLightbox}>
                    <button className="pd-lb-close" onClick={closeLightbox}><FaTimes /></button>
                    {images.length > 1 && (
                        <>
                            <button className="pd-lb-nav pd-lb-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}><FaChevronLeft /></button>
                            <button className="pd-lb-nav pd-lb-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}><FaChevronRightNav /></button>
                        </>
                    )}
                    <div className="pd-lb-content" onClick={(e) => e.stopPropagation()}>
                        <img src={images[selectedImage]} alt={`${product.name} - ${selectedImage + 1}`} />
                        <div className="pd-lb-counter">{selectedImage + 1} / {images.length}</div>
                    </div>
                    {images.length > 1 && (
                        <div className="pd-lb-thumbs" onClick={(e) => e.stopPropagation()}>
                            {images.map((img, idx) => (
                                <button key={idx} className={selectedImage === idx ? 'active' : ''} onClick={() => setSelectedImage(idx)}>
                                    <img src={img} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetail;