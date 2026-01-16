import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { NextSeo } from 'next-seo';

const Terms = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#cancellation-change' || hash === '#re-issue-policy') {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-yellow-100');
          setTimeout(() => {
            el.classList.remove('bg-yellow-100');
          }, 2000);
        }
      }
    }
  }, []);
  const termsData = [
    {
      id: 1,
      title: 'Introduction',
      description:
        'Welcome to Sky Trips, owned by A2 Link Travels and Tours. By using our services, you agree to these terms and conditions.',
    },
    {
      id: 2,
      title: 'User Responsibilities',
      description:
        'You must provide accurate information and comply with all applicable laws and regulations.',
    },
    {
      id: 3,
      title: 'Booking and Payments',
      description:
        'Bookings are confirmed upon full payment. Accepted payment methods include credit cards.Your data, including travel and card details, is safe with us.',
    },
    {
      id: 4,
      title: 'Cancellation Policy',
      description:
        "To cancel your booking, please contact our support team. Cancellations are only permitted if allowed by the airline or travel provider's fare rules, which are provided at the time of booking. The travel provider may charge a cancellation fee, and if applicable, Skytrips may also apply an administrative fee, which will be clearly communicated before we proceed. Always review fare rules carefully before booking. <br />For Australia: Call +61 240720886 or email info@skytrips.com.au <br />For Nepal: Call 9860286729 or email info@skytrips.com.np",
    },
    {
      id: 5,
      title: 'Re-Issue Policy',
      description:
        "Skytrips allows ticket re-issuance in line with airline fare rules, subject to availability and fare differences. A service fee of AUD $25 per ticket applies. Requests must be made at least 48 hours before departure by emailing support@skytrips.com.au with your booking reference and new travel dates. Some promotional fares may be non-changeable. All changes follow the airline's policies and may vary.  <br />For Australia: Call +61 240720886 or email info@skytrips.com.au <br />For Nepal: Call 9860286729 or email info@skytrips.com.np",
    },
    {
      id: 6,
      title: 'Travel Provider Rules',
      description:
        'You must adhere to the specific rules and restrictions of the airlines and other travel providers.',
    },
    {
      id: 7,
      title: 'Liability and Disclaimers',
      description:
        'Sky Trips is not liable for any loss, injury, or damage incurred during travel. Users acknowledge and accept travel risks.',
    },
    {
      id: 8,
      title: 'Dispute Resolution',
      description:
        'Disputes will be resolved through arbitration in accordance with relevant laws.',
    },
    {
      id: 9,
      title: 'Fees Charged by Banks',
      description:
        'Some banks and card issuers impose fees for international or cross-border transactions and currency conversion. For questions about these fees or the exchange rate applied, please contact your bank or card issuer. Sky Trips is not responsible for any fees related to varying exchange rates and card issuer fees.',
    },
    {
      id: 10,
      title: 'Currency Conversion',
      description:
        'Currency conversion rates displayed on our Service are based on public sources and current exchange rates, which may vary. These rates are provided for informational purposes only and are not guaranteed for accuracy by Sky Trips.',
    },
    {
      id: 11,
      title: 'Amendments',
      description:
        'We reserve the right to amend these terms at any time. Changes will be communicated via the website.',
    },
    {
      id: 12,
      title: 'Refund',
      description:
        'Any refunds will be transferred back to the payment method used for the original booking. Refunds will be processed by the party that took your original payment. Our fees are not refundable unless stated otherwise during the booking process.',
    },
    {
      id: 13,
      title: 'Contact Information',
      description:
        'For support and inquiries, contact us at: </br></br><b>A2link Business House Pty LTD</br>T/A Skytrips</b><p>42 Rainbows Way,</br>Leppington NSW 2179, Australia</br>Email: info@skytrips.com.au</p>',
    },
  ];
  // Structured data for terms and conditions page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms and Conditions',
    description:
      'SkyTrips Terms and Conditions - Understand our booking policies and service guidelines.',
    url: 'https://skytrips.com.au/terms-and-conditions',
    mainEntity: {
      '@type': 'TermsOfService',
      name: 'SkyTrips Terms and Conditions',
      publisher: {
        '@type': 'Organization',
        name: 'SkyTrips',
        legalName: 'A2link Business House Pty Ltd',
        url: 'https://skytrips.com.au',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+61-240720886',
          email: 'info@skytrips.com.au',
          contactType: 'Customer Service',
        },
      },
    },
  };

  return (
    <>
      <NextSeo
        title="Skytrips Terms – Your Guide to Booking Cheap Flights"
        description="Explore Skytrips' Terms and Conditions for a clear understanding of our services, booking process, and how we ensure the best deals on the cheapest flights."
        canonical="https://skytrips.com.au/terms-and-conditions"
        openGraph={{
          url: 'https://skytrips.com.au/terms-and-conditions',
          title: 'Skytrips Terms – Your Guide to Booking Cheap Flights',
          description:
            "Explore Skytrips' Terms and Conditions for a clear understanding of our services, booking process, and how we ensure the best deals on the cheapest flights.",
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
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">
          Terms and Conditions
        </h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          {termsData &&
            termsData.slice(0, 5).map((item, index) => {
              const headingId =
                item.title === 'Cancellation Policy'
                  ? 'cancellation-change'
                  : item.title === 'Re-Issue Policy'
                  ? 're-issue-policy'
                  : undefined;
              return (
                <div key={index} className="mb-6">
                  <h2
                    className="text-xl font-semibold text-primary mb-2"
                    id={headingId}
                  >
                    {item.id}. {item.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {item.description.split('<br />').map((part, idx) =>
                      idx === 0 ? (
                        part
                      ) : (
                        <React.Fragment key={idx}>
                          <br />
                          <b>{part.trim()}</b>
                        </React.Fragment>
                      )
                    )}
                  </p>
                </div>
              );
            })}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Other Cancellations or Changes
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We (and the relevant Travel Provider) may cancel your booking if
            full payment or any applicable charges are not received when due. In
            some cases (e.g., overbooking, property closure), your booking may
            be cancelled or changed. We will notify you as soon as possible and
            offer alternatives or refunds where applicable.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {termsData &&
            termsData.slice(4, 12).map((item, index) => {
              return (
                <div key={index} className="mb-6 last:mb-0">
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    {item.id}. {item.title}
                  </h2>
                  {isClient ? (
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
