// SEO.jsx
const SEO = ({ title, description, type, name, image }) => {
  const displayTitle = title ? `Zing Fashion | ${title} ` : "Zing | Fashion";
  return (
    <>
      <title>{displayTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
};

export default SEO;
