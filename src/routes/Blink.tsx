// @ts-ignore
import React, { h } from 'preact';
import { useContext } from 'preact/hooks';

import { ConfigContext } from '../AppContext';
import { ActionContainer } from '../components/dialect/ui/ActionContainer';

export const Blink = () => {
  const { poolSlug } = useContext(ConfigContext);
  const actionUrl = `https://actions.dialect.to/api/access-protocol/subscribe/${poolSlug}`;

  return (
    <ActionContainer
      initialApiUrl={actionUrl}
    />
  );
};
