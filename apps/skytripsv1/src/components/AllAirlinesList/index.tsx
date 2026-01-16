'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../lib/axiosConfig';

interface Airline {
  id: string;
  airlineName: string;
  airlineCode: string;
  country?: string;
  alliance?: string;
  airlineType?: string;
  yearOfEstablishment?: string;
  totalDestination?: string;
  totalFleet?: string;
  logoUrl?: string;
  description?: string;
}

interface CachedData {
  data: Airline[];
  timestamp: number;
}

const CACHE_KEY = 'airlines_with_description';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const AllAirlinesList = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        // Check if cached data exists and is still valid
        const cachedItem = localStorage.getItem(CACHE_KEY);
        if (cachedItem) {
          const cachedData: CachedData = JSON.parse(cachedItem);
          const now = Date.now();

          // If cache is still valid (less than 1 day old)
          if (now - cachedData.timestamp < CACHE_DURATION) {
            setAirlines(cachedData.data);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data if no cache or cache expired
        const response = await axiosInstance.get('/airline?page=1&limit=1000');
        const airlinesData = response.data?.data || [];

        // Filter airlines with non-empty description
        const airlinesWithDescription = airlinesData.filter(
          (airline: Airline) =>
            airline.description && airline.description.trim() !== ''
        );

        setAirlines(airlinesWithDescription);

        // Store in cache with timestamp
        const cacheData: CachedData = {
          data: airlinesWithDescription,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error fetching airlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-gray-600">Loading airlines...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {airlines.map((airline) => (
        <div
          key={airline.id}
          className="bg-container rounded-lg shadow-sm p-6 md:p-8"
        >
          {/* Title */}
          <h2 className="title-t2 text-background-on md:text-3xl font-bold text-gray-900 mb-4">
            {airline.airlineName}
          </h2>

          {/* Airline Description */}
          {airline.description && (
            <div
              className="label-l1 text-neutral-dark leading-relaxed mb-6 text-base"
              dangerouslySetInnerHTML={{
                __html: airline.description,
              }}
            />
          )}

          {/* Airline Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {/* Airline Code */}
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">
                Airline code
              </div>
              <div className="title-t3 text-background-on">
                {airline.airlineCode}
              </div>
            </div>

            {/* Airline Name */}
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">
                Airline name
              </div>
              <div className="title-t3 text-background-on">
                {airline.airlineName}
              </div>
            </div>

            {/* Alliance */}
            {airline.alliance && (
              <div className="border border-gray-200 rounded-lg p-4 bg-container">
                <div className="label-l2 text-neutral-dark mb-1">Alliance</div>
                <div className="title-t3 text-background-on">
                  {airline.alliance}
                </div>
              </div>
            )}

            {/* Airline Type */}
            {airline.airlineType && (
              <div className="border border-gray-200 rounded-lg p-4 bg-container">
                <div className="label-l2 text-neutral-dark mb-1">
                  Airline type
                </div>
                <div className="title-t3 text-background-on">
                  {airline.airlineType}
                </div>
              </div>
            )}

            {/* Home Country */}
            {airline.country && (
              <div className="border border-gray-200 rounded-lg p-4 bg-container">
                <div className="label-l2 text-neutral-dark mb-1">
                  Home country
                </div>
                <div className="title-t3 text-background-on">
                  {airline.country}
                </div>
              </div>
            )}

            {/* Year of Establishment */}
            {airline.yearOfEstablishment && (
              <div className="border border-gray-200 rounded-lg p-4 bg-container">
                <div className="label-l2 text-neutral-dark mb-1">
                  Year of establishment
                </div>
                <div className="title-t3 text-background-on">
                  {airline.yearOfEstablishment}
                </div>
              </div>
            )}

            {/* Destinations */}
            {airline.totalDestination && (
              <div className="border border-gray-200 rounded-lg p-4 bg-container">
                <div className="label-l2 text-neutral-dark mb-1">
                  Destinations
                </div>
                <div className="title-t3 text-background-on">
                  {airline.totalDestination}
                </div>
              </div>
            )}

            {/* Fleets */}
            {airline.totalFleet && (
              <div className="border border-gray-200 rounded-lg p-4 bg-container">
                <div className="label-l2 text-neutral-dark mb-1">Fleets</div>
                <div className="title-t3 text-background-on">
                  {airline.totalFleet}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllAirlinesList;
