import React from 'react';
import Head from 'next/head';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  // Generate breadcrumb schema for SEO
  const generateBreadcrumbSchema = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://skytrips.com.au';

    const itemListElement = items.map((item, index) => ({
      '@type': 'ListItem',
      '@id': `#breadcrumb-${index}`,
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': '#breadcrumb-list',
      itemListElement,
    };
  };

  const breadcrumbSchema = generateBreadcrumbSchema();

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>
      <nav aria-label="breadcrumb" id="breadcrumb-list">
        <ol
          style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0 }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              id={`breadcrumb-${idx}`}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  style={{ textDecoration: 'none', color: '#0c0073' }}
                  className="label-l2"
                >
                  {item.label}
                </a>
              ) : (
                <span className="label-l2">{item.label}</span>
              )}
              {idx < items.length - 1 && (
                <span className="label-l2" style={{ margin: '0 8px' }}>
                  /
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
