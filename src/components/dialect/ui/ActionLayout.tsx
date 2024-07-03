import { h, Fragment, ComponentChildren } from 'preact';
import * as React from 'preact';

import { Button } from './Button';
import {
  CheckIcon,
  ExclamationShieldIcon,
  InfoShieldIcon,
  LinkIcon,
  SpinnerDots,
} from './icons';
import { ReactNode, useState } from 'react';
import { Badge } from '../ui/Badge';
import { ExtendedActionState } from '../api/ActionsRegistry';

type ActionType = ExtendedActionState;

interface LayoutProps {
  image?: string;
  error?: string | null;
  success?: string | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: ComponentChildren;
  type: ActionType;
  title: string;
  description: string;
  buttons?: ButtonProps[];
  inputs?: InputProps[];
}

export interface ButtonProps {
  text: string | null;
  loading?: boolean;
  variant?: 'default' | 'success' | 'error';
  disabled?: boolean;
  className?: string;
  onClick: (params?: Record<string, string>) => void;
}

export interface InputProps {
  placeholder?: string;
  name: string;
  disabled: boolean;
  button: ButtonProps;
}

const Linkable = ({
  url,
  children,
}: {
  url?: string | null;
  children: ReactNode | ReactNode[];
}) =>
  url ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Fragment>{children}</Fragment>
  );

export const ActionLayout = ({
  buttons,
  inputs,
  error,
  success,
}: LayoutProps) => {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {buttons?.map((it, index) => (
              <div key={index} className="flex-auto">
                <ActionButton {...it} />
              </div>
            ))}
          </div>
        )}
        {inputs?.map((input) => <ActionInput key={input.name} {...input} />)}
      </div>
      {success && (
        <span className="mt-4 flex justify-center text-subtext text-accent-success">
          {success}
        </span>
      )}
      {error && !success && (
        <span className="mt-4 flex justify-center text-subtext text-accent-error">
          {error}
        </span>
      )}
    </div>
  );
};

export const ActionInput = ({
  placeholder,
  name,
  button,
  disabled,
}: InputProps) => {
  const [value, onChange] = useState('');

  return (
    <div className="flex items-center gap-2 rounded-lg border border-input-primary transition-colors focus-within:border-input-checked motion-reduce:transition-none">
      <input
        placeholder={placeholder || 'Type here...'}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent ml-4 flex-1 truncate outline-none placeholder:text-quaternary disabled:bg-primary disabled:text-tertiary"
      />
      <div className="my-1.5 mr-1.5">
        <ActionButton
          {...button}
          onClick={() => button.onClick({ [name]: value })}
          disabled={button.disabled || value === ''}
        />
      </div>
    </div>
  );
};

export const ActionButton = ({
  text,
  loading,
  disabled,
  variant,
  onClick,
  className,
}: ButtonProps) => {
  const ButtonContent = () => {
    if (loading)
      return (
        <span className="flex flex-row items-center justify-center gap-2">
          {text} <SpinnerDots />
        </span>
      );
    if (variant === 'success')
      return (
        <span className="flex flex-row items-center justify-center gap-2 text-accent-success">
          {text}
          <CheckIcon />
        </span>
      );
    return text;
  };

  return (
    <Button
      onClick={() => onClick()}
      disabled={disabled}
      variant={variant}
      className={className}
    >
      <ButtonContent />
    </Button>
  );
};
