import React, { useState, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import './ImageGallery.css';

const ImageGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showLightbox, setShowLightbox] = useState(false);

  const imageRef = useRef(null);

  // Handle mouse move for cursor zoom
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

  // Lightbox handlers
  const openLightbox = (index) => {
    setSelectedIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto';
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  if (!images || images.length === 0) {
    return (
      <div className="ig-placeholder">
        <span>No images available</span>
      </div>
    );
  }

  return (
    <div className="ig-container">
      {/* ===== MAIN IMAGE WITH CURSOR ZOOM ===== */}
      <div 
        className="ig-main-wrapper"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={imageRef}
      >
        <div 
          className={`ig-zoom-area ${isZooming ? 'zooming' : ''}`}
          style={{
            backgroundImage: `url(${images[selectedIndex]})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: isZooming ? '250%' : '100%'
          }}
        >
          <img 
            src={images[selectedIndex]} 
            alt={`${productName} - ${selectedIndex + 1}`}
            className={isZooming ? 'hidden' : ''}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
            }}
          />
        </div>

        {/* Zoom hint */}
        {isZooming && (
          <div className="ig-zoom-hint">
            <FaExpand /> Move cursor to explore
          </div>
        )}

        {/* Expand button */}
        <button 
          className="ig-expand-btn"
          onClick={() => openLightbox(selectedIndex)}
          title="View Fullscreen"
        >
          <FaExpand />
        </button>
      </div>

      {/* ===== THUMBNAILS STRIP ===== */}
      {images.length > 1 && (
        <div className="ig-thumbnails">
          {images.map((img, index) => (
            <button
              key={index}
              className={`ig-thumb ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
              title={`View image ${index + 1}`}
            >
              <img 
                src={img} 
                alt={`${productName} thumbnail ${index + 1}`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
              {selectedIndex === index && <div className="ig-thumb-indicator"></div>}
            </button>
          ))}
        </div>
      )}

      {/* ===== LIGHTBOX MODAL ===== */}
      {showLightbox && (
        <div className="ig-lightbox" onClick={closeLightbox}>
          {/* Close button */}
          <button className="ig-lb-close" onClick={closeLightbox}>
            <FaTimes />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button 
                className="ig-lb-nav ig-lb-prev" 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <FaChevronLeft />
              </button>
              <button 
                className="ig-lb-nav ig-lb-next" 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Main image */}
          <div className="ig-lb-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[selectedIndex]} 
              alt={`${productName} - ${selectedIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x800?text=No+Image';
              }}
            />
            <div className="ig-lb-counter">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>

          {/* Bottom thumbnails */}
          {images.length > 1 && (
            <div className="ig-lb-thumbs" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={selectedIndex === idx ? 'active' : ''}
                  onClick={() => setSelectedIndex(idx)}
                >
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

export default ImageGallery;