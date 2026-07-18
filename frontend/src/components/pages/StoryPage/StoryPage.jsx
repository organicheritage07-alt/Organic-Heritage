import React, { useState, useEffect } from 'react';
import { 
    FaLeaf, FaHands, FaShieldAlt, FaHeart, FaAward, 
    FaStar, FaSeedling, FaFlask, FaCheckCircle, FaTruck,
    FaBox, FaClock, FaInstagram, FaFacebook, FaTwitter,
    FaPinterest, FaQuoteLeft, FaArrowRight, FaGlobe,
    FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers,
    FaIndustry, FaShippingFast, FaWarehouse, FaMicroscope,
    FaCalendarAlt, FaLinkedin, FaCertificate, FaChevronRight,
    FaArrowDown, FaChevronDown, FaSeedling as FaPlant,
    FaRegLightbulb, FaHandHoldingHeart, FaRecycle
} from 'react-icons/fa';
import './StoryPage.css';

function StoryPage() {
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [counters, setCounters] = useState({ years: 0, customers: 0, products: 0, farms: 0 });
    const [activeProcess, setActiveProcess] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => new Set(prev).add(entry.target.dataset.section));
                        if (entry.target.dataset.section === 'stats') animateCounters();
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const animateCounters = () => {
        const targets = { years: 7, customers: 50, products: 25, farms: 12 };
        const duration = 2000, steps = 60;
        let step = 0;
        const interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCounters({
                years: Math.round(targets.years * eased),
                customers: Math.round(targets.customers * eased),
                products: Math.round(targets.products * eased),
                farms: Math.round(targets.farms * eased)
            });
            if (step >= steps) clearInterval(interval);
        }, duration / steps);
    };

    const milestones = [
        { year: '2018', title: 'The Beginning', desc: 'Founded in Lahore with a vision to bring pure, natural supplements to Pakistan.', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop' },
        { year: '2019', title: 'Farm Partnerships', desc: 'Partnered with certified organic farmers in Punjab for the finest ingredients.', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop' },
        { year: '2020', title: 'Lab Established', desc: 'Built our own testing facility to guarantee unmatched quality and purity.', image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&h=400&fit=crop' },
        { year: '2021', title: 'Product Expansion', desc: 'Launched Ashwagandha, Moringa, Shatavari powders, capsules and seeds.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop' },
        { year: '2022', title: 'National Recognition', desc: 'Recognized as Pakistans leading organic supplement brand by health authorities.', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop' },
        { year: '2023', title: 'Global Reach', desc: 'Started exporting to UAE, UK and USA markets — Pakistani wellness goes global.', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop' }
    ];

    const team = [
        { name: 'Dr. Ahmed Khan', role: 'Founder & CEO', bio: 'Ph.D. in Herbal Medicine. 15+ years pioneering natural healing across South Asia.', image: 'https://ui-avatars.com/api/?name=Ahmed+Khan&background=2D6A4F&color=fff&size=200&font-size=0.35&bold=true' },
        { name: 'Dr. Fatima Ali', role: 'Head of Research', bio: 'Leading our organic farming R&D. Expert in medicinal herbs and sustainable agriculture.', image: 'https://ui-avatars.com/api/?name=Fatima+Ali&background=40916C&color=fff&size=200&font-size=0.35&bold=true' },
        { name: 'Muhammad Hassan', role: 'Operations Director', bio: 'Ensuring every product meets ISO standards. Supply chain and quality assurance expert.', image: 'https://ui-avatars.com/api/?name=Muhammad+Hassan&background=52B788&color=fff&size=200&font-size=0.35&bold=true' },
        { name: 'Sara Ahmed', role: 'Customer Experience', bio: 'Dedicated to helping you find your perfect wellness path. Your health is her mission.', image: 'https://ui-avatars.com/api/?name=Sara+Ahmed&background=1B4332&color=fff&size=200&font-size=0.35&bold=true' }
    ];

    const certifications = [
        { name: 'Organic Certified', icon: <FaLeaf />, desc: 'USDA & EU Organic' },
        { name: 'GMP Certified', icon: <FaShieldAlt />, desc: 'Good Manufacturing Practice' },
        { name: 'Halal Certified', icon: <FaStar />, desc: 'Islamic Council Approved' },
        { name: 'Lab Tested', icon: <FaFlask />, desc: 'Third Party Verified' },
        { name: '100% Natural', icon: <FaSeedling />, desc: 'Zero Chemical Additives' },
        { name: 'Cruelty Free', icon: <FaHeart />, desc: 'No Animal Testing Ever' }
    ];

    const processSteps = [
        { 
            num: '01', 
            icon: <FaPlant />, 
            title: 'Ethical Sourcing', 
            desc: 'We partner directly with 12+ certified organic farms across Punjab and Sindh. Every seed is traceable to its origin.',
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop'
        },
        { 
            num: '02', 
            icon: <FaMicroscope />, 
            title: 'Rigorous Testing', 
            desc: 'Every batch undergoes 50+ tests for purity, potency, and contaminants in our state-of-the-art laboratory.',
            image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&h=500&fit=crop'
        },
        { 
            num: '03', 
            icon: <FaIndustry />, 
            title: 'Cold Processing', 
            desc: 'Temperature-controlled processing preserves every nutrient naturally without chemical additives or preservatives.',
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop'
        },
        { 
            num: '04', 
            icon: <FaCheckCircle />, 
            title: '5-Stage QC', 
            desc: 'Multiple quality checkpoints throughout production ensure consistent excellence in every single product.',
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop'
        },
        { 
            num: '05', 
            icon: <FaRecycle />, 
            title: 'Eco Packaging', 
            desc: '100% recyclable, food-grade packaging that locks in freshness while protecting our planet for future generations.',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=500&fit=crop'
        },
        { 
            num: '06', 
            icon: <FaShippingFast />, 
            title: 'Swift Delivery', 
            desc: '24-48 hour nationwide delivery in temperature-controlled logistics. From our facility to your doorstep, fresh.',
            image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop'
        }
    ];

    return (
        <div className="story-page">
            {/* ===== COMPACT BANNER ===== */}
            <section className="story-banner" data-section="banner">
                <div className="banner-bg">
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=500&fit=crop" alt="Organic Heritage" />
                    <div className="banner-overlay" />
                </div>
                <div className={`banner-content ${visibleSections.has('banner') ? 'visible' : ''}`}>
                    <span className="banner-tag"><FaLeaf /> Our Story</span>
                    <h1>Pure Wellness, Born from Nature</h1>
                    <p>Pakistan's most trusted organic supplement brand since 2018</p>
                </div>
            </section>

            {/* ===== STATS BAR ===== */}
            <section className="story-stats" data-section="stats">
                <div className="story-stats-container">
                    <div className={`stats-grid ${visibleSections.has('stats') ? 'visible' : ''}`}>
                        <div className="stat-item">
                            <span className="stat-num">{counters.years}+</span>
                            <span className="stat-text">Years</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">{counters.customers}K+</span>
                            <span className="stat-text">Customers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">{counters.products}+</span>
                            <span className="stat-text">Products</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">{counters.farms}+</span>
                            <span className="stat-text">Farms</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOUNDER STORY SECTION ===== */}
            <section className="story-founder" data-section="founder">
                <div className="story-founder-container">
                    <div className={`founder-grid ${visibleSections.has('founder') ? 'visible' : ''}`}>
                        <div className="founder-image">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=face" alt="Dr. Ahmed Khan - Founder & CEO" />
                            <div className="founder-badge">
                                <FaAward />
                                <span>Founder & CEO</span>
                            </div>
                        </div>
                        <div className="founder-content">
                            <span className="section-label"><FaRegLightbulb /> Our Story</span>
                            <h2>From a Small Dream to Pakistan's Wellness Revolution</h2>
                            <div className="founder-story">
                                <p>
                                    In 2018, I stood in the fields of rural Punjab watching farmers struggle to sell their organic produce at fair prices. 
                                    That moment changed everything. I realized Pakistan had the world's finest organic herbs — Moringa, Ashwagandha, Shatavari — 
                                    but no one was bringing them to the people who needed them most.
                                </p>
                                <p>
                                    With just three products and a borrowed facility in Lahore, Organic Heritage was born. Today, we partner with 
                                    <strong> 12+ certified organic farms</strong>, operate a <strong>state-of-the-art testing laboratory</strong>, and serve 
                                    <strong> 50,000+ customers</strong> across Pakistan and beyond.
                                </p>
                                <p>
                                    Every morning, I walk through our facility and personally inspect the batches. Why? Because this isn't just business — 
                                    it's a promise to every Pakistani family that the supplements they give their loved ones are 100% pure, lab-tested, 
                                    and made with the same care I'd give my own children.
                                </p>
                            </div>
                            <div className="founder-quote">
                                <FaQuoteLeft />
                                <p>"We don't just sell supplements. We deliver the pure essence of nature, carefully preserved for your wellness."</p>
                                <cite>— Dr. Ahmed Khan, Founder & CEO</cite>
                            </div>
                            <div className="founder-signature">
                                <div className="signature-line" />
                                <span>Dr. Ahmed Khan</span>
                                <small>Ph.D. Herbal Medicine | 15+ Years Experience</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHY WE EXIST ===== */}
            <section className="story-why" data-section="why">
                <div className="story-why-container">
                    <div className={`why-grid ${visibleSections.has('why') ? 'visible' : ''}`}>
                        <div className="why-content">
                            <span className="section-label"><FaHandHoldingHeart /> Why We Exist</span>
                            <h2>Wellness Shouldn't Be a Luxury</h2>
                            <p>
                                In Pakistan, quality supplements were either imported and overpriced, or locally made with questionable ingredients. 
                                We changed that equation. By working directly with farmers and controlling every step from seed to shelf, 
                                we make premium organic wellness accessible to every Pakistani family.
                            </p>
                            <div className="why-points">
                                <div className="why-point">
                                    <div className="why-point-icon"><FaLeaf /></div>
                                    <div>
                                        <h4>100% Organic</h4>
                                        <p>Zero pesticides, fully traceable to source farms</p>
                                    </div>
                                </div>
                                <div className="why-point">
                                    <div className="why-point-icon"><FaShieldAlt /></div>
                                    <div>
                                        <h4>Lab Tested</h4>
                                        <p>Every batch verified for purity and potency</p>
                                    </div>
                                </div>
                                <div className="why-point">
                                    <div className="why-point-icon"><FaHeart /></div>
                                    <div>
                                        <h4>Made with Love</h4>
                                        <p>Crafted with genuine care for your family</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="why-image">
                            <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=700&fit=crop" alt="Organic Heritage Farm" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== JOURNEY TIMELINE ===== */}
            <section className="story-journey" data-section="journey">
                <div className="story-journey-container">
                    <div className={`story-section-header ${visibleSections.has('journey') ? 'visible' : ''}`}>
                        <span className="section-label"><FaCalendarAlt /> Our Journey</span>
                        <h2>From Lahore to the World</h2>
                    </div>
                    <div className={`journey-timeline ${visibleSections.has('journey') ? 'visible' : ''}`}>
                        <div className="timeline-line" />
                        {milestones.map((m, i) => (
                            <div key={i} className={`timeline-row ${i % 2 === 0 ? 'left' : 'right'}`}>
                                <div className="timeline-image-box">
                                    <img src={m.image} alt={m.title} />
                                    <div className="timeline-year-tag">{m.year}</div>
                                </div>
                                <div className="timeline-dot-main" />
                                <div className="timeline-text-box">
                                    <h3>{m.title}</h3>
                                    <p>{m.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PROCESS STEPS - INTERACTIVE ===== */}
            <section className="story-process-main" data-section="process">
                <div className="story-process-container">
                    <div className={`story-section-header ${visibleSections.has('process') ? 'visible' : ''}`}>
                        <span className="section-label"><FaIndustry /> Our Process</span>
                        <h2>How We Bring Nature to You</h2>
                        <p className="section-subtitle">Click each step to see how your supplements are made</p>
                    </div>

                    <div className={`process-showcase ${visibleSections.has('process') ? 'visible' : ''}`}>
                        <div className="process-image-display">
                            <img src={processSteps[activeProcess].image} alt={processSteps[activeProcess].title} />
                            <div className="process-image-overlay">
                                <span className="process-step-badge">Step {processSteps[activeProcess].num}</span>
                                <h3>{processSteps[activeProcess].title}</h3>
                                <p>{processSteps[activeProcess].desc}</p>
                            </div>
                        </div>

                        <div className="process-steps-nav">
                            {processSteps.map((step, index) => (
                                <button 
                                    key={index}
                                    className={`process-step-btn ${activeProcess === index ? 'active' : ''}`}
                                    onClick={() => setActiveProcess(index)}
                                >
                                    <span className="step-btn-num">{step.num}</span>
                                    <span className="step-btn-icon">{step.icon}</span>
                                    <span className="step-btn-title">{step.title}</span>
                                    <FaChevronRight className="step-btn-arrow" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CERTIFICATIONS ===== */}
            <section className="story-certifications" data-section="certifications">
                <div className="story-certifications-container">
                    <div className={`story-section-header ${visibleSections.has('certifications') ? 'visible' : ''}`}>
                        <span className="section-label"><FaCertificate /> Trusted Quality</span>
                        <h2>Globally Recognized Certifications</h2>
                    </div>
                    <div className={`certs-grid ${visibleSections.has('certifications') ? 'visible' : ''}`}>
                        {certifications.map((cert, index) => (
                            <div key={index} className="cert-card">
                                <div className="cert-icon-box">{cert.icon}</div>
                                <div className="cert-info">
                                    <h4>{cert.name}</h4>
                                    <p>{cert.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TEAM ===== */}
            <section className="story-team" data-section="team">
                <div className="story-team-container">
                    <div className={`story-section-header ${visibleSections.has('team') ? 'visible' : ''}`}>
                        <span className="section-label"><FaUsers /> The People</span>
                        <h2>Meet the Team Behind the Mission</h2>
                    </div>
                    <div className={`team-grid ${visibleSections.has('team') ? 'visible' : ''}`}>
                        {team.map((member, index) => (
                            <div key={index} className="team-card">
                                <div className="team-photo">
                                    <img src={member.image} alt={member.name} />
                                </div>
                                <h3>{member.name}</h3>
                                <span className="team-role">{member.role}</span>
                                <p>{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CLEAN CTA - WITHOUT "Ready to Experience Pure Wellness?" ===== */}
            <section className="story-cta-clean" data-section="cta">
                <div className="story-cta-clean-container">
                    <div className={`cta-clean-content ${visibleSections.has('cta') ? 'visible' : ''}`}>
                        <div className="cta-clean-buttons">
                            <a href="/products" className="cta-clean-btn primary">
                                Shop Now <FaArrowRight />
                            </a>
                            <a href="/contact" className="cta-clean-btn secondary">
                                Contact Us
                            </a>
                        </div>
                        <div className="cta-clean-contact">
                            <span><FaPhone /> +92 300 1234567</span>
                            <span><FaEnvelope /> organicheritage07@gmail.com</span>
                            <span><FaMapMarkerAlt /> Lahore, Pakistan</span>
                        </div>
                        <div className="cta-clean-social">
                            <a href="#"><FaInstagram /></a>
                            <a href="#"><FaFacebook /></a>
                            <a href="#"><FaTwitter /></a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default StoryPage;