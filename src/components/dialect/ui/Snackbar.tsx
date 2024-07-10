// @ts-ignore
import React, { ComponentChildren, h } from 'preact';
import clsx from 'clsx';

type SnackbarVariant = 'warning' | 'error';

interface Props {
  variant?: SnackbarVariant;
  children: ComponentChildren;
}

const variantClasses: Record<SnackbarVariant, string> = {
  error: 'bg-accent-error/10 text-accent-error border-accent-error',
  warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning',
};

export const Snackbar = ({ variant = 'warning', children }: Props) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        'rounded-lg border p-3 text-subtext',
      )}
    >
      {children}
    </div>
  );
};
