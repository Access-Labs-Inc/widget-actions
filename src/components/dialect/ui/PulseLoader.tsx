import { h } from 'preact';
import React from 'react';

import { clsx } from 'clsx';

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
