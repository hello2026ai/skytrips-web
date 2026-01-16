import React, { useState } from 'react';
import Image from 'next/image';

interface Destination {
  id: string | number;
  name: string;
  location: string;
  image: string;
}

const PopularDestinations = () => {
  const [activeTab, setActiveTab] = useState<'Cities' | 'Countries'>('Cities');

  const cities: Destination[] = [
    {
      id: 1,
      name: 'Sydney',
      location: 'NSW',
      image: '/assets/images/bg/sydney.jpg', // Fallback or placeholder
    },
    {
      id: 2,
      name: 'Melbourne',
      location: 'Victoria',
      image: '/assets/images/bg/melbourne.jpg',
    },
    {
      id: 3,
      name: 'Brisbane',
      location: 'Queensland',
      image: '/assets/images/bg/brisbane.jpg',
    },
    {
      id: 4,
      name: 'Perth',
      location: 'WA',
      image: '/assets/images/bg/perth.jpg',
    },
    {
      id: 5,
      name: 'Adelaide',
      location: 'SA',
      image: '/assets/images/bg/adelaide.jpg',
    },
    {
      id: 6,
      name: 'Gold Coast',
      location: 'Queensland',
      image: '/assets/images/bg/gold-coast.jpg',
    },
  ];

  // Placeholder data for countries if needed in future
  const countries: Destination[] = [
    {
      id: 1,
      name: 'Australia',
      location: 'Oceania',
      image: '/assets/images/bg/australia.jpg',
    },
    {
      id: 2,
      name: 'Nepal',
      location: 'Asia',
      image: '/assets/images/bg/nepal.jpg',
    },
    // ... more countries
  ];

  const displayItems = activeTab === 'Cities' ? cities : countries;

  return (
    <section className="container mx-auto px-4 md:px-10 py-12 md:py-16" aria-labelledby="popular-destinations-heading">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="max-w-2xl">
          <h2 
            id="popular-destinations-heading" 
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-3"
          >
            Popular Destinations
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Explore our top-rated locations loved by travelers from around the globe. Whether you seek urban excitement or tranquil retreats, find your perfect escape here.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg self-start md:self-end">
          <button
            onClick={() => setActiveTab('Cities')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              activeTab === 'Cities'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Cities
          </button>
          <button
            onClick={() => setActiveTab('Countries')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              activeTab === 'Countries'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Countries
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayItems.map((item) => (
          <div 
            key={item.id}
            className="group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer"
          >
            {/* Image */}
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              // Fallback for demo since we might not have exact images
              onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = '/assets/images/bg/01.jpg'; // Fallback
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 group-hover:to-black/90 transition-all duration-300" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-slate-300 font-medium">{item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularDestinations;
