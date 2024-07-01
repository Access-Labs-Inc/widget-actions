import { clusterApiUrl, Connection } from '@solana/web3.js';

const environment =
  process.env.NEXT_PUBLIC_DIALECT_ENVIRONMENT || 'development';

const rpcUrl =
  environment === 'production'
    ? process.env.RPC_URL || clusterApiUrl('mainnet-beta')
    : process.env.RPC_URL || clusterApiUrl('devnet');

export const connection = new Connection(rpcUrl);
