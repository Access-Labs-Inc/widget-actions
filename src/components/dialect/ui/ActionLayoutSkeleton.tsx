import { h } from 'preact';
import React from 'preact';
import PulseLoader from './PulseLoader';

const ActionLayoutSkeleton = () => {
  return (
    <div className="mt-3 w-full overflow-hidden rounded-2xl bg-primary p-4 shadow-action">
      <div className="relative flex w-full pb-[10%]">
        <PulseLoader className="absolute inset-0 aspect-square w-full rounded-lg bg-button-secondary" />
      </div>
    </div>
  );
};

export default ActionLayoutSkeleton;
