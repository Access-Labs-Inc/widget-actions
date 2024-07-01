import { h } from 'preact';
import React from 'preact';
import PulseLoader from './PulseLoader';

const ActionLayoutSkeleton = () => {
  return (
    <div className="mt-3 w-full overflow-hidden rounded-2xl bg-primary p-4 shadow-action">
      <div className="relative flex w-full pb-[100%]">
        <PulseLoader className="absolute inset-0 aspect-square w-full rounded-lg bg-button-secondary" />
      </div>
      <div className="mt-4 flex flex-col">
        <PulseLoader className="mb-1.5 h-5 w-24 rounded-xl bg-button-secondary" />
        <PulseLoader className="mb-1 h-4 w-full rounded-xl bg-button-secondary" />
        <PulseLoader className="mb-4 h-4 w-1/2 rounded-xl bg-button-secondary" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <PulseLoader className="flex h-10 flex-1 rounded-xl bg-button-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionLayoutSkeleton;
