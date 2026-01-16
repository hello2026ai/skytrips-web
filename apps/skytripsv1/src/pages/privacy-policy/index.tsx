import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { NextSeo } from 'next-seo';

const PrivacyPolicy = () => {
  const policyData = [
    {
      id: 1,
      title: 'No Surprises!',
      description:
        'Just like a clear sky promises a smooth flight, we promise transparency. At Skytrips, what you see is what you get. Every step of your journey with us, from booking that cheap flight to Sydney to planning a Gold Coast adventure, is handled with honesty and clarity.',
    },
    {
      id: 2,
      title: "We'll Keep Your Information Safe ",
      description:
        'Your trust is our treasure. Like a sturdy suitcase locks away your valuables, we safeguard your details. With Skytrips, your information is as secure as if it were in a vault, ensuring your peace of mind on every Skytrip.',
    },
    {
      id: 3,
      title: "You're Always in Control ",
      description:
        "You're the pilot when it comes to your information. Want to update your profile or tweak your communication preferences? It is as easy as changing your seat on a flight to Melbourne. At Skytrips, you have the controls.",
    },
    {
      id: 4,
      title: 'About This Policy ',
      description:
        "This isn't just small print, it's our promise to you. Our Privacy Policy, alongside our Terms of Service, is the compass that guides how we handle your data across all Skytrips services. We keep this policy as current as the latest flight deals.",
    },
    {
      id: 5,
      title: 'Why and How Do We Use Your Data?',
      description:
        "Your data fuels our service, much like a plane needs fuel to fly. We use it to make your skytrips experience seamless, from showing you the cheapest flights to Brisbane to personalizing your journey. It's all about enhancing your travel, never for anything unnecessary.",
    },
    {
      id: 6,
      title: 'What Personal Data Do We Collect?',
      description:
        "Think of us as your travel packers, only taking what's essential. We collect bits of information like your booking history and preferences, nothing more. It's all to make sure your skytrips are as personalized as your travel itinerary.",
    },
    {
      id: 7,
      title: 'How Long Do We Store Your Data? ',
      description:
        "Just like a connecting flight, sometimes we need a partner to reach the final destination. Your info is shared only when you nod 'yes' or when it's essential for your skytrip, like booking that flight to Cairns with an airline. Rest assured, they follow their own strict privacy rules.",
    },
    {
      id: 8,
      title:
        'When Is Your Information Shared With or Collected by Third Parties? ',
      description:
        "Just like a connecting flight, sometimes we need a partner to reach the final destination. Your info is shared only when you nod 'yes' or when it's essential for your skytrip, like booking that flight to Cairns with an airline. Rest assured, they follow their own strict privacy rules.",
    },
    {
      id: 9,
      title: 'How Do We Keep Your Personal Data Secure? ',
      description:
        "Your data's safety is our top priority. We employ top-notch security. Think of it as the most advanced travel lock safeguarding your details from any unwelcome intruders. Travel worry-free with Skytrips.",
    },
    {
      id: 10,
      title: 'Where Do We Store Your Information?',
      description:
        'Your data is stored in high-security data centres. Imagine these as ultra-secure luggage facilities spanning across the globe, ensuring your info is safely tucked away, no matter where your trip takes you.',
    },
    {
      id: 11,
      title: 'How Is Your Information Used for Advertising? ',
      description:
        "We use your info to make sure you're not just seeing ads but opportunities that genuinely interest you. Think of it as a travel brochure, customized just for you, highlighting the best cheap flights to Melbourne or Perth hotel deals.",
    },
    {
      id: 12,
      title: 'Do We Use Cookies or Similar Technologies? ',
      description:
        'Yes, we use cookies, not the snack, but digital ones. They help make your Skytrips experience smoother, like a first-class upgrade for your online journey with us.',
    },
    {
      id: 13,
      title: 'What Are Your Choices and Rights? ',
      description:
        "Remember, you're in the captain's seat. You can view, edit, or delete your info with us at any time. It's your journey, your rules. Need to change something? Just let us know.",
    },
    {
      id: 14,
      title: 'Who Are We, and How Can You Contact Us?  ',
      description:
        "Skytrips is your friendly travel companion, here to make your travel dreams come true. Do you have questions or need to chat about your next trip? Contact us anytime, we're here to help, just a call or click away.",
    },
  ];

  // Structured data for privacy policy page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description:
      'SkyTrips Privacy Policy - Learn how we protect your personal information and data.',
    url: 'https://skytrips.com.au/privacy-policy',
    mainEntity: {
      '@type': 'PrivacyPolicy',
      name: 'SkyTrips Privacy Policy',
      publisher: {
        '@type': 'Organization',
        name: 'SkyTrips',
        url: 'https://skytrips.com.au',
      },
    },
  };
  return (
    <>
      <NextSeo
        title="Skytrips Privacy Policy – Protecting Your Data When Booking"
        description="Read Skytrips’ Privacy Policy to understand how we safeguard your personal information while booking the cheapest flights. Your privacy is our priority."
        canonical="https://skytrips.com.au/privacy-policy"
        openGraph={{
          url: 'https://skytrips.com.au/privacy-policy',
          title: 'Skytrips Privacy Policy – Protecting Your Data When Booking',
          description:
            'Read Skytrips’ Privacy Policy to understand how we safeguard your personal information while booking the cheapest flights. Your privacy is our priority.',
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
      <div className="max-w-6xl mx-auto my-10 px-4">
        <h3 className="text-4xl text-primary text-center mb-10 font-bold pb-4 border-b border-gray-200">
          Privacy Policy
        </h3>

        <div className="bg-white rounded-lg shadow-md p-8">
          {policyData &&
            policyData.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`mb-6 pb-6 ${
                    index < policyData.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <h6 className="text-xl text-primary mb-3 font-semibold">
                    {item.title}
                  </h6>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
