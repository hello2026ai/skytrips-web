import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import { CONTACT_US } from 'libs/src/shared-graphqlQueries/contactUs.js';
import { toast } from 'sonner';
import { NextSeo } from 'next-seo';
import { getCompanyInfo } from '../../utils/companyService';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Send,
  HelpCircle,
  FileText,
  Briefcase
} from 'lucide-react';

const DEFAULT_CONTACTS = {
  Australia: {
    phone: '+61 420 678 910',
    email: 'info@skytrips.com.au',
    address: '42 Rainbows Way, Leppington, NSW 2179, Australia',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.056029873088!2d150.8249877762688!3d-33.88817741996767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b1297f6f264660b%3A0x6b8764835634522!2s42%20Rainbows%20Way%2C%20Leppington%20NSW%202179!5e0!3m2!1sen!2sau!4v1709600000000!5m2!1sen!2sau'
  }
};

const Contact: React.FC = () => {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: 'Booking Inquiry',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [func, { loading }] = useMutation(CONTACT_US, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      setIsContactsLoading(true);
      const { data, error } = await getCompanyInfo('Skytrips');
      
      if (data) {
        setContacts(prev => ({
          ...prev,
          Australia: {
            ...prev.Australia,
            email: data.email,
            phone: data.phone_number
          }
        }));
      } else if (error) {
        if (error.message.includes('does not exist')) {
          console.warn(`[Supabase Setup Required] ${error.message}`);
        } else {
          console.error('Failed to fetch contact info:', error);
        }
        // We silently fail to default contacts
      }
      setIsContactsLoading(false);
    };

    fetchContactInfo();
  }, []);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.fullName) errs.fullName = 'Full Name is required';
    if (!form.email) errs.email = 'Email Address is required';
    if (!form.message) errs.message = 'Message is required';
    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      try {
        // Split name for backend compatibility
        const nameParts = form.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
        
        // Prepend subject to message
        const finalMessage = `Subject: ${form.subject}\n\n${form.message}`;

        await func({
          variables: {
            email: form.email,
            firstName: firstName,
            lastName: lastName,
            message: finalMessage,
            countryCode: '+61', // Default to AU
            phone: '', // Optional in schema, omitted in UI to match mockup
          },
        });
        toast.success('Your message has been sent!');
        setForm({
          fullName: '',
          email: '',
          subject: 'Booking Inquiry',
          message: '',
        });
      } catch (err) {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact SkyTrips',
    description: 'Contact SkyTrips for flight booking assistance and travel inquiries.',
    url: 'https://skytrips.com.au/contact-us',
    mainEntity: {
      '@type': 'TravelAgency',
      name: 'SkyTrips',
      url: 'https://skytrips.com.au',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: contacts.Australia.phone,
        contactType: 'Customer Service',
        email: contacts.Australia.email,
        areaServed: 'Australia',
        availableLanguage: 'English',
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

  return (
    <>
      <NextSeo
        title="Contact SkyTrips | 24/7 Travel Support"
        description="Get in touch with SkyTrips for expert travel advice, booking inquiries, and support. We are here to help your journey."
        canonical="https://skytrips.com.au/contact-us"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Navbar />
      
      <main className="bg-gray-50 min-h-screen font-sans">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/assets/images/contact/support-hero.jpg" // Assuming this path or using a placeholder
              alt="Customer Support"
              fill
              className="object-cover"
              priority
            />
            {/* Fallback color if image missing */}
            <div className="absolute inset-0 bg-slate-900/60" /> 
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-white z-10">
            <span className="bg-blue-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              24/7 Support Available
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
              We're Here to Help Your Journey
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
              Have questions about your booking or need expert travel advice? Our dedicated team is just a message away.
            </p>
            <button className="bg-white text-slate-900 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-colors">
              View Help Center FAQs
            </button>
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-16 relative z-20">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Call Us */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-start hover:shadow-xl transition-shadow">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-500 text-sm mb-4">
                Our phone lines are open 24/7 for urgent travel assistance.
              </p>
              {isContactsLoading ? (
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <a href={`tel:${contacts.Australia.phone.replace(/\s/g, '')}`} className="text-blue-600 font-semibold hover:underline">
                  {contacts.Australia.phone}
                </a>
              )}
            </div>

            {/* Email Us */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-start hover:shadow-xl transition-shadow">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-500 text-sm mb-4">
                Email our support desk for general inquiries or booking updates.
              </p>
              {isContactsLoading ? (
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <a href={`mailto:${contacts.Australia.email}`} className="text-blue-600 font-semibold hover:underline">
                  {contacts.Australia.email}
                </a>
              )}
            </div>

            {/* WhatsApp */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-start hover:shadow-xl transition-shadow">
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-500 text-sm mb-4">
                Chat with our agents instantly for quick support.
              </p>
              <a href="https://wa.me/61420678910" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
                Chat with us now
              </a>
            </div>
          </div>

          {/* Main Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                      value={form.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="Booking Inquiry">Booking Inquiry</option>
                      <option value="Flight Cancellation">Flight Cancellation</option>
                      <option value="Change Date">Change Date</option>
                      <option value="General Support">General Support</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none`}
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Socials */}
            <div className="space-y-6">
              {/* Map Card */}
              <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px] relative group">
                {/* Dark Map Overlay */}
                <iframe 
                  src={contacts.Australia.mapUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                ></iframe>
                
                {/* Pin Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg shadow-blue-500/50 animate-bounce">
                    <MapPin size={24} fill="currentColor" />
                  </div>
                  <div className="mt-2 bg-white py-1 px-3 rounded-md shadow-md text-xs font-bold text-slate-900">
                    SkyTrips HQ
                  </div>
                </div>
              </div>

              {/* Social Connect Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Connect with Us</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Stay updated with the latest travel trends and exclusive offers.
                </p>
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-50' },
                    { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' }
                  ].map((social, idx) => (
                    <a 
                      key={idx}
                      href="#" 
                      className={`${social.bg} ${social.color} w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform`}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Help Section */}
        <section className="bg-blue-50 py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Need immediate answers?</h2>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
              Explore our frequently asked questions for quick guides on booking, cancellation, and baggage policies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white hover:bg-white/80 text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-sm border border-blue-100 transition-all flex items-center gap-2">
                <FileText size={18} /> Booking Guide
              </button>
              <button className="bg-white hover:bg-white/80 text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-sm border border-blue-100 transition-all flex items-center gap-2">
                <HelpCircle size={18} /> Cancellation Policy
              </button>
              <button className="bg-white hover:bg-white/80 text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-sm border border-blue-100 transition-all flex items-center gap-2">
                <Briefcase size={18} /> Baggage Rules
              </button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default Contact;
