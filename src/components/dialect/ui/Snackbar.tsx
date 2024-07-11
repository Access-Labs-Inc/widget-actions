// @ts-ignore
import React, { ComponentChildren, h } from 'preact';
import clsx from 'clsx';

type SnackbarVariant = 'warning' | 'error';

interface Props {
  variant?: SnackbarVariant;
  children: ComponentChildren;
}

const variantClasses: Record<SnackbarVariant, string> = {
  error: 'action-snackbar-error',
  warning: 'action-snackbar-warning'
};

export const Snackbar = ({ variant = 'warning', children }: Props) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        'action-snackbar-default',
      )}
    >
      {children}
    </div>
  );
};
