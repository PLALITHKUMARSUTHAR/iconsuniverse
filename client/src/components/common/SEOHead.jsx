import { useEffect } from 'react';

const setMetaTag = (attrName, attrValue, content) => {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setCanonical = (url) => {
  if (!url) return;
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
};

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
}) => {
  useEffect(() => {
    // 1. Title
    const formattedTitle = title
      ? title.includes('IconsUniverse')
        ? title
        : `${title} — IconsUniverse`
      : 'IconsUniverse — 1,000,000 Free Vector Icons & Icon Packs';
    document.title = formattedTitle;

    // 2. Description
    const defaultDesc =
      'Search, live-recolor, and download 1,000,000 vector icons in SVG, PNG, EPS, and Base64 format with Google Drive synchronization.';
    const finalDesc = description || defaultDesc;
    setMetaTag('name', 'description', finalDesc);

    // 3. Keywords
    if (keywords) {
      const kw = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      setMetaTag('name', 'keywords', kw);
    }

    // 4. OpenGraph Tags
    const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://iconsuniverse.com');
    const finalImage = image || '/favicon/og-image.png';

    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:url', finalUrl);
    setMetaTag('property', 'og:type', type);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', finalImage);

    // 6. Canonical Link
    setCanonical(finalUrl);
  }, [title, description, image, url, type, keywords]);

  return null;
};

export default SEOHead;
