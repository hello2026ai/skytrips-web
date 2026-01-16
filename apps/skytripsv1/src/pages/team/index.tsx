import Image from 'next/image';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { NextSeo } from 'next-seo';
import { Button } from '../../components/ui/button';
import { 
  Calendar, 
  Globe, 
  Users, 
  Headphones, 
  Leaf, 
  Heart, 
  Compass, 
  ArrowRight 
} from 'lucide-react';

const OurTeam = () => {
  const teamInfo = [
    {
      id: 1,
      name: 'Anusandhan Adhikari',
      position: 'CEO & Founder',
      description:
        'With 10+ years of airline ticketing experience, Anusandhan drives SkyTrips to provide seamless, affordable global travel solutions.',
      image: '/assets/images/team/anusandhan.webp',
      quote: "Travel isn't just about moving; it's about changing. Been to 45 countries and counting."
    },
    {
      id: 2,
      name: 'Krishna Gurung',
      position: 'CTO',
      description:
        'Leading technological innovation to enhance seamless global travel solutions.',
      image: '/assets/images/team/krishna.webp',
      quote: "Building tools that make the world smaller. Loves spicy street food and night markets."
    },
    {
      id: 3,
      name: 'Manish Thapa',
      position: 'Head of Marketing',
      description:
        'Leads strategic campaigns to enhance brand visibility and drive customer engagement.',
      image: '/assets/images/team/manish.webp',
    },
    {
      id: 4,
      name: 'Saugat Rimal',
      position: 'Head of Operations',
      description:
        'Expertly handles all airline ticketing-related issues ensuring smooth operations.',
      image: '/assets/images/team/saugat.webp',
    },
    {
      id: 5,
      name: 'Ishan Giri',
      position: 'Chief Financial Officer',
      description:
        "Oversees financial operations with precision and expertise.",
      image: '/assets/images/team/ishannn.webp',
    },
    {
      id: 6,
      name: 'Gain Maharjan',
      position: 'Product Manager',
      description:
        'Leads product development with a focus on innovation and user needs.',
      image: '/assets/images/team/gain.webp',
    },
    {
      id: 7,
      name: 'Bijaya Majhi',
      position: 'Backend Engineer',
      description:
        'Dedicated to developing robust and efficient server-side solutions.',
      image: '/assets/images/team/bijaya.webp',
    },
    {
      id: 8,
      name: 'Saraswati Lama',
      position: 'Frontend Engineer',
      description:
        'Excels at building intuitive and responsive user interfaces.',
      image: '/assets/images/team/saraswati.webp',
    },
    {
      id: 9,
      name: 'Namrata BK',
      position: 'Social Media Manager',
      description:
        'Drives brand engagement by creating impactful content.',
      image: '/assets/images/team/narmata.webp',
    },
  ];

  const leadership = teamInfo.slice(0, 2);
  const teamMembers = teamInfo.slice(2);

  const stats = [
    { label: 'Years in Business', value: '10+', icon: <Calendar className="w-6 h-6 text-blue-500" /> },
    { label: 'Countries Covered', value: '120', icon: <Globe className="w-6 h-6 text-blue-500" /> },
    { label: 'Happy Travelers', value: '50k+', icon: <Users className="w-6 h-6 text-blue-500" /> },
    { label: 'Global Support', value: '24/7', icon: <Headphones className="w-6 h-6 text-blue-500" /> },
  ];

  const values = [
    {
      title: 'Sustainability First',
      description: 'We prioritize eco-friendly partners and aim to leave every destination better than we found it.',
      icon: <Leaf className="w-5 h-5 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Customer Obsessed',
      description: 'Your journey is personal to us. We listen, adapt, and go the extra mile to ensure your happiness.',
      icon: <Users className="w-5 h-5 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Authentic Adventure',
      description: "We seek out the real, the raw, and the beautiful experiences that aren't found in guidebooks.",
      icon: <Compass className="w-5 h-5 text-white" />,
      color: 'bg-indigo-500'
    },
  ];

  // Structured data for team page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'SkyTrips Team',
    description:
      'Meet the SkyTrips team - dedicated professionals ensuring seamless flight bookings.',
    url: 'https://skytrips.com.au/team',
    mainEntity: {
      '@type': 'Organization',
      name: 'SkyTrips',
      url: 'https://skytrips.com.au',
      employee: teamInfo.map((member) => ({
        '@type': 'Person',
        name: member.name,
        jobTitle: member.position,
        description: member.description,
        image: `https://skytrips.com.au${member.image}`,
        worksFor: {
          '@type': 'Organization',
          name: 'SkyTrips',
        },
      })),
    },
  };

  return (
    <>
      <NextSeo
        title="Meet the SkyTrips Team | Flight Booking Experts"
        description="Get to know the SkyTrips team—dedicated professionals ensuring seamless flight bookings."
        canonical="https://skytrips.com.au/team"
        openGraph={{
          url: 'https://skytrips.com.au/team',
          title: 'Meet the SkyTrips Team | Flight Booking Experts',
          description:
            'Get to know the SkyTrips team—dedicated professionals ensuring seamless flight bookings.',
          images: [
            {
              url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: 'SkyTrips',
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
      
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-white pt-12 pb-24 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2 text-left z-10">
                <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-4 block">
                  Our Mission
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Travel is better when we do it <span className="text-blue-600">together.</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                  Meet the passionate explorers building the future of travel. We are dedicated to making every journey unforgettable, one connection at a time.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-6 text-lg shadow-lg shadow-blue-200 transition-all hover:shadow-xl">
                    Our Story
                  </Button>
                  <Button variant="outline" className="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg px-8 py-6 text-lg">
                    View Careers
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform md:rotate-2 hover:rotate-0 transition-all duration-500">
                  <Image
                    src="/assets/images/about/02.jpg"
                    alt="Team collaboration"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent mix-blend-multiply" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-50 -z-10" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white border-b border-gray-100 pb-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Leadership</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Visionaries who guide our path to new horizons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {leadership.map((leader) => (
                <div key={leader.id} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 group">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{leader.name}</h3>
                    <p className="text-blue-600 font-medium text-sm mb-4">{leader.position}</p>
                    <p className="text-gray-500 text-sm italic leading-relaxed">
                      "{leader.quote || leader.description}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet the Team</h2>
                <p className="text-gray-600 text-lg">The people behind the platform.</p>
              </div>
              <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2 group">
                View all members 
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="group">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-gray-100">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium text-sm mb-3">{member.position}</p>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                    "{member.description}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What drives us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Our core values define who we are and how we serve our travelers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div className={`w-12 h-12 rounded-xl ${value.color} flex items-center justify-center mb-6 shadow-lg shadow-gray-200`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="bg-blue-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}>
              </div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Want to help the world explore?
                </h2>
                <p className="text-blue-100 text-lg md:text-xl mb-10">
                  We are always looking for passionate people to join our team. Remote-first, competitive benefits.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 text-lg rounded-xl font-semibold shadow-lg">
                    View Open Roles
                  </Button>
                  <p className="text-blue-200 text-xs">Currently hiring: Engineering, Design, Support</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default OurTeam;
