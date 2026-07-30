import React, { useState, useEffect } from 'react';
import { 
    FaLeaf, FaAward, FaQuoteLeft, FaArrowRight, 
    FaTimes, FaBullseye, FaGlobe, FaUserTie,
    FaSeedling, FaHeart, FaHandshake, FaStar,
    FaCheckCircle, FaFlask, FaShieldAlt
} from 'react-icons/fa';
import './StoryPage.css';

function StoryPage() {
    const [visibleSections, setVisibleSections] = useState(new Set());
    const [counters, setCounters] = useState({ years: 0, customers: 0, products: 0, farms: 0 });
    const [activePage, setActivePage] = useState(null);

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
            { threshold: 0.15 }
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

    const pageData = {
        story: {
            title: 'Our Story',
            icon: <FaSeedling />,
            content: (
                <div className="page-body-content">
                    <p>Founded in 2018 in Lahore with a vision to bring pure, natural supplements to Pakistan. We partner with 12+ certified organic farms across Punjab and Sindh, bringing the finest Moringa, Ashwagandha, and Shatavari to every Pakistani family.</p>
                    <p>In 2018, Dr. Ahmed Khan stood in the fields of rural Punjab watching farmers struggle to sell their organic produce at fair prices. That moment changed everything. He realized Pakistan had the world's finest organic herbs — but no one was bringing them to the people who needed them most.</p>
                    <p>With just three products and a borrowed facility in Lahore, <strong>Organic Heritage</strong> was born. Today, we partner with <strong>12+ certified organic farms</strong>, operate a <strong>state-of-the-art testing laboratory</strong>, and serve <strong>50,000+ customers</strong> across Pakistan and beyond.</p>
                    <p>Every morning, our founder walks through the facility and personally inspects the batches. Why? Because this isn't just business — it's a promise to every Pakistani family that the supplements they give their loved ones are 100% pure, lab-tested, and made with the same care he'd give his own children.</p>
                </div>
            )
        },
        mission: {
            title: 'Our Mission',
            icon: <FaBullseye />,
            content: (
                <div className="page-body-content">
                    <p>To make premium organic wellness accessible to every Pakistani family. By working directly with farmers and controlling every step from seed to shelf, we ensure 100% pure, lab-tested products at fair prices.</p>
                    <p>In Pakistan, quality supplements were either imported and overpriced, or locally made with questionable ingredients. We changed that equation. By working directly with farmers and controlling every step from seed to shelf, we make premium organic wellness accessible to every Pakistani family.</p>
                    <div className="page-points">
                        <div className="page-point"><FaLeaf /> 100% Organic — Zero pesticides, fully traceable to source farms</div>
                        <div className="page-point"><FaFlask /> Lab Tested — Every batch verified for purity and potency</div>
                        <div className="page-point"><FaHeart /> Made with Love — Crafted with genuine care for your family</div>
                    </div>
                    <p>We believe wellness shouldn't be a luxury. It should be a right that every family in Pakistan can afford without compromising on quality or purity.</p>
                </div>
            )
        },
        vision: {
            title: 'Our Vision',
            icon: <FaGlobe />,
            content: (
                <div className="page-body-content">
                    <p>To become Pakistan's most trusted organic supplement brand, recognized globally for purity, quality, and sustainable practices. We envision a healthier Pakistan where wellness is never a luxury.</p>
                    <p>At the heart of our journey lies a shared passion for health, wellness, and transformation. As healthcare professionals and life partners, Dr. Affan and Dr. Nazish have witnessed firsthand the power of nature in healing.</p>
                    <p>Our vision extends beyond borders. We aim to:</p>
                    <div className="page-points">
                        <div className="page-point"><FaGlobe /> Export Pakistani organic wellness to every corner of the globe</div>
                        <div className="page-point"><FaHandshake /> Empower 100+ organic farmers with fair trade partnerships</div>
                        <div className="page-point"><FaStar /> Build Pakistan's largest organic supplement research facility</div>
                        <div className="page-point"><FaSeedling /> Make 100% natural wellness the standard, not the exception</div>
                    </div>
                    <p>We dream of a Pakistan where every family has access to pure, organic nutrition — because health is the greatest wealth.</p>
                </div>
            )
        },
        founder: {
            title: "Dr. Affan's Words",
            icon: <FaUserTie />,
            content: (
                <div className="page-body-content">
                    <div className="page-founder-header">
                        <img src="ceo.png" />
                        <div>
                            <h3>Dr. Ahmed Khan</h3>
                            <span>Founder & CEO | Ph.D. Herbal Medicine</span>
                        </div>
                    </div>
                    <div className="page-quote-box">
                        <FaQuoteLeft />
                        <p>"We don't just sell supplements. We deliver the pure essence of nature, carefully preserved for your wellness."</p>
                    </div>
                    <p>For many years, I struggled and conducted extensive research with a single goal: to spread health awareness across Pakistan. I saw families spending fortunes on imported supplements that were either fake or unnecessarily expensive.</p>
                    <p>I knew Pakistan had the answer. Our soil, our climate, our farmers — they produce some of the finest organic herbs in the world. Moringa from Punjab, Ashwagandha from Sindh, Shatavari from the northern valleys. Why were we importing what we could grow better ourselves?</p>
                    <p>That question led to Organic Heritage. Today, as I walk through our facility every morning, I don't see a factory — I see a promise. A promise to every mother who gives our Moringa to her child. A promise to every father who trusts our Ashwagandha for his energy. A promise that what they hold in their hands is 100% pure, lab-tested, and made with the same care I'd give my own family.</p>
                    <p>This is not just a business. This is a movement. And you're part of it.</p>
                    <div className="page-signature">
                        <div className="page-sig-line" />
                        <span>Dr. Ahmed Khan</span>
                        <small>Ph.D. Herbal Medicine | 15+ Years Experience</small>
                    </div>
                </div>
            )
        }
    };

    const cards = [
        {
            id: 'story',
            icon: <FaSeedling />,
            title: 'Our Story',
            desc: 'Founded in 2018 in Lahore with a vision to bring pure, natural supplements to Pakistan. We partner with 12+ certified organic farms across Punjab and Sindh.'
        },
        {
            id: 'mission',
            icon: <FaBullseye />,
            title: 'Mission',
            desc: 'To make premium organic wellness accessible to every Pakistani family. By working directly with farmers and controlling every step from seed to shelf.'
        },
        {
            id: 'vision',
            icon: <FaGlobe />,
            title: 'Vision',
            desc: 'To become Pakistan\'s most trusted organic supplement brand, recognized globally for purity, quality, and sustainable practices.'
        },
        {
            id: 'founder',
            icon: <FaUserTie />,
            title: 'Dr. Affan\'s Words',
            desc: '"We don\'t just sell supplements. We deliver the pure essence of nature, carefully preserved for your wellness." Read the full message from our founder.'
        }
    ];

    return (
        <div className="story-page">
            {/* ===== BANNER ===== */}
            <section className="story-banner" data-section="banner">
                <div className="banner-bg">
                    <img src="./preloder2.png" />
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
                        <div className="stat-item"><span className="stat-num">{counters.years}+</span><span className="stat-text">Years</span></div>
                        <div className="stat-item"><span className="stat-num">{counters.customers}K+</span><span className="stat-text">Customers</span></div>
                        <div className="stat-item"><span className="stat-num">{counters.products}+</span><span className="stat-text">Products</span></div>
                        <div className="stat-item"><span className="stat-num">{counters.farms}+</span><span className="stat-text">Farms</span></div>
                    </div>
                </div>
            </section>

            {/* ===== FOUNDER SECTION — 2 IMAGES SIDE BY SIDE ON LEFT ===== */}
            <section className="story-founder" data-section="founder">
                <div className="story-founder-container">
                    <div className={`founder-grid ${visibleSections.has('founder') ? 'visible' : ''}`}>
                        
                        {/* LEFT: 2 IMAGES SIDE BY SIDE */}
                        <div className="founder-images-col">
                            <div className="founder-img-card">
                                <img src="./ceo.png" />
                                <div className="founder-img-info">
                                    <h4>Dr. Ahmed Khan</h4>
                                    <span>Founder & CEO</span>
                                </div>
                            </div>
                            <div className="founder-img-card">
                                <img src="./OPM.png" />
                                <div className="founder-img-info">
                                    <h4>Muhammad Hassan</h4>
                                    <span>Operations Manager</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: TEXT CONTENT */}
                        <div className="founder-content">
                            <span className="section-label"><FaLeaf /> Our Founder</span>
                            <h2>From a Small Dream to Pakistan's Wellness Revolution</h2>
                            <div className="founder-story">
                                <p>In 2018, I stood in the fields of rural Punjab watching farmers struggle to sell their organic produce at fair prices. That moment changed everything. I realized Pakistan had the world's finest organic herbs — Moringa, Ashwagandha, Shatavari — but no one was bringing them to the people who needed them most.</p>
                                <p>With just three products and a borrowed facility in Lahore, <strong>Organic Heritage</strong> was born. Today, we partner with <strong>12+ certified organic farms</strong>, operate a <strong>state-of-the-art testing laboratory</strong>, and serve <strong>50,000+ customers</strong> across Pakistan and beyond.</p>
                                <p>Every morning, I walk through our facility and personally inspect the batches. Why? Because this isn't just business — it's a promise to every Pakistani family that the supplements they give their loved ones are 100% pure, lab-tested, and made with the same care I'd give my own children.</p>
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

            {/* ===== 4 CARDS — #2d5a27 BG, LIME CARDS, SHARP CORNERS ===== */}
            <section className="story-cards-section" data-section="cards">
                <div className="cards-wave-top">
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,0 L0,0 Z" fill="#ffffff"/>
                    </svg>
                </div>
                
                <div className="story-cards-container">
                    <div className={`cards-grid ${visibleSections.has('cards') ? 'visible' : ''}`}>
                        {cards.map((card, index) => (
                            <div key={card.id} className="story-card" style={{ animationDelay: `${index * 0.12}s` }}>
                                <div className="card-icon">{card.icon}</div>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                                <button className="card-link" onClick={() => setActivePage(card.id)}>
                                    Read More <FaArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FULL PAGE OVERLAY ===== */}
            {activePage && (
                <div className="story-fullpage-overlay">
                    <div className="story-fullpage">
                        <button className="fullpage-close" onClick={() => setActivePage(null)}>
                            <FaTimes /> Close
                        </button>
                        <div className="fullpage-header">
                            <div className="fullpage-icon">{pageData[activePage].icon}</div>
                            <h1>{pageData[activePage].title}</h1>
                        </div>
                        <div className="fullpage-body">
                            {pageData[activePage].content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StoryPage;