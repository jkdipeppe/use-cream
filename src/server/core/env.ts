export const CLUSTER_ENDPOINT = process.env.CLUSTER_ENDPOINT || 'https://api.devnet.solana.com';
export const RATE_LIMIT = Number(process.env.RATE_LIMIT) || undefined;
export const RATE_LIMIT_INTERVAL = Number(process.env.RATE_LIMIT_INTERVAL) || undefined;
export const REACT_APP_MAGICLINK_KEY = process.env.REACT_APP_MAGICLINK_KEY || ''