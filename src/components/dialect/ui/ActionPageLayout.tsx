import { h } from 'preact';
import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faPuzzlePiece,
  faScrewdriverWrench,
  faRocketLaunch,
} from '@fortawesome/pro-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import Header from '@/app/header';
import { ClusterTarget } from '@/app/shared/constants';

export enum Brand {
  Dialect,
  Phantom,
  Helius,
}

interface Props {
  className?: string;
  brand?: Brand;
  cluster?: ClusterTarget;
  showClusterChange?: boolean;
}
const ActionPageLayout: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  brand = Brand.Dialect,
  cluster = 'mainnet',
  showClusterChange = false,
}) => {
  return (
    <div className="flex min-h-screen flex-col px-2 py-4 md:px-8">
      <Header brand={brand} cluster={cluster} />
      <main className="flex flex-1 flex-col items-center justify-center">
        <div
          className={clsx(
            'flex w-full max-w-[448px] justify-center',
            className,
          )}
        >
          {children}
        </div>
      </main>
      <footer className="mt-12 flex flex-col-reverse items-center justify-between gap-6 truncate py-2 lg:mt-8 lg:flex-row lg:gap-4">
        <span className="text-subtext font-semibold text-tertiary">
          Made with ♥&#xFE0E; by Dialect Labs, Inc.
        </span>
        <div className="flex flex-col items-center justify-between gap-3 text-text font-semibold text-primary lg:flex-row lg:gap-10">
          {showClusterChange && (
            <Link
              href={cluster === 'devnet' ? '/' : '/devnet'}
              className="flex gap-1.5 transition-colors hover:text-primary/80"
            >
              {cluster === 'devnet' ? (
                <>
                  <FontAwesomeIcon icon={faRocketLaunch} className="h-[18px]" />
                  Use Mainnet
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faScrewdriverWrench}
                    className="h-[18px]"
                  />
                  Use Devnet
                </>
              )}
            </Link>
          )}
          <Link
            href="https://dialect.to"
            target="_blank"
            className="flex gap-1.5 transition-colors hover:text-primary/80"
          >
            <FontAwesomeIcon icon={faCircleInfo} className="h-[18px]" />
            What are Actions & Blinks?
          </Link>
          <Link
            href="https://chromewebstore.google.com/detail/dialect-blinks/mhklkgpihchphohoiopkidjnbhdoilof"
            target="_blank"
            className="flex gap-1.5 transition-colors hover:text-primary/80"
          >
            <FontAwesomeIcon icon={faPuzzlePiece} className="h-[18px]" />
            Try out the extension
          </Link>
          <Link
            href="https://discord.gg/saydialect"
            target="_blank"
            className="flex gap-1.5 transition-colors hover:text-primary/80"
          >
            <FontAwesomeIcon icon={faDiscord} className="h-[18px]" />
            Contact us
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default ActionPageLayout;
