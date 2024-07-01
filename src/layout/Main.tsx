import { h } from 'preact';
import {
  useContext,
  useEffect,
  useMemo,
} from 'preact/hooks';
import { Router, RouteComponent } from '../layout/Router';
import { Blink } from '../routes/Blink';
import { WalletConnectButton } from '../components/wallet-adapter/ui/WalletConnectButton';
import { WalletModalButton } from '../components/wallet-adapter/ui/WalletModalButton';
import { useWallet } from '../components/wallet-adapter/useWallet';
import { ConfigContext } from '../AppContext';
import env from '../libs/env';
import { clsxp } from '../libs/utils';
import { offchainBasicSubscriptionsSchema } from '../validations/subscriptions';

const Main = () => {
  const { publicKey, wallet, connected } = useWallet();
  const {
    element,
    poolId,
    classPrefix,
  } = useContext(ConfigContext);
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  useEffect(() => {
    if (connected && element && publicKey && poolId) {
      (async () => {
        const response = await fetch(`${env.GO_API_URL}/subscriptions/${publicKey.toBase58()}`);
        if (!response.ok) {
          console.log('ERROR: ', response.statusText);
          return;
        }

        const json = await response.json();
        const data = offchainBasicSubscriptionsSchema.parse(json);

        const { staked, bonds, forever } = data.reduce((acc, item) => {
          if (item.pool === poolId) {
            return {
              staked: acc.staked + (item?.locked ?? 0),
              bonds: acc.bonds + (item?.bonds ?? 0),
              forever: acc.forever + (item?.forever ?? 0),
            };
          } else {
            return acc;
          }
        }, {
          staked: 0,
          bonds: 0,
          forever: 0
        });

        const connectedEvent = new CustomEvent('connected', {
          detail: {
            address: base58,
            locked: staked + bonds + forever,
            staked,
            bonds,
            forever
          },
          bubbles: true,
          cancelable: true,
          composed: false, // if you want to listen on parent turn this on
        });
        console.log('Connected event: ', connectedEvent);
        element.dispatchEvent(connectedEvent);
      })();
    }
  }, [connected, element]);

  if (!wallet) {
    return (
      <div className={clsxp(classPrefix, 'wallet_adapter_dropdown_wrapper')}>
        <WalletModalButton />
      </div>
    );
  }
  if (!base58) {
    return (
      <div className={clsxp(classPrefix, 'wallet_adapter_dropdown_wrapper')}>
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <Router
      routes={{
        '/': <RouteComponent component={Blink} />,
      }}
    />
  );
};

export default Main;
