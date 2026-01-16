import React from 'react';
import { ShieldCheck, Headset, Zap, Tag } from 'lucide-react';

const WhyChooseUs = () => {
  const benefits = [
    {
      id: 1,
      title: 'Unbeatable Prices',
      description: 'We compare hundreds of airlines to ensure you get the best deal possible for your journey.',
      icon: <Tag className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      id: 2,
      title: '24/7 Expert Support',
      description: 'Our local travel experts are here to help you anytime, day or night, via phone or chat.',
      icon: <Headset className="w-8 h-8 text-indigo-600" />,
      color: 'bg-indigo-50',
    },
    {
      id: 3,
      title: 'Secure & Trusted',
      description: 'Book with confidence using our industry-standard secure payment systems and data protection.',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      id: 4,
      title: 'Instant E-Tickets',
      description: 'No waiting around. Receive your confirmed flight tickets within minutes of booking.',
      icon: <Zap className="w-8 h-8 text-amber-600" />,
      color: 'bg-amber-50',
    },
  ];

  return (
    <section className="container mx-auto px-4 md:px-10 py-12 md:py-16" aria-labelledby="why-choose-us-heading">
      <div className="text-center mb-12">
        <h2 
          id="why-choose-us-heading" 
          className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
        >
          Why Choose SkyTrips?
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          We make travel simple, affordable, and secure. Here's why thousands of travelers trust us with their journeys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {benefits.map((benefit) => (
          <div 
            key={benefit.id}
            className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-16 h-16 rounded-xl ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              {benefit.icon}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {benefit.title}
            </h3>
            
            <p className="text-slate-500 leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
