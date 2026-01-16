import { AppProps } from 'next/app';
import Head from 'next/head';
import '../../styles/globals.scss';
import { Toaster } from 'sonner';
import { client } from 'apps/skytripsv1/lib/graphqlConfig';
import { ApolloProvider } from '@apollo/client';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png?v=1" />
        <link rel="shortcut icon" href="/favicon.png?v=1" type="image/x-icon" />
      </Head>
      <main className="app">
        <ApolloProvider client={client}>
          <Toaster position="top-right" richColors />
          <Component {...pageProps} />
        </ApolloProvider>
      </main>
    </>
  );
}

export default CustomApp;
