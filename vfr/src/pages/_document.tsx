import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="Skymapper simplifies VFR flight planning with weather, fuel, and navigation tools in one intuitive web app."
        />
        <meta
          name="keywords"
          content="flight planning, VFR, pilot tools, aviation maps, Skymapper"
        />
        <meta name="author" content="Skymapper Team" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Skymapper - Visual Flight Planning Made Simple"
        />
        <meta
          property="og:description"
          content="Plan your VFR routes with interactive maps, real-time weather, and fuel calculations."
        />
        <meta property="og:image" content="https://skymapper.es/og-image.jpg" />
        <meta property="og:url" content="https://skymapper.es" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Skymapper - Visual Flight Planning Made Simple"
        />
        <meta
          name="twitter:description"
          content="All-in-one VFR flight planner with weather, fuel, and waypoints."
        />
        <meta
          name="twitter:image"
          content="https://skymapper.es/og-image.jpg"
        />

        {/* Favicon y Apple Touch Icon */}
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        {/* Schema */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Skymapper",
              "url": "https://skymapper.es",
              "logo": "https://skymapper.es/logo.png"
            }
            `}
        </script>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-2GBJG8M351`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2GBJG8M351');
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
