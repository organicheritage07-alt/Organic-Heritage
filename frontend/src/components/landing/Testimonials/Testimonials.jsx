import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './Testimonials.css';

// FALLBACK DATA
const fallbackTestimonials = [
    {
        id: 1,
        name: 'Sarah Chen',
        role: 'Wellness Coach',
        rating: 5,
        text: 'The Ashwagandha capsules have been a game-changer for my daily routine. My stress levels are noticeably lower and my energy has improved significantly.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
        product: 'Ashwagandha',
        city: 'Lahore'
    },
    {
        id: 2,
        name: 'Marcus Johnson',
        role: 'Fitness Trainer',
        rating: 5,
        text: 'I recommend these supplements to all my clients. The purity and potency are unmatched.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
        product: 'Multiple',
        city: 'Karachi'
    },
    {
        id: 3,
        name: 'Priya Sharma',
        role: 'Yoga Instructor',
        rating: 5,
        text: 'Finally found organic supplements that actually work! My digestion has improved and I feel more balanced throughout the day.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
        product: 'Shatavari',
        city: 'Islamabad'
    },
    {
        id: 4,
        name: 'David Park',
        role: 'Nutritionist',
        rating: 5,
        text: 'As a nutritionist, I am very particular about supplement quality. These products exceed all my expectations.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        product: 'Moringa',
        city: 'Peshawar'
    },
    {
        id: 5,
        name: 'Emma Wilson',
        role: 'Health Blogger',
        rating: 5,
        text: 'Been using these for 3 months now. My skin is glowing, my energy is up, and I sleep better than ever.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
        product: 'Haldi',
        city: 'Quetta'
    },
    {
        id: 6,
        name: 'James Miller',
        role: 'Personal Trainer',
        rating: 5,
        text: 'The Beetroot capsules are perfect for pre-workout energy. No jitters, just clean sustained energy.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        product: 'Beetroot',
        city: 'Multan'
    }
];

// Product data for background images
const backgroundProducts = [
    { id: 1, name: 'Ashwagandha', image: './ashwaganda.png' },
    { id: 2, name: 'Haldi', image: './ambahaldii.png' },
    { id: 3, name: 'Moringa', image: './moringa.png' },
    { id: 4, name: 'Beetroot', image: './beetroot.png' }
];

function Testimonials() {
    const navigate = useNavigate();
    const [bgIndex, setBgIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const sectionRef = useRef(null);

    const currentProduct = backgroundProducts[bgIndex];

    // Fetch real reviews from API
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/reviews/public');
                if (response.data.success && response.data.reviews.length > 0) {
                    const formattedReviews = response.data.reviews.map((review) => ({
                        id: review._id,
                        name: review.userName || 'Anonymous',
                        role: `${review.rating} Star`,
                        rating: review.rating,
                        text: review.comment,
                        avatar: review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || 'User')}&background=2D6A4F&color=fff&size=80`,
                        product: review.productName || 'Organic Product',
                        city: review.city || 'Pakistan'
                    }));
                    setReviews(formattedReviews);
                } else {
                    setReviews(fallbackTestimonials);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews(fallbackTestimonials);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Intersection Observer for scroll animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Background auto-change with animation
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setBgIndex((prev) => (prev + 1) % backgroundProducts.length);
                setTimeout(() => setIsAnimating(false), 100);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>
                    &#9733;
                </span>
            );
        }
        return <div className="testimonial-stars">{stars}</div>;
    };

    // ✅ UPDATED: SIRF REDIRECT CHANGE - DESIGN SAME
    const openReviewForm = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // ✅ Save current path for redirect after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            // ✅ Direct redirect to login (NO POPUP)
            navigate('/login');
            return;
        }
        setSelectedRating(0);
        setHoveredRating(0);
        setShowReviewForm(true);
    };

    // SUBMIT REVIEW
    const submitReview = async (e) => {
        e.preventDefault();
        const form = e.target;
        const rating = selectedRating;
        const title = form.title.value.trim();
        const comment = form.comment.value.trim();
        const productName = form.productName.value.trim();
        const city = form.city.value.trim();

        if (!rating || !comment || comment.length < 10) {
            Swal.fire({
                title: 'Error',
                text: 'Please provide a rating and a review (minimum 10 characters)',
                icon: 'warning',
                confirmButtonColor: '#2D6A4F'
            });
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/reviews',
                {
                    rating,
                    title,
                    comment,
                    productName: productName || 'Organic Product',
                    city: city || 'Pakistan'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                Swal.fire({
                    title: 'Thank You!',
                    text: 'Your review has been submitted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#2D6A4F',
                    timer: 3000,
                    showConfirmButton: false
                });
                setShowReviewForm(false);
                
                // Refetch reviews
                const refreshResponse = await axios.get('http://localhost:5000/api/reviews/public');
                if (refreshResponse.data.success && refreshResponse.data.reviews.length > 0) {
                    const formatted = refreshResponse.data.reviews.map((review) => ({
                        id: review._id,
                        name: review.userName || 'Anonymous',
                        role: `${review.rating} Star`,
                        rating: review.rating,
                        text: review.comment,
                        avatar: review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || 'User')}&background=2D6A4F&color=fff&size=80`,
                        product: review.productName || 'Organic Product',
                        city: review.city || 'Pakistan'
                    }));
                    setReviews(formatted);
                }
            }
        } catch (error) {
            console.error('Submit review error:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to submit review',
                icon: 'error',
                confirmButtonColor: '#2D6A4F'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRatingClick = (rating) => {
        setSelectedRating(rating);
    };

    const handleRatingHover = (rating) => {
        setHoveredRating(rating);
    };

    const handleRatingLeave = () => {
        setHoveredRating(0);
    };

    // Get display reviews
    const displayReviews = reviews.length > 0 ? reviews : fallbackTestimonials;

    if (loading) {
        return (
            <section className={`testimonials-section ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
                <div className="testimonials-loading">
                    <div className="spinner"></div>
                    <p>Loading reviews...</p>
                </div>
            </section>
        );
    }

    return (
        <section className={`testimonials-section ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
            {/* BANNER WITH IMAGE */}
            <div className="image-wrapper">
                <div className="image-area">
                    {backgroundProducts.map((product, index) => (
                        <div
                            key={index}
                            className={`bg-image ${index === bgIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${product.image})` }}
                        />
                    ))}
                    <div className="image-overlay" />

                    <div className={`image-content ${isVisible ? 'fade-in-up' : ''}`}>
                        <div className={`product-name-wrapper ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                            <h2 className="product-name">{currentProduct.name}</h2>
                        </div>

                        <h2 className="title">
                            Our Lovely Customers
                            <span>Say it Best</span>
                        </h2>

                        <div className="bg-dots">
                            {backgroundProducts.map((_, index) => (
                                <button
                                    key={index}
                                    className={`dot ${index === bgIndex ? 'active' : ''}`}
                                    onClick={() => setBgIndex(index)}
                                    aria-label={`Background ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* REVIEW BAR - BELOW BANNER */}
            <div className="review-bar">
                <div className="review-bar-content">
                    <div className="review-bar-text">
                        <h4>Share Your Experience</h4>
                        <p>Help others discover the benefits of organic living</p>
                    </div>
                    <button className="review-bar-btn" onClick={openReviewForm}>
                        <span>Write a Review</span>
                    </button>
                </div>
            </div>

            {/* REVIEW FORM MODAL - COMPACT NO SCROLL */}
            {showReviewForm && (
                <div className="review-modal-overlay" onClick={() => setShowReviewForm(false)}>
                    <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <div>
                                <h3 className="review-modal-title">Write a Review</h3>
                                <p className="review-modal-sub">Share your experience with our products</p>
                            </div>
                            <button className="review-modal-close" onClick={() => setShowReviewForm(false)}>&times;</button>
                        </div>

                        <form onSubmit={submitReview} className="review-form">
                            {/* RATING */}
                            <div className="review-form-group">
                                <label>Rating *</label>
                                <div className="review-rating-input">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <span
                                            key={num}
                                            className={`rating-star ${num <= (hoveredRating || selectedRating) ? 'active' : ''}`}
                                            onClick={() => handleRatingClick(num)}
                                            onMouseEnter={() => handleRatingHover(num)}
                                            onMouseLeave={handleRatingLeave}
                                        >
                                            &#9733;
                                        </span>
                                    ))}
                                    <span className="rating-label">
                                        {selectedRating > 0 ? `${selectedRating} / 5 Stars` : 'Select rating'}
                                    </span>
                                </div>
                            </div>

                            {/* TWO COLUMN ROW */}
                            <div className="review-form-row">
                                <div className="review-form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="productName"
                                        placeholder="e.g. Ashwagandha"
                                        required
                                        className="review-input"
                                    />
                                </div>
                                <div className="review-form-group">
                                    <label>Your City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="e.g. Lahore"
                                        className="review-input"
                                    />
                                </div>
                            </div>

                            <div className="review-form-group">
                                <label>Review Title (Optional)</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Summarize your experience"
                                    className="review-input"
                                />
                            </div>

                            <div className="review-form-group">
                                <label>Your Review *</label>
                                <textarea
                                    name="comment"
                                    rows="3"
                                    placeholder="Share your experience (min 10 chars)..."
                                    required
                                    className="review-textarea"
                                />
                            </div>

                            <button type="submit" className="review-submit-btn" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CARDS ROW */}
            <div className={`cards-wrapper ${isVisible ? 'fade-in-up-delay' : ''}`}>
                <div className="cards-track">
                    {displayReviews.map((testimonial, index) => (
                        <div key={testimonial.id || index} className={`card ${index % 2 === 0 ? 'card-up' : 'card-down'}`}>
                            <div className="card-inner">
                                <div className="card-header">
                                    <div className="header-left">
                                        <div className="avatar">
                                            <img 
                                                src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2D6A4F&color=fff&size=80`} 
                                                alt={testimonial.name} 
                                                loading="lazy" 
                                            />
                                        </div>
                                        <div className="header-info">
                                            <span className="name">{testimonial.name}</span>
                                            <span className="role">
                                                {testimonial.city && <span className="city-badge">{testimonial.city}</span>}
                                                {testimonial.role && <span className="role-text">{testimonial.role}</span>}
                                            </span>
                                        </div>
                                    </div>
                                    {renderStars(testimonial.rating || 5)}
                                </div>
                                <p className="card-text">"{testimonial.text}"</p>
                                <button 
                                    className="shop-link" 
                                    onClick={() => {
                                        const featuredSection = document.getElementById('featured-products');
                                        if (featuredSection) {
                                            featuredSection.scrollIntoView({ behavior: 'smooth' });
                                        } else {
                                            navigate('/');
                                            setTimeout(() => {
                                                const el = document.getElementById('featured-products');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }, 500);
                                        }
                                    }}
                                >
                                    Shop {testimonial.product || 'Products'} &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Testimonials;