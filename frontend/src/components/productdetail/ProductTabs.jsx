import React, { useState } from 'react';
import { 
  FaInfoCircle, FaCheckCircle, FaHeart, FaClock, FaUsers,
  FaLeaf, FaChevronRight
} from 'react-icons/fa';
import './ProductTabs.css';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description', icon: <FaInfoCircle /> },
    { id: 'highlights', label: 'Highlights', icon: <FaCheckCircle /> },
    { id: 'benefits', label: 'Health Benefits', icon: <FaHeart /> },
    { id: 'howtouse', label: 'How to Use', icon: <FaClock /> },
    { id: 'whocanuse', label: 'Who Can Use', icon: <FaUsers /> }
  ];

  const defaultHighlights = [
    '100% Pure & Natural Ingredients',
    'Lab Tested for Quality & Purity',
    'No Artificial Preservatives',
    'Cruelty Free Product',
    'GMO Free & Vegan Friendly'
  ];

  const defaultBenefits = [
    'Boosts Immune System Naturally',
    'Improves Energy Levels & Stamina',
    'Supports Overall Wellness',
    'Natural Stress Relief & Calmness',
    'Promotes Better Sleep Quality'
  ];

  const defaultHowToUse = 'Take 1-2 capsules daily with water, preferably with meals. For best results, use consistently for at least 30 days.';
  const defaultWhoCanUse = 'Suitable for adults of all ages. Ideal for those looking for natural wellness solutions. Consult your healthcare provider if pregnant or nursing.';

  const renderContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="pt-content-inner">
            <div className="pt-desc-box">
              <h3>About This Product</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>
          </div>
        );

      case 'highlights':
        const highlights = product.highlights?.length > 0 ? product.highlights : defaultHighlights;
        return (
          <div className="pt-content-inner">
            <h3>Product Highlights</h3>
            <div className="pt-grid">
              {highlights.map((item, index) => (
                <div key={index} className="pt-card pt-card-green">
                  <div className="pt-card-icon"><FaCheckCircle /></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'benefits':
        const benefits = product.healthBenefits?.length > 0 ? product.healthBenefits : defaultBenefits;
        return (
          <div className="pt-content-inner">
            <h3>Health Benefits</h3>
            <div className="pt-grid">
              {benefits.map((item, index) => (
                <div key={index} className="pt-card pt-card-gold">
                  <div className="pt-card-icon"><FaLeaf /></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'howtouse':
        return (
          <div className="pt-content-inner">
            <h3>How to Use</h3>
            <div className="pt-usage-box">
              <div className="pt-usage-main">
                <FaClock className="pt-usage-icon" />
                <p>{product.howToUse || defaultHowToUse}</p>
              </div>
              <div className="pt-tips">
                <h4>Pro Tips for Best Results:</h4>
                <ul>
                  <li><FaChevronRight /> Take at the same time each day for consistency</li>
                  <li><FaChevronRight /> Stay hydrated throughout the day</li>
                  <li><FaChevronRight /> Use consistently for at least 30 days</li>
                  <li><FaChevronRight /> Store in a cool, dry place away from sunlight</li>
                  <li><FaChevronRight /> Combine with a balanced diet for optimal results</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'whocanuse':
        return (
          <div className="pt-content-inner">
            <h3>Who Can Use</h3>
            <div className="pt-who-box">
              <div className="pt-who-main">
                <FaUsers className="pt-who-icon" />
                <p>{product.whoCanUse || defaultWhoCanUse}</p>
              </div>
              <div className="pt-tags">
                <span className="pt-tag pt-tag-yes">✓ Adults (18+)</span>
                <span className="pt-tag pt-tag-yes">✓ Wellness Seekers</span>
                <span className="pt-tag pt-tag-yes">✓ All Genders</span>
                <span className="pt-tag pt-tag-maybe">⚠ Consult if Pregnant</span>
                <span className="pt-tag pt-tag-maybe">⚠ Consult if Nursing</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-container">
      <div className="pt-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pt-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="pt-tab-icon">{tab.icon}</span>
            <span className="pt-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="pt-body">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductTabs;