import { h } from 'preact';

import { clsx } from 'clsx';
import React from 'react';

const PulseLoader: React.FC<{
  children?: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  return (
    <div className={clsx('animate-pulse', className)} style={style}>
      {children}
    </div>
  );
};

export default PulseLoader;
