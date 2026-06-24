import '../app/globals.css';
import type { AppProps } from 'next/app';
import RootLayout from '../app/layout';
import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    amplitude.init(process.env.AMPLITUDE_API_KEY || 'c906e3951666a05d97e9c7a3b46b6364');
  }, []);

  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default MyApp;
