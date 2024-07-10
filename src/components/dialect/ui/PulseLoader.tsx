// @ts-ignore
import React, { h, VNode } from 'preact';
import { CSSProperties } from 'preact/compat';

import { clsx } from 'clsx';

type PulseLoaderProps = {
  children?: VNode;
  className: string;
  style?: CSSProperties;
}

const PulseLoader = ({ children, className, style }: PulseLoaderProps) => {
  return (
    <div className={clsx('action-pulse-loader', className)} style={style}>
      {children}
    </div>
  );
};

export default PulseLoader;
