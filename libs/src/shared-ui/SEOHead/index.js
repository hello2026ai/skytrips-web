import Head from "next/head";
import React from "react";

const SEOHead = ({ title, description, keywords }) => {
  return (
    <Head>
      {/* Title */}
      <title>{title}</title>

      {/* Meta tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Other SEO-related meta tags */}
      {/* ... */}
    </Head>
  );
};

export default SEOHead;
