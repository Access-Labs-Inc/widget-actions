 // @ts-ignore
import React, { h, VNode } from 'preact';
import clsx from 'clsx';

type BadgeVariant = 'warning' | 'error' | 'default';

interface Props {
  variant?: BadgeVariant;
  icon?: VNode;
  children?: string;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  error: 'action-badge-error',
  warning: 'action-badge-warning',
  default: 'action-badge-default'
};

export const Badge = ({
  variant = 'default',
  children,
  className,
  icon,
}: Props) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        'action-badge-wrap',
        className,
        {
          'action-badge-no-children-icon': !children && icon,
          'action-badge-children': children,
        },
      )}
    >
      {children && <span>{children}</span>}
      {icon && <div>{icon}</div>}
    </div>
  );
};
