import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { GlowWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { AppContext, AppProps as NextAppProps, default as NextApp } from 'next/app';
import { AppInitialProps } from 'next/dist/shared/lib/utils';
import { FC, useMemo } from 'react';
import { DEVNET_ENDPOINT } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SOLIcon } from '../images/SOLIcon';
import css from './App.module.css';
import { Magic } from 'magic-sdk';
import { useState, useEffect } from 'react';
import { SolanaExtension } from "@magic-ext/solana";
import { Spinner } from '@chakra-ui/react'

interface AppProps extends NextAppProps {
    host: string;
    query: {
        recipient?: string;
        label?: string;
        message?: string;
    };
}

const App: FC<AppProps> & { getInitialProps(appContext: AppContext): Promise<AppInitialProps> } = ({
    Component,
    host,
    query,
    pageProps,
}) => {

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const magicKey = process.env.NEXT_PUBLIC_MAGICLINK_KEY

    const baseURL = `https://${host}`;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    let loginWithMagicLink = (email : string) => {};
    let logout = () => {};

    useEffect(() => {
      if(magicKey && rpcUrl) {
      const magicSolana = new Magic(magicKey, {
        extensions: {
          solana: new SolanaExtension({
            rpcUrl,
          }),
        }
      })
      // const magicEthereum = new Magic(process.env.NEXT_PUBLIC_MAGICLINK_KEY);
        
        loginWithMagicLink = async (email: string) => {
          try {
            if (magicSolana.auth) {
            setLoggingIn(true);
            await magicSolana.auth.loginWithMagicLink({ email });
            const metadata = await magicSolana.user.getMetadata();
            if (metadata.email) {
              setUserEmail(metadata.email);
              setIsLoggedIn(true);
              location.href = `https://${host}/new?recipient=${metadata.publicAddress}&label=HackerHouseDemo`
            }
          }
          } catch (error) {
            console.error('Login failed:', error);
          }
          
        };

        let logout = async () => {
          await magicSolana.user.logout();
          setIsLoggedIn(false);
          setUserEmail('');
        };
      }
      
    }, []);


    // If you're testing without a mobile wallet, set this to true to allow a browser wallet to be used.
    const connectWallet = false;
    // If you're testing without a mobile wallet, set this to Devnet or Mainnet to configure some browser wallets.
    const network = WalletAdapterNetwork.Devnet;

    const wallets = useMemo(
      () => (connectWallet ? [
        new GlowWalletAdapter({ network }),
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network })
      ] : []),
      [connectWallet, network]
    );

    // Toggle comments on these lines to use transaction requests instead of transfer requests.
    const link = undefined;
    // const link = useMemo(() => new URL(`${baseURL}/api/`), [baseURL]);

    let recipient: PublicKey | undefined = undefined;
    const { recipient: recipientParam, label, message } = query;
    if (recipientParam && label) {
      try {
        recipient = new PublicKey(recipientParam);
      } catch (error) {
        console.error(error);
      }
    }

    return (
      <ThemeProvider>
        <FullscreenProvider>
          {recipient && label ? (
            <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
              <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                <WalletModalProvider>
                  <ConfigProvider
                    baseURL={baseURL}
                    link={link}
                    recipient={recipient}
                    label={label}
                    message={message}
                    symbol="SOL"
                    icon={<SOLIcon />}
                    decimals={9}
                    minDecimals={1}
                    connectWallet={connectWallet}
                  >
                    <TransactionsProvider>
                      <PaymentProvider>
                        <Component {...pageProps} />
                      </PaymentProvider>
                    </TransactionsProvider>
                  </ConfigProvider>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          ) : (
            <div className={css.logo}>
              {!loggingIn ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const email = (e.target as any).elements.email.value;
                    await loginWithMagicLink(email);
                  }}
                >
                  <label htmlFor="email">Email: </label>
                  <input className={css.input} type="email" id="email" name="email" required />
                  <button 
                    className={css.root}
                    type="submit">
                      Login with Magic Link
                  </button>
                </form>
              ) : (
                <Spinner w={50} h={50} />
              )}
            </div>
          )}
        </FullscreenProvider>
    </ThemeProvider>
  );
};

App.getInitialProps = async (appContext) => {
    const props = await NextApp.getInitialProps(appContext);

    const { query, req } = appContext.ctx;
    const recipient = query.recipient as string;
    const label = query.label as string;
    const message = query.message || undefined;
    const host = req?.headers.host || 'localhost:3001';

    return {
        ...props,
        query: { recipient, label, message },
        host,
    };
};

export default App;
