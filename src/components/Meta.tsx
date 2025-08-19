// src/components/Meta.tsx
import { Helmet } from 'react-helmet-async';

type MetaProps = {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string[];
  jsonLd?: Record<string, any>;
  siteName?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
};

export const Meta = ({ 
  title, 
  description, 
  url, 
  image, 
  keywords, 
  jsonLd, 
  siteName = "Quilltips",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  canonical
}: MetaProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph meta tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={siteName} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card meta tags */}
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
