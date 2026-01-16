import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Review {
  id: string | number;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: 'Google' | 'TripAdvisor';
  initials: string;
  avatarColor: string;
}

const reviews: Review[] = [
  {
    id: 1,
    author: 'John Doe',
    rating: 5,
    text: 'Absolutely seamless experience! Booking my flights to Sydney was incredibly easy, and the customer support team helped me change my dates without any hassle. Highly recommended!',
    date: 'Travelled Feb 2025',
    source: 'Google',
    initials: 'JD',
    avatarColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    author: 'Sarah Mitchell',
    rating: 5,
    text: 'Found a great deal on a family package to Bali. The website is very intuitive and I loved the comparison features. Everything went smoothly from booking to boarding.',
    date: 'Travelled Jan 2025',
    source: 'TripAdvisor',
    initials: 'SM',
    avatarColor: 'bg-orange-100 text-orange-600',
  },
  {
    id: 3,
    author: 'Michael Ross',
    rating: 5,
    text: 'SkyTrips saved me over $200 on my flight to London compared to other sites. The transparency with fees was refreshing. Will definitely use them again.',
    date: 'Travelled Dec 2024',
    source: 'Google',
    initials: 'MR',
    avatarColor: 'bg-green-100 text-green-600',
  },
  {
    id: 4,
    author: 'Emily Chen',
    rating: 4,
    text: 'Great service and competitive prices for flights to Tokyo. The booking process was straightforward. Would appreciate more hotel bundle options next time.',
    date: 'Travelled Nov 2024',
    source: 'Google',
    initials: 'EC',
    avatarColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: 5,
    author: 'David Wilson',
    rating: 5,
    text: 'Excellent customer service! I had an issue with my ticket name and they resolved it within minutes. Very professional and helpful team.',
    date: 'Travelled Oct 2024',
    source: 'Google',
    initials: 'DW',
    avatarColor: 'bg-red-100 text-red-600',
  },
];

const GoogleReviews = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="container mx-auto px-4 md:px-10 py-12 md:py-16 bg-slate-50/50">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Customer Reviews</h2>
        <p className="text-slate-500 text-lg">
          See what our travelers have to say about their experiences with SkyTrips.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Navigation Buttons - Absolute positioned for desktop */}
        <button 
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors hidden md:flex"
          aria-label="Previous review"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button 
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors hidden md:flex"
          aria-label="Next review"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="overflow-hidden px-1" ref={emblaRef}>
          <div className="flex -ml-6 pb-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-6 min-w-0">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
                  {/* Rating & Source */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} 
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                      {review.source === 'Google' && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span>{review.source}</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="flex-1 mb-6 relative">
                    {/* <Quote className="w-8 h-8 text-slate-100 absolute -top-2 -left-2 -z-10" /> */}
                    <p className="text-slate-600 italic leading-relaxed">"{review.text}"</p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${review.avatarColor}`}>
                      {review.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{review.author}</h4>
                      <p className="text-xs text-slate-500">{review.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex justify-center gap-4 mt-6 md:hidden">
          <button 
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white text-slate-600 transition-colors shadow-sm ${!prevBtnEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            className={`w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white transition-colors shadow-md shadow-blue-200 ${!nextBtnEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
