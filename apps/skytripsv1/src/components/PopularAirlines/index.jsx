import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../lib/axiosConfig';
import { useRouter } from 'next/router';
import { FaSearch } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import Breadcrumb from '../Breadcrumb';

const PopularAirlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/airline?page=1&limit=1000');

        setAirlines(response.data.data || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch airlines'
        );
        setAirlines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center text-gray-500">Loading airlines...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error: {error}</div>
          <p className="text-sm text-gray-500">Check console for details</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl bg-container rounded-lg mx-auto shadow-sm px-6 py-10">
      {/* Title */}
      <h2 className="h3 font-bold text-center text-slate-900 mb-8">
        Other popular airlines in Australia
      </h2>

      {/* Airlines Grid */}
      <ul className="grid grid-cols-6 gap-7 mb-12 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {airlines.slice(0, 8).map((airline) => (
          <li key={airline.id} className="flex items-center justify-center">
            <div className="w-10 h-10  rounded-full">
              <img
                src={
                  airline.media?.id && airline.media?.fileKey
                    ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                        /\/$/,
                        ''
                      )}/${airline.media.fileKey.replace(/^\//, '')}`
                    : airline.logoUrl
                    ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL?.replace(
                        /\/$/,
                        ''
                      )}/${airline.logoUrl.replace(/^\//, '')}`
                    : null
                }
                alt={
                  airline?.media?.fileAltText
                    ? airline.media.fileAltText
                    : airline.airlineName
                }
                className="w-10 h-10 object-contain mb-2 grayscale opacity-90 hover:opacity-100 transition-opacity rounded-full"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0.4';
                }}
              />
            </div>
            <span className="label-l2 text-background-on text-center ml-2">
              {airline.airlineName}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Card */}
      <div className="bg-background-on rounded-lg border px-5 py-6 flex flex-col md:flex-row items-start md:items-center justify-between  gap-2">
        <div className="lg:w-8/12 ">
          <h3 className="title-t1 text-background-on mb-2">
            Ready to book your flight?
          </h3>
          <p className="label-l2 text-background-on">
            Find the best deals and book with confidence. We provide expert
            advice for your journey.
          </p>
        </div>

        <div className="flex gap-3 lg:w-4/12 lg:justify-end items-center justify-center flex-shrink-0">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 label-l2 text-secondary-on bg-primary  hover:bg-[#5143d9] px-5 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
          >
            <FaSearch className="w-4 h-4" /> {/* Search icon on the left */}
            Search Flights
          </button>
          <button
            onClick={() => {
              window.open('/inquiry', '_blank');
            }}
            className="flex items-center gap-2 label-l2 bg-gray-100 hover:bg-[#d9d9d9] border px-5 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            <MdOutlineMail className="w-4 h-4" />
            Get a quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularAirlines;
