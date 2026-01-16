import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { SearchParams } from '../../types';
import { FaPlane } from 'react-icons/fa6';
import { HiMiniUserGroup } from 'react-icons/hi2';

interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

interface RecentSearch {
  id: string;
  fromAirport: Airport;
  toAirport: Airport;
  date: string;
  returnDate?: string;
  passengers: number;
  price?: string;
  tripType: 'one_way' | 'round_trip';
  cabinClass?: string;
}

interface RecentSearchesProps {
  onSearchClick: (params: SearchParams) => void;
  onClearAll: () => void;
}

export function RecentSearches({
  onSearchClick,
  onClearAll,
}: RecentSearchesProps) {
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedSearches = localStorage.getItem('recent_searches');
    if (storedSearches) {
      try {
        const parsedSearches = JSON.parse(storedSearches);
        // Convert old format to new format if needed
        const convertedSearches = parsedSearches.map((search: any) => ({
          id: search.id,
          fromAirport: {
            code: search.fromCode || search.fromAirport?.code || '',
            city: search.fromCity || search.fromAirport?.city || '',
            name:
              search.fromName ||
              search.fromAirport?.name ||
              search.fromCity ||
              '',
            country:
              search.fromCountry || search.fromAirport?.country || 'Unknown',
          },
          toAirport: {
            code: search.toCode || search.toAirport?.code || '',
            city: search.toCity || search.toAirport?.city || '',
            name:
              search.toName || search.toAirport?.name || search.toCity || '',
            country: search.toCountry || search.toAirport?.country || 'Unknown',
          },
          date: search.date,
          returnDate: search.returnDate,
          passengers: search.passengers,
          price: search.price,
          tripType: search.tripType,
          cabinClass: search.cabinClass,
        }));

        // Filter unique searches based on key fields
        const uniqueSearches = convertedSearches.reduce(
          (acc: RecentSearch[], current: RecentSearch) => {
            const isDuplicate = acc.some(
              (search) =>
                search.fromAirport.code === current.fromAirport.code &&
                search.toAirport.code === current.toAirport.code &&
                search.tripType === current.tripType &&
                search.date === current.date &&
                search.returnDate === current.returnDate &&
                search.passengers === current.passengers &&
                search.cabinClass === current.cabinClass
            );

            if (!isDuplicate) {
              acc.push(current);
            }
            return acc;
          },
          []
        );

        // Only keep the 4 most recent unique searches
        setSearches(uniqueSearches.slice(0, 4));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Don't render anything on server-side
  if (!mounted) return null;

  if (searches.length === 0) return null;

  const handleSearchClick = (search: RecentSearch) => {
    const params: SearchParams = {
      originLocationCode: search.fromAirport.code,
      destinationLocationCode: search.toAirport.code,
      departureDate: search.date,
      returnDate: search.returnDate || '',
      adults: search.passengers,
      children: 0,
      infants: 0,
      travelClass: search.cabinClass || 'ECONOMY',
      currencyCode: 'AUD',
      maxResults: 250,
      tripType: search.tripType,
      originDestinations:
        search.tripType === 'round_trip' && search.returnDate
          ? [
              {
                id: 1,
                departureDateTimeRange: {
                  date: search.date,
                },
                originLocationCode: search.fromAirport.code,
                destinationLocationCode: search.toAirport.code,
              },
              {
                id: 2,
                departureDateTimeRange: {
                  date: search.returnDate,
                },
                originLocationCode: search.toAirport.code,
                destinationLocationCode: search.fromAirport.code,
              },
            ]
          : [
              {
                id: 1,
                departureDateTimeRange: {
                  date: search.date,
                },
                originLocationCode: search.fromAirport.code,
                destinationLocationCode: search.toAirport.code,
              },
            ],
      fromAirport: search.fromAirport,
      toAirport: search.toAirport,
    };
    onSearchClick(params);
  };

  return (
    <div className="pl-1 pb-1">
      <p className="h3 text-background-on mb-6">Recent Searches</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {searches.slice(0, 4).map((search) => (
          <button
            key={search.id}
            onClick={() => handleSearchClick(search)}
            className="w-full bg-container rounded-lg py-3 px-3 hover:shadow-lg hover:shadow-gray-400/50 transition-shadow border text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600">
                <FaPlane color="#0c0073" />
              </span>
              <div className="flex items-center gap-2 label-l1 text-background-on">
                <span className="font-medium">{search.fromAirport.code}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{search.toAirport.code}</span>
              </div>
            </div>
            <div className="label-l2 text-neutral-dark mb-1">
              {search.fromAirport.city} to {search.toAirport.city}
            </div>
            <div className="flex flex-col sm:flex-row justify-between label-l3 text-neutral-dark gap-2 sm:gap-5">
              <div className="flex">
                <div>{format(new Date(search.date), 'MMM d')}</div>
                {search.returnDate && (
                  <div className="ml-0.5">
                    {' - '}
                    {format(new Date(search.returnDate), 'MMM d')}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  <HiMiniUserGroup />{' '}
                  <span className="ml-1">{`${search.passengers}`}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>
                  {search.cabinClass
                    ? search.cabinClass.charAt(0) +
                      search.cabinClass.slice(1).toLowerCase()
                    : 'Economy'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
