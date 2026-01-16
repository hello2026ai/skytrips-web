import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { SearchWidget } from '../SearchWidget';
import { SearchParams } from '../../../types';
import { ArrowLeftRight, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { encodeData } from '../../utils/urlEncoding';

interface EditSearchProps {
  searchParams: SearchParams | null;
  setShowSearchForm: React.Dispatch<React.SetStateAction<boolean>>;
  showSearchForm: boolean;
  handleSearchModify: (newParams: any) => void;
}

const EditSearch: React.FC<EditSearchProps> = ({
  searchParams,
  setShowSearchForm,
  showSearchForm,
  handleSearchModify,
}) => {
  const isRoundTrip = Boolean(searchParams?.returnDate);
  const router = useRouter();

  const handleEditSearch = () => {
    setShowSearchForm((prevState) => !prevState);
  };

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (showSearchForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showSearchForm]);

  // Helper function to create properly formatted airport objects
  const createAirportObject = (code: string | undefined) => {
    if (!code) {
      return {
        code: '',
        name: '',
        city: '',
        country: '',
      };
    }

    // Try to get stored airport data from localStorage
    try {
      const savedAirports = localStorage.getItem('skytrips_airports');
      if (savedAirports) {
        const airports = JSON.parse(savedAirports);

        // Check if this is the origin or destination
        if (airports.fromAirport && airports.fromAirport.code === code) {
          return airports.fromAirport;
        }

        if (airports.toAirport && airports.toAirport.code === code) {
          return airports.toAirport;
        }
      }
    } catch (error) {
      console.error('Error loading saved airports:', error);
    }

    // Fallback to basic object with code only
    return {
      code: code,
      name: `${code} Airport`, // Create placeholder name
      city: code, // Use code as placeholder city
      country: 'Unknown', // Default country
    };
  };

  // Check if we already have complete airport objects in searchParams
  const fromAirport =
    searchParams?.fromAirport ||
    createAirportObject(searchParams?.originLocationCode);

  const toAirport =
    searchParams?.toAirport ||
    createAirportObject(searchParams?.destinationLocationCode);

  // Handle search submission with the same function used on homepage
  const handleSearchSubmit = (searchParams: SearchParams) => {
    console.log({ searchParams });

    // Save airport selections to localStorage if they exist
    if (
      searchParams.originLocationCode &&
      searchParams.destinationLocationCode
    ) {
      try {
        // Look up the active airports from the search widget to get the full airport objects
        const searchWidgetData = document.querySelector(
          'form[data-airport-data]'
        );
        if (searchWidgetData) {
          const airportData = JSON.parse(
            searchWidgetData.getAttribute('data-airport-data') || '{}'
          );
          if (airportData.fromAirport && airportData.toAirport) {
            // Set the full airport objects in the search params
            searchParams.fromAirport = airportData.fromAirport;
            searchParams.toAirport = airportData.toAirport;

            localStorage.setItem(
              'skytrips_airports',
              JSON.stringify({
                fromAirport: airportData.fromAirport,
                toAirport: airportData.toAirport,
              })
            );
          }
        }
      } catch (error) {
        console.error('Error saving airport data:', error);
      }
    }

    // Encode the search parameters using our custom base64 encoding
    const encodedParams = encodeData(searchParams);

    // Close the drawer
    setShowSearchForm(false);

    // Check if we have the required parameters before redirecting
    if (
      !searchParams.originLocationCode ||
      !searchParams.destinationLocationCode
    ) {
      console.error('Missing required search parameters');
      return;
    }

    // Instead of using router.push which uses client-side navigation,
    // use window.location to force a full page reload.
    // This ensures the API call is triggered with the new parameters
    window.location.href = `/flights-results?q=${encodedParams}`;
  };

  return (
    <div className="border-b bg-container w-full relative">
      {/* Top drawer that slides down */}
      <div
        className={`fixed left-0 top-0 right-0 w-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          showSearchForm ? 'translate-y-0' : 'translate-y-[-100%]'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="w-full pb-3">
          <div className="container flex justify-end items-center">
            {/* <h3 className="font-medium text-lg">Modify your search</h3> */}
            <Button
              onClick={() => setShowSearchForm(false)}
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full cursor-pointer  "
              aria-label="Close search drawer"
            >
              <X className="h-5 w-7" />
            </Button>
          </div>

          <div className="container search-widget-full-width px-4">
            <SearchWidget
              initialValues={{
                fromAirport: fromAirport,
                toAirport: toAirport,
                dateRange: {
                  from: searchParams?.departureDate
                    ? new Date(searchParams.departureDate)
                    : null,
                  to: searchParams?.returnDate
                    ? new Date(searchParams.returnDate)
                    : null,
                },
                passengerCount: {
                  adults: searchParams?.adults || 1,
                  children: searchParams?.children || 0,
                  infants: searchParams?.infants || 0,
                },
                cabinClass: searchParams?.travelClass || 'ECONOMY',
                hasNepaleseCitizenship: false,
              }}
              onSubmit={handleSearchSubmit}
              compact={true}
              defaultToRoundTrip={false}
            />
          </div>

          {/* Add custom style to override the max-width of the SearchWidget */}
          <style jsx global>{`
            .search-widget-full-width form > div {
              max-width: 100% !important;
              width: 100%;
            }
          `}</style>
        </div>
      </div>

      {/* Overlay background */}
      {showSearchForm && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowSearchForm(false)}
        ></div>
      )}

      <div className="container px-4 py-2 mx-auto w-full">
        {/* Mobile view */}
        <div className="flex flex-row items-center justify-between sm:hidden w-full">
          <div className="flex items-center">
            {/* Trip type */}
            <div className="px-2 py-1 title-t4 text-background-on text-gray-700">
              {isRoundTrip ? 'Round Trip' : 'One Way'}
            </div>

            <div className="h-4 border-l border-gray-300 mx-1"></div>

            {/* Route */}
            <div className="px-2 py-1 flex items-center">
              <span className="title-t4 text-background-on">
                {searchParams?.originLocationCode}
              </span>
              {isRoundTrip ? (
                <ArrowLeftRight className="h-4 w-4 mx-1 title-t4 text-background-on" />
              ) : (
                <ArrowRight className="h-4 w-4 mx-1 title-t4 text-background-on" />
              )}
              <span className="title-t4 text-background-on">
                {searchParams?.destinationLocationCode}
              </span>
            </div>
          </div>

          {/* Edit Search Button - Mobile view */}
          <div className="ml-auto">
            <Button
              onClick={handleEditSearch}
              className="bg-primary hover:bg-[#5143d9] label-l1 text-secondary-on"
            >
              Edit Search
            </Button>
          </div>
        </div>

        {/* Desktop view - auto layout for content-based sizing */}
        <div className="hidden sm:flex sm:items-center w-full">
          <div className="flex w-full">
            {/* Trip type */}
            <div className="px-4 py-1 flex items-center justify-center border-r border-gray-300 whitespace-nowrap h-10">
              <span className="title-t4 text-background-on text-gray-700">
                {isRoundTrip ? 'Round Trip' : 'One Way'}
              </span>
            </div>

            {/* Route */}
            <div className="px-4 py-1 flex items-center justify-center border-r border-gray-300 whitespace-nowrap h-10">
              <span className="title-t4 text-background-on">
                {searchParams?.originLocationCode}
              </span>
              {isRoundTrip ? (
                <ArrowLeftRight className="h-4 w-4 mx-1 title-t4 text-background-on" />
              ) : (
                <ArrowRight className="h-4 w-4 mx-1 title-t4 text-background-on" />
              )}
              <span className="title-t4 text-background-on">
                {searchParams?.destinationLocationCode}
              </span>
            </div>

            {/* Date */}
            <div className="px-4 py-1 flex items-center justify-center border-r border-gray-300 whitespace-nowrap h-10">
              <span className="title-t4 text-background-on">
                {searchParams?.departureDate
                  ? format(new Date(searchParams.departureDate), 'd MMM, EEE')
                  : ''}
                {isRoundTrip && searchParams?.returnDate && (
                  <>
                    <span className="mx-1">-</span>
                    {format(new Date(searchParams.returnDate), 'd MMM, EEE')}
                  </>
                )}
              </span>
            </div>

            {/* Passengers */}
            <div className="px-4 py-1 flex items-center justify-center border-r border-gray-300 whitespace-nowrap h-10">
              <span className="title-t4 text-background-on">
                {(searchParams?.adults ?? 0) +
                  (searchParams?.children ?? 0) +
                  (searchParams?.infants ?? 0)}{' '}
                Passenger
                {(searchParams?.adults ?? 0) +
                  (searchParams?.children ?? 0) +
                  (searchParams?.infants ?? 0) !==
                1
                  ? 's'
                  : ''}
              </span>
            </div>

            {/* Class */}
            <div className="px-4 py-1 flex items-center justify-center border-r border-gray-300 whitespace-nowrap h-10">
              <span className="title-t4 text-background-on">
                {searchParams?.travelClass === 'ECONOMY'
                  ? 'Economy'
                  : searchParams?.travelClass === 'PREMIUM_ECONOMY'
                  ? 'Premium Economy'
                  : searchParams?.travelClass === 'BUSINESS'
                  ? 'Business'
                  : searchParams?.travelClass === 'FIRST'
                  ? 'First'
                  : searchParams?.travelClass}{' '}
                Class
              </span>
            </div>

            {/* Button column */}
            <div className="ml-auto px-4 py-1 flex items-center justify-center h-10">
              <Button
                onClick={handleEditSearch}
                className="bg-primary hover:bg-[#5143d9] label-l1 text-secondary-on"
              >
                Edit Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSearch;
