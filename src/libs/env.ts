import { PublicKey } from '@solana/web3.js';

// Must be written like this othwerwise the webpack will not be able to replace the values!!
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const SOLANA_NETWORK = process.env.SOLANA_NETWORK;
const GO_API_URL = process.env.GO_API_URL;

if (!SOLANA_RPC_URL) {
  throw new Error('SOLANA_RPC_URL must be set!');
}

if (!SOLANA_NETWORK) {
  throw new Error('SOLANA_NETWORK must be set!');
}
if (!GO_API_URL) {
  throw new Error('GO_API_URL must be set!');
}

interface Config {
  SOLANA_RPC_URL: string;
  SOLANA_NETWORK: string;
  GO_API_URL: string;
}

const config: Config = {
  SOLANA_RPC_URL,
  SOLANA_NETWORK,
  GO_API_URL,
};

export default config;
