import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroCarousel({ heroCollections = [], autoRotate = true, interval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate);

  // Auto-rotate functionality
  useEffect(() => {
    if (!isAutoPlaying || heroCollections.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => 
        prev === heroCollections.length - 1 ? 0 : prev + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlide, isAutoPlaying, heroCollections.length, interval]);

  // Pause auto-rotation on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(autoRotate);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(autoRotate), 3000); // Resume after 3s
  };

  const nextSlide = () => {
    setCurrentSlide(prev => 
      prev === heroCollections.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(prev => 
      prev === 0 ? heroCollections.length - 1 : prev - 1
    );
  };

  if (!heroCollections || heroCollections.length === 0) {
    return (
      <div className="relative h-screen overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-burgundy via-gold to-charcoal"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <div className="z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-bold text-white drop-shadow-lg mb-4">
              Omabha
            </h1>
            <p className="mt-4 text-lg md:text-2xl font-serif text-ivory max-w-2xl mx-auto">
              Draped in Tradition, Woven with Grace
            </p>
            <div className="mt-8">
              <Link href="/collections">
                <button className="px-8 py-3 bg-burgundy text-white font-bold rounded-md hover:bg-gold hover:text-charcoal transition-colors duration-300 shadow-lg">
                  Explore Collections
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCollection = heroCollections[currentSlide];

  return (
    <div 
      className="relative h-screen overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images */}
      {heroCollections.map((collection, index) => (
        <div
          key={collection.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {collection.image?.url ? (
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title || `Hero Banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0} // Priority load only first image
              sizes="100vw"
              quality={95} // High quality for hero images
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-burgundy via-gold to-charcoal"></div>
          )}
        </div>
      ))}

     

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center p-4 z-30">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-bold text-white drop-shadow-lg mb-4 transition-all duration-700">
            {currentCollection?.title || 'Omabha'}
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-serif text-ivory max-w-2xl mx-auto transition-all duration-700">
            {currentCollection?.description || 'Draped in Tradition, Woven with Grace'}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroCollections.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {heroCollections.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3">
          {heroCollections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Status Indicator */}
      {heroCollections.length > 1 && (
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 text-sm"
            aria-label={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
          >
            {isAutoPlaying ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {heroCollections.length > 1 && isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-40">
          <div 
            className="h-full bg-burgundy transition-all duration-300"
            style={{
              width: `${((currentSlide + 1) / heroCollections.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
}