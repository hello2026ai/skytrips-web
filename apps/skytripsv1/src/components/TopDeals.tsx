import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Plane, Luggage, ChevronDown } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import dealsService, { Deal as ApiDeal } from '../../lib/dealsService';

interface Deal {
  id: string | number;
  city: string;
  code: string;
  origin: string;
  originCode: string;
  image: string;
  airlineLogo: string;
  dates: string;
  baggage: string;
  price: number;
}

const TopDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const apiDeals = await dealsService.fetchAllDeals();
        
        // Map API response to Component format
        const mappedDeals: Deal[] = apiDeals.map((deal: ApiDeal) => {
          const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(/\/$/, '') || '';
          
          let imageUrl = '/assets/images/bg/01.jpg'; // Default fallback
          if (deal.media?.fileKey) {
            imageUrl = `${s3BaseUrl}/${deal.media.fileKey.replace(/^\//, '')}`;
          } else if (deal.ogImageUrl) {
             // ogImageUrl might be a full URL or relative path?
             // Based on PagesSpecialFare, it seems to be relative to bucket
             imageUrl = `${s3BaseUrl}/${deal.ogImageUrl.replace(/^\//, '')}`;
          }

          // Helper to format date
          const formatDate = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          };

          return {
            id: deal.id,
            city: deal.destination?.municipality || deal.title || 'Unknown',
            code: deal.destination?.iataCode || '',
            origin: deal.origin?.municipality || 'Sydney',
            originCode: deal.origin?.iataCode || 'SYD',
            image: imageUrl,
            airlineLogo: deal.airline?.logoUrl 
              ? `${s3BaseUrl}/${deal.airline.logoUrl.replace(/^\//, '')}`
              : '/assets/images/airlines/default.png', // Fallback
            dates: formatDate(deal.departureDate),
            baggage: deal.description || 'Check details', // Mapping description to baggage info or similar
            price: deal.price || 0,
          };
        });

        if (mappedDeals.length > 0) {
          setDeals(mappedDeals);
        } else {
            // Fallback to static deals if no API deals found (optional, but good for demo)
            setDeals(staticDeals);
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        setDeals(staticDeals);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

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

  if (loading) {
    return <div className="container mx-auto px-4 md:px-10 mt-6 text-center py-10">Loading deals...</div>;
  }

  return (
    <section className="container mx-auto px-4 md:px-10 mb-16 mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Top Deals</h2>
          <p className="text-slate-500 text-lg">
            Discover exclusive offers on flights to popular destinations. Book now to secure the best rates for your next adventure.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Plane className="w-4 h-4 text-slate-500" />
            <span>Departing from: <span className="text-blue-600">Sydney (SYD)</span></span>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white text-slate-600 transition-colors shadow-sm ${!prevBtnEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white transition-colors shadow-md shadow-blue-200 ${!nextBtnEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6">
          {deals.map((deal) => (
            <div key={deal.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-6 min-w-0">
              <div className="group relative h-[420px] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                {/* Background Image */}
                <Image
                  src={deal.image}
                  alt={deal.city}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

                {/* Content Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-5 shadow-lg">
                  {/* Header: Route & Logo */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <span>{deal.originCode}</span>
                      <Plane className="w-3 h-3 text-slate-400" />
                      <span>{deal.code}</span>
                    </div>
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                      <Image 
                        src={deal.airlineLogo} 
                        alt="Airline" 
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* City Name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{deal.city}</h3>

                  {/* Footer: Details & Price */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-500 font-medium">{deal.dates}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Luggage className="w-3.5 h-3.5" />
                        <span>{deal.baggage}</span>
                      </div>
                    </div>

                    <button className="flex items-center gap-2 bg-blue-500 text-white pl-4 pr-3 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 group/btn">
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] opacity-80 font-medium">from</span>
                        <span className="text-lg font-bold">${deal.price}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const staticDeals: Deal[] = [
  {
    id: 1,
    city: 'Tokyo',
    code: 'HND',
    origin: 'SYD',
    originCode: 'SYD',
    image: '/assets/images/bg/01.jpg',
    airlineLogo: '/assets/images/airlines/Cathay-Pacific.png',
    dates: '12 Mar - 20 Mar',
    baggage: '20kg included',
    price: 850,
  },
  {
    id: 2,
    city: 'Bali',
    code: 'DPS',
    origin: 'SYD',
    originCode: 'SYD',
    image: '/assets/images/bg/02.jpg',
    airlineLogo: '/assets/images/airlines/Singapore-Airlines.png',
    dates: '05 Apr - 12 Apr',
    baggage: '7kg carry-on',
    price: 420,
  },
  {
    id: 3,
    city: 'London',
    code: 'LHR',
    origin: 'SYD',
    originCode: 'SYD',
    image: '/assets/images/bg/03.jpg',
    airlineLogo: '/assets/images/airlines/emirates-airlines.png',
    dates: '01 Jun - 15 Jun',
    baggage: '23kg included',
    price: 1250,
  },
  {
    id: 4,
    city: 'Kathmandu',
    code: 'KTM',
    origin: 'SYD',
    originCode: 'SYD',
    image: '/assets/images/bg/04.jpg',
    airlineLogo: '/assets/images/airlines/MH.webp',
    dates: '10 Aug - 25 Aug',
    baggage: '30kg included',
    price: 980,
  },
];

export default TopDeals;
