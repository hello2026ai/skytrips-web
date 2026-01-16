import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Head from 'next/head';

interface FaqItem {
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

interface FAQProps {
  faqData?: FaqItem[];
}

const FAQ: React.FC<FAQProps> = ({ faqData: propFaqData }) => {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const faqData = propFaqData || [];

  // Generate FAQ schema for SEO
  const faqSchema =
    faqData.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqData.map((faq, index) => ({
            '@type': 'Question',
            '@id': `#faq-${index}`,
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  // Don't render if no FAQ data
  if (!faqData || faqData.length === 0) {
    return null;
  }

  return (
    <>
      {faqSchema && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </Head>
      )}
      <div className="pb-16 bg-container to-white mt-6 rounded-lg shadow-sm mb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 pt-8">
            <h2 className="h3 text-background-on">
              Frequently Asked Questions
            </h2>
          </div>

          <div
            className={`mx-auto ${
              faqData.length > 3 ? 'max-w-6xl' : 'max-w-3xl'
            }`}
          >
            <Accordion
              type="single"
              collapsible
              className={`space-y-2`}
              onValueChange={(value) => setOpenItem(value)}
            >
              {faqData.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  id={`faq-${index}`}
                  className="bg-container rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-gray-200 transition-all duration-200"
                >
                  <AccordionTrigger className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50/50 transition-colors duration-150">
                    <div className="flex items-center gap-4">
                      {faq.icon && (
                        <div className="bg-gray-50 p-0 rounded-xl">
                          {faq.icon}
                        </div>
                      )}
                      <span className="title-t3 text-background-on">
                        {faq.question}
                      </span>
                    </div>
                    {openItem === `item-${index}` ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className=" ">
                      <p className="text-neutral-dark label-l1">{faq.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
