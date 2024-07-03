import { h } from 'preact';
import React from 'preact';
import PulseLoader from './PulseLoader';

const ActionLayoutSkeleton = () => {
  return (
    <div className="mt-3 w-full text-center overflow-hidden rounded-2xl bg-primary p-4 shadow-action">
      Loading...
    </div>
  );
};

export default ActionLayoutSkeleton;
