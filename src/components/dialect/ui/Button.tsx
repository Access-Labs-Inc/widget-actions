import { PropsWithChildren } from 'react';
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
} & PropsWithChildren) => {
  return (
    <button
      className={clsx(
        'flex h-10 w-full flex-row items-center justify-center gap-2 rounded-lg px-6 py-3 text-text font-semibold',
        {
          'bg-accent-success/10 text-accent-success': variant === 'success',
          'bg-button-primary/50 text-inverse':
            disabled && variant !== 'success',
          'cursor-pointer bg-button-primary text-inverse':
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
