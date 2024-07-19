// @ts-ignore
import React, { h } from 'preact';
import { useContext } from 'preact/hooks';

import { ConfigContext } from '../AppContext';
import { ActionContainer } from '../components/dialect/ui/ActionContainer';

export const Blink = () => {
  const {
    poolSlug,
    websiteUrl,
    showDescription,
    showTitle,
    showImage,
    showWebsite
  } = useContext(ConfigContext);
  const actionUrl = `https://access-protocol.dial.to/subscribe/${poolSlug}`;

  return (
    <ActionContainer
      initialApiUrl={actionUrl}
      websiteUrl={websiteUrl ?? undefined}
      showImage={showImage}
      showTitle={showTitle}
      showDescription={showDescription}
      showWebsite={showWebsite}
    />
  );
};
