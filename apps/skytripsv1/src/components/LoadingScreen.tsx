'use client';

import { SearchParams } from 'apps/skytripsv1/types';
import { TagIcon, GlobeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LoadingScreen({
  searchParams,
  progress,
}: {
  searchParams: SearchParams | null;
  progress: number;
}) {
  const [airports, setAirports] = useState<any>({});

  useEffect(() => {
    const storedAirports = localStorage.getItem('skytrips_airports');
    if (storedAirports) {
      setAirports(JSON.parse(storedAirports));
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg border border-gray-100 relative overflow-hidden">
        <div className="p-8 mx-auto max-w-2xl">
          <div className="inline-flex items-center mb-4">
            <span className="bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full text-sm mr-2">
              <span className="animate-pulse">●</span> Live Search
            </span>
          </div>

          <h1 className="h4 text-primary mb-4">Searching flights</h1>

          <div className="flex items-center mb-6">
            <div className="flex-1 text-center">
              <span className="h5 text-primary-bright-variant block">
                {searchParams?.originLocationCode
                  ? searchParams?.originLocationCode
                  : 'Origin'}
              </span>
            </div>

            <div className="px-4 flex flex-col gap-1 w-24">
              <div className="h-0.5 bg-gradient-to-r from-[#0c0073] to-[#5143d9] flex-grow relative"></div>
            </div>

            <div className="flex-1 text-center">
              <span className="h5 text-primary-bright-variant block">
                {searchParams?.destinationLocationCode
                  ? searchParams?.destinationLocationCode
                  : 'Destination'}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Finding the best fares for you...
          </p>

          {/* Progress bar with animated plane */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
              <span>Searching</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-5 bg-gray-100 rounded-lg overflow-hidden relative p-1">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-900 rounded-lg transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
              <div className="absolute top-0 left-0 h-full w-full">
                <div className="relative h-full">
                  {/* Flight route dots pattern */}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full px-2 flex justify-between items-center">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-white opacity-70"
                      ></div>
                    ))}
                  </div>

                  {/* Animated plane */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out z-10"
                    style={{
                      left: `${Math.min(Math.max(progress - 3, 0), 97)}%`,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ transform: 'rotate(90deg)' }}
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-900 mr-1"></div>
                <span>Origin</span>
              </div>
              <div className="flex items-center">
                <span>Destination</span>
                <div className="w-2 h-2 rounded-full bg-blue-600 ml-1"></div>
              </div>
            </div>
          </div>

          {/* Loading information */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center bg-blue-50/70 px-3 py-1.5 rounded-full text-sm">
                <TagIcon className="text-blue-800 h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="text-gray-700">Finding deals</span>
              </div>
              <div className="inline-flex items-center bg-blue-50/70 px-3 py-1.5 rounded-full text-sm">
                <GlobeIcon className="text-blue-800 h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="text-gray-700">Checking airlines</span>
              </div>
              <div className="inline-flex items-center bg-blue-50/70 px-3 py-1.5 rounded-full text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-blue-800 h-3.5 w-3.5 mr-1.5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8V6m0 0V4m0 2h2m-2 0H10m10 8a8 8 0 11-16 0 8 8 0 0116 0zm-3.536-3.536a5 5 0 00-7.072 0L12 11.5l.707-.707z" />
                </svg>
                <span className="text-gray-700">Optimizing routes</span>
              </div>
            </div>
          </div>

          {/* Trip information */}
          {/* <div className="mt-6 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium text-blue-700">Trip Details:</span>
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></span>
                  <span className="text-gray-700">
                    {searchParams?.adults ? `${searchParams.adults} Adult${searchParams.adults > 1 ? 's' : ''}` : 'Passengers'}
                  </span>
                </div>
                <span className="text-gray-300 mx-1">•</span>
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></span>
                  <span className="text-gray-700">
                    {searchParams?.travelClass || 'Economy'} Class
                  </span>
                </div>
              </div>
            </div> */}
        </div>
      </div>
    </div>
  );
}
