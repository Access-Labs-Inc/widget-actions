import { h, Fragment } from 'preact';

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
  disclaimer?: ReactNode;
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
  type,
  title,
  description,
  image,
  websiteUrl,
  websiteText,
  buttons,
  inputs,
  error,
  success,
  disclaimer,
}: LayoutProps) => {
  return (
    <div className="mt-3 w-full overflow-hidden rounded-2xl bg-primary p-4 shadow-action">
      {image && (
        <div className="relative flex w-full pb-[100%]">
          <Linkable url={websiteUrl}>
            <img
              className="absolute inset-0 aspect-square w-full rounded-lg object-cover object-left"
              src={image}
              alt="action-image"
            />
          </Linkable>
        </div>
      )}
      <div className="mt-4 flex flex-col">
        <div className="mb-2 flex items-center gap-2">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              className="inline-flex items-center truncate text-subtext text-quaternary transition-colors hover:cursor-pointer hover:text-[#949CA4] hover:underline motion-reduce:transition-none"
              rel="noopener noreferrer"
            >
              <LinkIcon className="mr-2" />
              {websiteText ?? websiteUrl}
            </a>
          )}
          {websiteText && !websiteUrl && (
            <span className="inline-flex items-center truncate text-subtext text-quaternary">
              {websiteText}
            </span>
          )}
          <a
            href="https://docs.dialect.to/documentation/actions/security"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            {type === 'malicious' && (
              <Badge
                variant="error"
                icon={<ExclamationShieldIcon width={13} height={13} />}
              >
                Blocked
              </Badge>
            )}
            {type === 'trusted' && (
              <Badge
                variant="default"
                icon={<InfoShieldIcon width={13} height={13} />}
              />
            )}
            {type === 'unknown' && (
              <Badge
                variant="warning"
                icon={<InfoShieldIcon width={13} height={13} />}
              />
            )}
          </a>
        </div>
        <span className="mb-0.5 text-text font-semibold text-primary">
          {title}
        </span>
        <span className="mb-4 text-subtext text-secondary">{description}</span>
        {disclaimer && <div className="mb-4">{disclaimer}</div>}
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
