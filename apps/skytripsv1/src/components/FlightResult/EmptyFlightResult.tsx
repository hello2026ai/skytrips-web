import React from 'react';
import { Button } from "../../components/ui/button";
import Link from 'next/link';
import { format } from 'date-fns';

// Create the SearchParams interface locally since we don't have @/lib/types
interface SearchParams {
  originLocationCode?: string;
  destinationLocationCode?: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  [key: string]: any;
}

interface EmptyFlightResultProps {
  searchParams: SearchParams | null;
}

const EmptyFlightResult: React.FC<EmptyFlightResultProps> = ({ searchParams }) => {
  const formattedDepartureDate = searchParams?.departureDate 
    ? format(new Date(searchParams.departureDate), 'MMMM dd, yyyy')
    : 'the selected date';
  
  const formattedReturnDate = searchParams?.returnDate 
    ? format(new Date(searchParams.returnDate), 'MMMM dd, yyyy')
    : '';
  
  const origin = searchParams?.originLocationCode || 'the origin';
  const destination = searchParams?.destinationLocationCode || 'the destination';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto text-center mt-8">

      <h2 className="text-3xl font-bold text-gray-900 mb-4">No Flights Available</h2>
      
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        We couldn't find any flights from <span className="font-semibold text-blue-700">{origin}</span> to{' '}
        <span className="font-semibold text-blue-700">{destination}</span> on{' '}
        <span className="font-semibold text-blue-700">{formattedDepartureDate}</span>
        {formattedReturnDate && <> returning on <span className="font-semibold text-blue-700">{formattedReturnDate}</span></>}.
      </p>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100 max-w-lg mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Suggestions</h3>
        <ul className="text-left text-gray-700 space-y-3">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Try searching for <strong>different dates</strong> - flights might be available on other days</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Consider <strong>nearby airports</strong> for your departure or arrival</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Check for <strong>alternative routes</strong> that might include a stopover</span>
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-full transition-all"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
      
      <style jsx global>
        {`
          @keyframes float {
            0% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-10px) rotate(-5deg);
            }
            100% {
              transform: translateY(0px) rotate(0deg);
            }
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default EmptyFlightResult;
