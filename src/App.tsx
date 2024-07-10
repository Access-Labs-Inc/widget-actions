 // @ts-ignore
import React, { h } from "preact";
import { useMemo } from "preact/hooks";

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TipLinkWalletAdapter } from '@tiplink/wallet-adapter';
import { TipLinkWalletAutoConnect } from '@tiplink/wallet-adapter-react-ui';

import { Configurations } from "./models";
import Main from "./layout/Main";
import { AppContext } from "./AppContext";
import env from "./libs/env";

type Props = Configurations;
export const App = ({ element, ...appSettings }: Props) => {
  const endpoint = env.SOLANA_RPC_URL;
  const searchParams = new URLSearchParams(window.location.search);

  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: 'Access Actions Widget',
        clientId: process.env.NEXT_PUBLIC_TIPLINK_CLIENT_ID!,
        theme: 'system', // pick between "dark"/"light"/"system"
      }),
    ],
    [],
  );

  return (
    <AppContext config={appSettings} element={element}>
      <ConnectionProvider endpoint={endpoint}>
        <TipLinkWalletAutoConnect isReady query={searchParams}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Main />
            </WalletModalProvider>
          </WalletProvider>
        </TipLinkWalletAutoConnect>
      </ConnectionProvider>
    </AppContext>
  );
};
