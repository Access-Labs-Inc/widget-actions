// @ts-ignore
import React, { h, VNode } from 'preact';
import clsx from 'clsx';

export const Button = ({
  onClick,
  disabled,
  variant,
  children,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'default' | 'error';
  className?: string;
  children: VNode<any>;
}) => {
  return (
    <button
      className={clsx(
        'action-button',
        {
          'action-button-success': variant === 'success',
          'action-button-disabled-not-success':
            disabled && variant !== 'success',
          'action-button-not-disabled-not-success':
            !disabled && variant !== 'success',
        },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
