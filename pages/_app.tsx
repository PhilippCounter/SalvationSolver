import App from 'next/app'
import type { AppContext, AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { useState } from 'react';

import '../styles/globals.css'
import "../scss/bootstrap.scss";


interface IProps extends AppProps {
  allowedSpecialEndpoints: string|undefined
}

function MyApp({ Component, pageProps: { session, ...pageProps }, allowedSpecialEndpoints }: IProps) {

  const { pathname } = useRouter();

  const [ loading, setLoading ] = useState<boolean>( false );
  const [ toggled, setToggled ] = useState<boolean>( false );

  const handleToggleSidebar = ( state : boolean ) => {
    setToggled(state);
  }

  return <div className="app" style={{ 
    height : '100%',
    width : '100%',
    position: 'fixed',
    display: 'flex'
   }}>
    <Head>
      <title>D2 Salvation Sovler</title>
      <meta name="description" content="Solves the 4th encounter of the Savlation´s Edge" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className={"main-app spacer-mobile"} style={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
          <Component {...pageProps} />
    </main>

  </div>
}

export default MyApp;