import React, { useState, useEffect } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === images.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide(currentSlide === 0 ? images.length - 1 : currentSlide - 1);
  };

  const goToNext = () => {
    setCurrentSlide(currentSlide === images.length - 1 ? 0 : currentSlide + 1);
  };

  return (
    <div className="image-slider">
      <div className="slider-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={image.src} alt={image.alt} />
            <div className="slide-overlay">
              <div className="slide-content">
                <h2>{image.title}</h2>
                <p>{image.description}</p>
                {image.buttonText && image.buttonLink && (
                  <a href={image.buttonLink} className="slide-btn">
                    {image.buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Buttons */}
        <button className="slider-btn prev-btn" onClick={goToPrevious}>
          &#10094;
        </button>
        <button className="slider-btn next-btn" onClick={goToNext}>
          &#10095;
        </button>
      </div>
      
      {/* Dots Indicator */}
      <div className="dots-container">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
