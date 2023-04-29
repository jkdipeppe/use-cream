import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

const rpcUrl = 'https://api.devnet.solana.com';

const REACT_APP_MAGICLINK_KEY = process.env.REACT_APP_MAGICLINK_KEY;

let magicLink;

if (
  typeof window !== 'undefined' &&
  REACT_APP_MAGICLINK_KEY &&
  REACT_APP_MAGICLINK_KEY !== ''
) {
  console.log(REACT_APP_MAGICLINK_KEY);
  magicLink = new Magic(REACT_APP_MAGICLINK_KEY, {
    extensions: {
      solana: new SolanaExtension({
        rpcUrl,
      }),
    },
  });
} else {
  console.log(REACT_APP_MAGICLINK_KEY);
  console.warn('Magic instance is not available as window is undefined');
}

export { magicLink };
