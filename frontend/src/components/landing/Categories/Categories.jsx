import React, { useEffect, useRef, useState } from 'react';
import './Categories.css';

const Categories = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const categories = [
    { id: 1, name: 'Fresh Fruits', count: 24 },
    { id: 2, name: 'Vegetables', count: 32 },
    { id: 3, name: 'Pure Honey', count: 12 },
    { id: 4, name: 'Herbal Teas', count: 18 },
    { id: 5, name: 'Organic Oils', count: 8 },
    { id: 6, name: 'Spices & Grains', count: 15 },
  ];

  return (
    <section className="categories" ref={sectionRef}>
      <div className="container">
        <div className={`section-header ${isVisible ? 'show' : ''}`}>
          <span className="section-tag">Categories</span>
          <h2>Shop by Collection</h2>
          <p>Explore our premium organic range</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`category-card ${isVisible ? 'show' : ''}`}
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="card-number">{(i + 1).toString().padStart(2, '0')}</div>
              <h3>{cat.name}</h3>
              <p>{cat.count} products</p>
              <button className="card-link">
                <span>Shop</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;