import React, { useState, useEffect } from 'react';
import { 
    FaLeaf, FaSearch, FaTimes, FaCheckCircle, 
    FaSeedling, FaFlask, FaHeart, FaShieldAlt, 
    FaArrowRight, FaSpa, FaAppleAlt, FaTag, FaBox
} from 'react-icons/fa';
import './IngredientsPage.css';

const ingredientsData = [
    {
        id: 1,
        name: 'Ashwagandha',
        scientificName: 'Withania somnifera',
        category: 'Roots',
        productForm: ['Capsules', 'Powder'],
        image: '/ashwaganda.png',
        productImage: '/ashwaganda-product.png',
        icon: <FaLeaf />,
        keyBenefits: ['Stress Relief', 'Energy Booster', 'Better Sleep'],
        shortDesc: 'Ancient adaptogenic herb for stress relief and vitality',
        description: 'Ashwagandha is one of the most powerful herbs in Ayurveda. This adaptogenic herb helps your body manage stress more effectively by reducing cortisol levels. It has been used for over 3,000 years to boost energy, improve concentration, and support overall wellness.',
        benefitsDetailed: [
            'Reduces stress and anxiety naturally',
            'Improves brain function and memory',
            'Boosts energy and stamina',
            'Supports better sleep quality',
            'Enhances immune system response'
        ],
        source: 'Punjab, Pakistan (Certified Organic Farms)',
        relatedProducts: ['Ashwagandha Capsules', 'Ashwagandha Powder'],
        color: '#2D6A4F',
        tag: 'Hormonal Balance'
    },
    {
        id: 2,
        name: 'Shatavari',
        scientificName: 'Asparagus racemosus',
        category: 'Roots',
        productForm: ['Capsules', 'Powder'],
        image: '/shatavari.png',
        productImage: '/shatavari-product.png',
        icon: <FaSpa />,
        keyBenefits: ["Women's Health", 'Hormonal Balance', 'Lactation Support'],
        shortDesc: "Ayurvedic herb for women's wellness and hormonal harmony",
        description: 'Shatavari is a celebrated Ayurvedic herb primarily used for supporting women\'s reproductive health. It helps maintain hormonal balance, supports lactation in nursing mothers, and promotes overall vitality.',
        benefitsDetailed: [
            'Balances female hormones naturally',
            'Supports reproductive health',
            'Promotes lactation in nursing mothers',
            'Boosts immunity and vitality',
            'Supports digestive health'
        ],
        source: 'Punjab & Sindh, Pakistan (Organic Cultivation)',
        relatedProducts: ['Shatavari Capsules', 'Shatavari Powder'],
        color: '#D4A574',
        tag: 'Women\'s Wellness'
    },
    {
        id: 3,
        name: 'Moringa',
        scientificName: 'Moringa oleifera',
        category: 'Supergreens',
        productForm: ['Capsules', 'Powder'],
        image: '/moringa.png',
        productImage: '/moringa-product.png',
        icon: <FaAppleAlt />,
        keyBenefits: ['92+ Nutrients', 'Energy Boost', 'Skin Health'],
        shortDesc: 'The miracle tree with 92+ vitamins and minerals',
        description: 'Moringa is often called the "miracle tree" because of its incredible nutritional profile. Packed with over 92 essential vitamins, minerals, and antioxidants, it\'s one of the most nutrient-dense plants on earth.',
        benefitsDetailed: [
            'Provides 92+ vitamins and minerals',
            'Boosts natural energy levels',
            'Supports heart health',
            'Promotes healthy and glowing skin',
            'Strengthens immune system'
        ],
        source: 'Punjab, Pakistan (Organic Cultivation)',
        relatedProducts: ['Moringa Capsules', 'Moringa Powder'],
        color: '#6B8E5A',
        tag: 'Superfood'
    },
    {
        id: 4,
        name: 'Beetroot',
        scientificName: 'Beta vulgaris',
        category: 'Roots',
        productForm: ['Capsules'],
        image: '/beetroot.png',
        productImage: '/beetroot-product.png',
        icon: <FaHeart />,
        keyBenefits: ['Blood Circulation', 'Heart Health', 'Athletic Performance'],
        shortDesc: "Nature's blood purifier for heart health and vitality",
        description: 'Beetroot is a nutrient-rich root vegetable known for its deep red color and powerful health benefits. Rich in nitrates, it helps improve blood circulation, lower blood pressure, and enhance athletic performance.',
        benefitsDetailed: [
            'Improves blood circulation',
            'Supports heart health',
            'Boosts athletic performance',
            'Purifies blood naturally',
            'Rich in antioxidants'
        ],
        source: 'Punjab, Pakistan (Organic Farms)',
        relatedProducts: ['Beetroot Capsules'],
        color: '#B85C5C',
        tag: 'Heart Health'
    },
    {
        id: 5,
        name: 'Haldi (Turmeric)',
        scientificName: 'Curcuma longa',
        category: 'Roots',
        productForm: ['Capsules', 'Powder'],
        image: '/ambahaldii.png',
        productImage: '/haldi-product.png',
        icon: <FaLeaf />,
        keyBenefits: ['Anti-Inflammatory', 'Joint Health', 'Digestion'],
        shortDesc: 'The golden spice of Ayurveda for inflammation and joint health',
        description: 'Turmeric, or Haldi, is a golden spice that has been used in Ayurveda for thousands of years. Its active compound curcumin is a powerful anti-inflammatory that supports joint health, aids digestion, and boosts immunity.',
        benefitsDetailed: [
            'Powerful anti-inflammatory properties',
            'Supports joint health and mobility',
            'Aids digestion and gut health',
            'Boosts immune system function',
            'Supports cardiovascular health'
        ],
        source: 'Punjab, Pakistan (Organic Cultivation)',
        relatedProducts: ['Haldi Capsules', 'Haldi Powder'],
        color: '#C4943A',
        tag: 'Anti-Inflammatory'
    },
    {
        id: 6,
        name: 'Pumpkin Seeds',
        scientificName: 'Cucurbita pepo',
        category: 'Seeds',
        productForm: ['Seeds'],
        image: '/pumpkin-seeds.png',
        productImage: '/pumpkin-product.png',
        icon: <FaSeedling />,
        keyBenefits: ['Heart Health', 'Sleep Quality', 'Hair Growth'],
        shortDesc: 'Nutrient-rich seeds for heart health and wellness',
        description: 'Pumpkin seeds are a nutritional powerhouse packed with essential minerals and healthy fats. Rich in zinc, magnesium, and omega-3 fatty acids, they support heart health, promote better sleep, strengthen hair, and boost overall wellness.',
        benefitsDetailed: [
            'Supports heart health with healthy fats',
            'Promotes better sleep quality',
            'Strengthens hair and nails',
            'Rich in antioxidants',
            'Supports prostate health'
        ],
        source: 'Locally Sourced Organic Pumpkins',
        relatedProducts: ['Pumpkin Seeds'],
        color: '#8B6B4F',
        tag: 'Nutrient-Rich'
    },
    {
        id: 7,
        name: 'Chia Seeds',
        scientificName: 'Salvia hispanica',
        category: 'Seeds',
        productForm: ['Seeds'],
        image: '/chia-seeds.png',
        productImage: '/chia-product.png',
        icon: <FaSeedling />,
        keyBenefits: ['Digestive Health', 'Omega-3 Rich', 'Energy Boost'],
        shortDesc: 'Super seeds for digestive health and sustained energy',
        description: 'Chia seeds are ancient superfoods packed with fiber, omega-3 fatty acids, protein, and minerals. These tiny seeds can absorb up to 10 times their weight in water, promoting fullness, digestion, and sustained energy throughout the day.',
        benefitsDetailed: [
            'Rich in omega-3 fatty acids',
            'Supports digestive health with high fiber',
            'Provides sustained energy',
            'Supports bone health with calcium',
            'Helps with weight management'
        ],
        source: 'Imported Organic (Premium Quality)',
        relatedProducts: ['Chia Seeds'],
        color: '#8F8F8F',
        tag: 'Omega-3 Rich'
    },
    {
        id: 8,
        name: 'Wheat',
        scientificName: 'Triticum aestivum',
        category: 'Grains',
        productForm: ['Heat Pack'],
        image: '/wheat-heat-pack.png',
        productImage: '/wheat-product.png',
        icon: <FaAppleAlt />,
        keyBenefits: ['Heat Therapy', 'Muscle Relief', 'Stress Reduction'],
        shortDesc: 'Pure organic wheat heat pack for natural therapy',
        description: 'Our Wheat Heat Pack is made from 100% organic wheat and a soft, natural cotton cover. It provides gentle, penetrating heat therapy that soothes muscles, relieves stress, and promotes relaxation.',
        benefitsDetailed: [
            'Provides natural heat therapy',
            'Soothes tired and sore muscles',
            'Reduces stress and tension',
            'Promotes relaxation and comfort',
            'Eco-friendly and reusable'
        ],
        source: 'Locally Sourced Organic Wheat',
        relatedProducts: ['Wheat Heat Pack'],
        color: '#C4A265',
        tag: 'Therapy'
    }
];

function IngredientsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = ['All', 'Roots', 'Seeds', 'Supergreens', 'Grains'];

    const filteredIngredients = ingredientsData.filter(ingredient => {
        const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             ingredient.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             ingredient.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || ingredient.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const openIngredientDetail = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeIngredientDetail = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeIngredientDetail();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isModalOpen]);

    return (
        <div className="ingredients-page-premium">
            {/* ===== HERO SECTION ===== */}
            <section className="ingredients-hero-premium">
                <div className="ingredients-hero-premium-container">
                    <div className="ingredients-hero-premium-content">
                        <span className="hero-tag">The Source</span>
                        <h1 className="hero-title">
                            Pure Potency. <br />
                            <span className="hero-highlight">Transparent Sourcing.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Explore the raw, wild-harvested botanicals that fuel our daily rituals. 
                            Click any ingredient to learn about its origin, benefits, and which of our products it powers.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== SEARCH & FILTER BAR ===== */}
            <section className="ingredients-filter-premium">
                <div className="filter-premium-container">
                    <div className="search-premium-wrapper">
                        <FaSearch className="search-premium-icon" />
                        <input
                            type="text"
                            placeholder="Search ingredients by name, benefit, or source..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-premium-input"
                        />
                        {searchTerm && (
                            <button className="search-premium-clear" onClick={() => setSearchTerm('')}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <div className="filter-premium-chips">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`filter-premium-chip ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== VISUAL INTERACTIVE GRID ===== */}
            <section className="ingredients-grid-premium">
                <div className="grid-premium-container">
                    {filteredIngredients.length === 0 ? (
                        <div className="grid-premium-empty">
                            <FaLeaf className="empty-icon" />
                            <h3>No ingredients found</h3>
                            <p>Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        <div className="grid-premium">
                            {filteredIngredients.map((ingredient) => (
                                <div
                                    key={ingredient.id}
                                    className="grid-premium-card"
                                    onClick={() => openIngredientDetail(ingredient)}
                                >
                                    {/* Full-bleed image - 70% of card */}
                                    <div className="card-premium-image">
                                        <img src={ingredient.image} alt={ingredient.name} />
                                        <div className="card-premium-overlay">
                                            <span className="card-premium-click">Click to Discover →</span>
                                        </div>
                                    </div>
                                    {/* Bottom 30% - White with name & tag */}
                                    <div className="card-premium-info">
                                        <h3 className="card-premium-name">{ingredient.name}</h3>
                                        <span className="card-premium-tag" style={{ color: ingredient.color }}>
                                            {ingredient.tag}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== PREMIUM MODAL / SPLIT PANEL ===== */}
            {isModalOpen && selectedIngredient && (
                <div className="modal-premium-overlay" onClick={closeIngredientDetail}>
                    <div className="modal-premium" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-premium-close" onClick={closeIngredientDetail}>
                            <FaTimes />
                        </button>

                        <div className="modal-premium-split">
                            {/* LEFT - Visuals (Raw + Product Images) */}
                            <div className="modal-premium-visual">
                                <div className="visual-raw-image">
                                    <img src={selectedIngredient.image} alt={selectedIngredient.name} />
                                    <span className="visual-raw-label">Raw Ingredient</span>
                                </div>
                                <div className="visual-product-image">
                                    <img src={selectedIngredient.productImage || selectedIngredient.image} alt={selectedIngredient.name} />
                                    <span className="visual-product-label">Finished Product</span>
                                </div>
                            </div>

                            {/* RIGHT - Content */}
                            <div className="modal-premium-content">
                                <div className="content-botanical">
                                    <span className="botanical-name">{selectedIngredient.scientificName}</span>
                                    <h2 className="content-name">{selectedIngredient.name}</h2>
                                </div>

                                <div className="content-source">
                                    <h4>Where We Source</h4>
                                    <p>{selectedIngredient.source}</p>
                                </div>

                                <div className="content-benefits">
                                    <h4>Key Benefits</h4>
                                    <ul>
                                        {selectedIngredient.benefitsDetailed.map((benefit, idx) => (
                                            <li key={idx}>
                                                <FaLeaf className="benefit-leaf" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="content-products">
                                    <h4>Available In</h4>
                                    <div className="products-tags">
                                        {selectedIngredient.relatedProducts.map((product, idx) => (
                                            <span key={idx} className="product-tag">
                                                <FaBox /> {product}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button className="content-cta-btn">
                                    Shop Products with {selectedIngredient.name} <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-premium-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: modalFadeIn 0.3s ease;
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(8px); }
                }
                
                .modal-premium {
                    background: #ffffff;
                    border-radius: 16px;
                    max-width: 1000px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.15);
                    animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                .modal-premium-close {
                    position: absolute;
                    top: 16px;
                    right: 20px;
                    background: rgba(255,255,255,0.9);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.2rem;
                    color: #1B2E1A;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-premium-close:hover {
                    background: #DC2626;
                    color: #fff;
                    transform: rotate(90deg);
                }
                
                .modal-premium-split {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                }
                
                /* LEFT - Visual Side */
                .modal-premium-visual {
                    padding: 32px 28px;
                    background: #FAF9F5;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    border-radius: 16px 0 0 16px;
                }
                
                .visual-raw-image,
                .visual-product-image {
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f0ede8;
                }
                
                .visual-raw-image img,
                .visual-product-image img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    display: block;
                }
                
                .visual-raw-label,
                .visual-product-label {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    padding: 4px 14px;
                    border-radius: 20px;
                    font-size: 0.6rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #fff;
                }
                
                .visual-raw-label {
                    background: rgba(27, 46, 26, 0.8);
                }
                
                .visual-product-label {
                    background: rgba(45, 106, 79, 0.8);
                }
                
                /* RIGHT - Content Side */
                .modal-premium-content {
                    padding: 32px 32px 32px 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                
                .botanical-name {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6B7280;
                    font-style: italic;
                    text-transform: lowercase;
                }
                
                .content-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1B2E1A;
                    margin: 0;
                }
                
                .content-source h4,
                .content-benefits h4,
                .content-products h4 {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: #6B7280;
                    margin: 0 0 6px 0;
                }
                
                .content-source p {
                    font-size: 0.85rem;
                    color: #4B5563;
                    line-height: 1.6;
                    margin: 0;
                }
                
                .content-benefits ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px 16px;
                }
                
                .content-benefits ul li {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    color: #4B5563;
                    line-height: 1.4;
                }
                
                .benefit-leaf {
                    color: #2D6A4F;
                    font-size: 0.7rem;
                    flex-shrink: 0;
                }
                
                .products-tags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .product-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 14px;
                    background: #F3F4F6;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #374151;
                }
                
                .product-tag svg {
                    font-size: 0.6rem;
                    color: #2D6A4F;
                }
                
                .content-cta-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 24px;
                    background: #2D6A4F;
                    color: #ffffff;
                    border: none;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: fit-content;
                    margin-top: 4px;
                }
                
                .content-cta-btn:hover {
                    background: #1B2E1A;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(45,106,79,0.2);
                }
                
                .content-cta-btn svg {
                    transition: transform 0.3s ease;
                }
                
                .content-cta-btn:hover svg {
                    transform: translateX(4px);
                }
                
                /* ===== RESPONSIVE ===== */
                @media (max-width: 1024px) {
                    .modal-premium-split {
                        grid-template-columns: 1fr;
                    }
                    
                    .modal-premium-visual {
                        border-radius: 16px 16px 0 0;
                        padding: 24px 24px 20px;
                        flex-direction: row;
                    }
                    
                    .visual-raw-image,
                    .visual-product-image {
                        flex: 1;
                    }
                    
                    .visual-raw-image img,
                    .visual-product-image img {
                        height: 140px;
                    }
                    
                    .modal-premium-content {
                        padding: 24px 24px 28px;
                    }
                }
                
                @media (max-width: 768px) {
                    .modal-premium-visual {
                        flex-direction: column;
                    }
                    
                    .visual-raw-image img,
                    .visual-product-image img {
                        height: 120px;
                    }
                    
                    .content-benefits ul {
                        grid-template-columns: 1fr;
                    }
                    
                    .modal-premium {
                        max-height: 95vh;
                        border-radius: 12px;
                    }
                    
                    .modal-premium-content {
                        padding: 20px;
                    }
                    
                    .content-name {
                        font-size: 1.4rem;
                    }
                    
                    .content-cta-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
                
                @media (max-width: 480px) {
                    .visual-raw-image img,
                    .visual-product-image img {
                        height: 100px;
                    }
                    
                    .modal-premium-close {
                        top: 10px;
                        right: 12px;
                        width: 32px;
                        height: 32px;
                        font-size: 1rem;
                    }
                    
                    .modal-premium-content {
                        padding: 16px;
                        gap: 12px;
                    }
                    
                    .content-name {
                        font-size: 1.2rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default IngredientsPage;