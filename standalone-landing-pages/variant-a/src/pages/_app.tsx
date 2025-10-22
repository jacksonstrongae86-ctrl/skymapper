import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Skymapper - VFR Flight Planning Made Easy</title>
        <meta name="description" content="Plan your VFR routes in seconds with Skymapper. The easiest way to create flight plans." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#2563eb" />

        {/* Open Graph */}
        <meta property="og:title" content="Skymapper - VFR Flight Planning" />
        <meta property="og:description" content="Plan your VFR routes in seconds" />
        <meta property="og:type" content="website" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
