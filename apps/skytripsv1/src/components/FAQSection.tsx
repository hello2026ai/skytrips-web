import React from 'react';
import { ShieldCheck, Ticket, CalendarClock, DollarSign, Headset, Globe } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      id: 'item-1',
      question: 'Is it safe to book flights on SkyTrips?',
      answer: 'Yes, absolutely. We use industry-standard secure payment gateways and SSL encryption to protect your personal and financial information. We are an accredited travel agency partnering with trusted airlines worldwide to ensure your booking is secure and reliable.',
      icon: <ShieldCheck className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'item-2',
      question: 'Will I receive my ticket immediately after booking?',
      answer: 'In most cases, yes. Once your payment is successfully processed, you will receive an instant booking confirmation via email. Your official e-ticket will typically follow within minutes. For some complex itineraries, it may take up to 24 hours.',
      icon: <Ticket className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'item-3',
      question: 'Can I change or cancel my booking?',
      answer: 'Yes, modifications and cancellations are possible but are subject to the specific airline\'s fare rules and policies. Some promotional fares may be non-refundable. We recommend checking the fare conditions during booking or contacting our support team for assistance.',
      icon: <CalendarClock className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'item-4',
      question: 'Does SkyTrips charge any hidden fees?',
      answer: 'No, we believe in transparent pricing. The price you see at the final checkout step is the price you pay. Any applicable taxes, airline surcharges, and service fees are clearly broken down before you confirm your payment.',
      icon: <DollarSign className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'item-5',
      question: 'What if I need help after booking my flight?',
      answer: 'We offer 24/7 customer support to assist you at any stage of your journey. Whether you need to add baggage, request a special meal, or change your flight, our dedicated team is available via phone, email, and live chat.',
      icon: <Headset className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'item-6',
      question: 'Can I book international flights on SkyTrips?',
      answer: 'Yes! While we specialize in flights to Nepal, we offer extensive coverage for international flights to destinations across Asia, Europe, the Americas, and beyond. You can compare fares from hundreds of airlines for both domestic and international travel.',
      icon: <Globe className="h-5 w-5 text-blue-500" />,
    },
  ];

  return (
    <section className="container mx-auto px-4 md:px-10 py-12 md:py-16 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-lg">
            Find answers to common questions regarding flight booking with SkyTrips.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id} 
              className="border border-slate-200 rounded-xl px-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <AccordionTrigger className="flex items-center py-4 hover:no-underline text-left">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 hidden sm:block">
                    {faq.icon}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-slate-900">
                    {faq.question}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-0 sm:pl-[3.25rem] pb-4">
                <p className="text-slate-600 leading-relaxed text-base">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
