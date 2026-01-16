import React, { useEffect } from 'react';
import Image from 'next/image';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { NextSeo } from 'next-seo';
import { Button } from '../../components/ui/button';
import {
  Users,
  Globe,
  Leaf,
  Flag,
  ArrowLeft,
  ArrowRight,
  Plane,
  ThumbsUp,
  Heart,
} from 'lucide-react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About SkyTrips',
    description:
      'Learn about SkyTrips, your trusted source for cheap flight booking and travel services.',
    url: 'https://skytrips.com.au/about',
    mainEntity: {
      '@type': 'TravelAgency',
      name: 'SkyTrips',
      alternateName: 'A2link Business House Pty Ltd',
      url: 'https://skytrips.com.au',
      logo: 'https://skytrips.com.au/assets/logo.svg',
      description:
        'SkyTrips is a trusted provider of easy flight booking and cheap flights. We help you save on travel with the best deals, fast bookings, and reliable service.',
      foundingDate: '2014',
      areaServed: ['Australia', 'Nepal', 'Worldwide'],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+61-240720886',
        contactType: 'Customer Service',
        email: 'info@skytrips.com.au',
        availableLanguage: ['English'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '42 Rainbows Way',
        addressLocality: 'Leppington',
        addressRegion: 'NSW',
        postalCode: '2179',
        addressCountry: 'Australia',
      },
    },
  };

  // Timeline Data
  const timelineEvents = [
    {
      year: '2015',
      title: 'Founded in Bali',
      description: 'The journey began with a single backpack and a vision for authentic connection. Our first curated trip launched with just 5 travelers.',
      icon: <Flag className="w-6 h-6 text-white" />,
      active: true,
    },
    {
      year: '2018',
      title: 'First 10,000 Travelers',
      description: 'Our community grew beyond borders, connecting like-minded explorers across 15 different countries.',
      icon: <Users className="w-6 h-6 text-blue-500" />,
      active: false,
    },
    {
      year: '2020',
      title: 'Global Expansion',
      description: 'Despite challenges, we expanded our operations to over 30 countries, building local partnerships worldwide.',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      active: false,
    },
    {
      year: '2023',
      title: 'Sustainable Initiative',
      description: 'We launched our carbon-neutral commitment, planting a tree for every booking made on our platform.',
      icon: <Leaf className="w-6 h-6 text-blue-500" />,
      active: false,
    },
  ];

  const coreValues = [
    {
      title: 'Authenticity',
      description: 'We prioritize real experiences over tourist traps. We connect you with local people and hidden gems.',
      icon: <ThumbsUp className="w-8 h-8 text-blue-500" />,
    },
    {
      title: 'Sustainability',
      description: 'We believe in leaving destinations better than we found them. Responsible travel is at the heart of what we do.',
      icon: <Leaf className="w-8 h-8 text-green-500" />,
    },
    {
      title: 'Connection',
      description: 'Travel breaks down barriers. We foster understanding and friendship across borders and cultures.',
      icon: <Heart className="w-8 h-8 text-red-500" />,
    },
  ];

  return (
    <>
      <NextSeo
        title="About SkyTrips – Your Trusted Source for Cheap Flight Booking"
        description="Discover the story behind SkyTrips. From our humble beginnings to becoming a leading travel agency, learn about our mission, values, and the team dedicated to your journey."
        canonical="https://skytrips.com.au/about"
        openGraph={{
          url: 'https://skytrips.com.au/about',
          title: 'About SkyTrips – Your Trusted Source for Cheap Flight Booking',
          description:
            'Discover the story behind SkyTrips. From our humble beginnings to becoming a leading travel agency, learn about our mission, values, and the team dedicated to your journey.',
          images: [
            {
              url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: 'SkyTrips Team',
            },
          ],
          site_name: 'SkyTrips',
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Navbar />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/images/about/about-banner-min.webp"
              alt="SkyTrips Banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          
          <div className="container relative z-10 px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Redefining How the <span className="text-blue-400">World Explores</span>.
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200 mb-8 animate-fade-in-up delay-200">
              Travel is the only thing you buy that makes you richer. We believe in journeys that matter.
            </p>
            <div className="animate-fade-in-up delay-300">
              <Button size="lg" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8" onClick={() => document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' })}>
                View Destinations
              </Button>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="our-story" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Our Story</h2>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
                Every great journey begins with a single step. Ours began with a missed connection and a serendipitous discovery.
              </p>
            </div>

            {/* Chapter 01 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-24 md:mb-32">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-0.5 bg-blue-500"></span>
                  <span className="text-blue-500 font-bold tracking-widest text-sm uppercase">Chapter 01</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">The Beginning</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  From a backpack in Bali to a global network. It started in 2015 with a simple idea: what if travel wasn't just about sightseeing, but about true connection?
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Our founders found themselves stranded in a small village during a monsoon. Instead of a hotel, they stayed with a local family. That experience changed everything.
                </p>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-500">
                  <Image
                    src="/assets/images/about/01.jpg"
                    alt="Backpack in nature"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Chapter 02 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="w-full md:w-1/2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-all duration-500">
                  <Image
                    src="/assets/images/about/02.jpg"
                    alt="Group of friends with map"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-0.5 bg-blue-500"></span>
                  <span className="text-blue-500 font-bold tracking-widest text-sm uppercase">Chapter 02</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Growing Together</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  We realized that the best stories aren't found in guidebooks. They are found in the shared meals, the stumbling conversations in a new language, and the quiet moments of awe.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Today, we are a team of dreamers and doers, working across 4 continents to bring authentic experiences to travelers worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Journey Section */}
        <section className="py-20 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">Our Journey</h2>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute top-7 left-0 right-0 h-0.5 bg-blue-100 -z-10" />

              {/* Grid Container */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    {/* Icon Bubble */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-8 z-10 transition-all duration-300 ${
                        event.active
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-2 border-blue-100 text-blue-500'
                      }`}
                    >
                      {event.icon}
                    </div>

                    {/* Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 h-full flex flex-col items-center w-full">
                      <span className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
                        {event.year}
                      </span>
                      <h3 className="text-xl font-bold mb-4 text-slate-900">
                        {event.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4 mt-16">
                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors bg-white">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors bg-white">
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-24 bg-blue-50 relative overflow-hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Plane className="w-[500px] h-[500px] text-blue-900" />
            </div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                <span className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-8">
                    Our Mission
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
                    "To make travel accessible, sustainable, and unforgettable for everyone, everywhere."
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    We are bridging cultures through exploration, one trip at a time.
                </p>
            </div>
        </section>

        {/* Core Values Section */}
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">Our Core Values</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {coreValues.map((value, idx) => (
                        <div key={idx} className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
                                {value.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden bg-blue-600">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-blue-600" /> 
             <Image
              src="/assets/images/about/footer-img-min.webp"
              alt="CTA Background"
              fill
              className="object-cover opacity-20 mix-blend-overlay"
            />
          </div>
          <div className="container relative z-10 px-4 mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to write your own story?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of travelers exploring the world today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 text-lg rounded-full" onClick={() => window.location.href = '/'}>
                Explore Destinations
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <style jsx global>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default About;
