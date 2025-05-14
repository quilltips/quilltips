// src/components/Meta.tsx
import { Helmet } from 'react-helmet-async';

type MetaProps = {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  jsonLd?: Record<string, any>; 
};

export const Meta = ({ title, description, url, image, jsonLd }: MetaProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

         {/* 👇 Inject JSON-LD directly into the head */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
