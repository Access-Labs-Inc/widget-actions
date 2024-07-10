import * as React from 'react';
import { h, Fragment, ComponentChildren, ComponentChild } from 'preact';

import { Button } from './Button';
import {
  CheckIcon,
  ExclamationShieldIcon,
  InfoShieldIcon,
  LinkIcon,
  SpinnerDots,
} from './icons';
import clsx from 'clsx';
import { useState } from 'preact/hooks';
import { Badge } from '../ui/Badge';
import { ExtendedActionState } from '../api/ActionsRegistry';

type ActionType = ExtendedActionState;

export interface FormProps {
  inputs: Array<Omit<InputProps, 'button'>>;
  button: ButtonProps;
}

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
  form?: FormProps;
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
  required?: boolean;
  button?: ButtonProps;
}

const Linkable = ({
  url,
  children,
}: {
  url?: string | null;
  children: ComponentChildren | ComponentChild;
}) =>
  url ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Fragment>{children}</Fragment>
  );

const ActionContent = ({
  form,
  inputs,
  buttons,
}: Pick<LayoutProps, 'form' | 'buttons' | 'inputs'>) => {
  if (form) {
    return <ActionForm form={form} />;
  }

  return (
    <div className="flex flex-col gap-3">
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
  );
};

const ActionForm = ({ form }: Required<Pick<LayoutProps, 'form'>>) => {
  const [values, setValues] = useState(
    Object.fromEntries(form.inputs.map((i) => [i.name, ''])),
  );

  const onChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const disabled = form.inputs.some((i) => i.required && values[i.name] === '');

  return (
    <div className="flex flex-col gap-3">
      {form.inputs.map((input) => (
        <ActionInput
          key={input.name}
          {...input}
          onChange={(v) => onChange(input.name, v)}
        />
      ))}
      <ActionButton
        {...form.button}
        onClick={() => form.button.onClick(values)}
        disabled={form.button.disabled || disabled}
      />
    </div>
  );
};

export const ActionLayout = ({
  title,
  description,
  image,
  websiteUrl,
  websiteText,
  type,
  disclaimer,
  buttons,
  inputs,
  form,
  error,
  success,
}: LayoutProps) => {
  return (
    <div className="w-full max-w-[448px] overflow-hidden rounded-2xl bg-primary p-4 shadow-action">
      {image && (
        <Linkable url={websiteUrl}>
          <img
            className={clsx('w-full object-cover object-left', {
              'aspect-square': !form,
              'aspect-[2/1] rounded-xl': form,
            })}
            src={image}
            alt="action-image"
          />
        </Linkable>
      )}
      <div className="mt-4 flex flex-col">
        <div className="mb-2 flex items-center gap-2">
          {websiteUrl && (
            <div
              // href={websiteUrl}
              // target="_blank"
              className="inline-flex items-center truncate text-subtext text-quaternary transition-colors motion-reduce:transition-none"
              rel="noopener noreferrer"
            >
              <LinkIcon className="mr-2" />
              {websiteText ?? websiteUrl}
            </div>
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
        <ActionContent form={form} inputs={inputs} buttons={buttons} />
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

const ActionInput = ({
  placeholder,
  name,
  button,
  disabled,
  onChange: extOnChange,
  required,
}: InputProps & { onChange?: (value: string) => void }) => {
  const [value, onChange] = useState('');

  const extendedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
    extOnChange?.(e.currentTarget.value);
  };

  const placeholderWithRequired =
    (placeholder || 'Type here...') + (required ? '*' : '');

  return (
    <div className="flex items-center gap-2 rounded-lg border border-input-primary transition-colors focus-within:border-input-checked motion-reduce:transition-none">
      <input
        placeholder={placeholderWithRequired}
        value={value}
        disabled={disabled}
        onChange={extendedChange}
        className="bg-transparent my-3 ml-4 flex-1 truncate outline-none placeholder:text-quaternary disabled:text-tertiary"
      />
      {button && (
        <div className="my-2 mr-2">
          <ActionButton
            {...button}
            onClick={() => button.onClick({ [name]: value })}
            disabled={button.disabled || value === ''}
          />
        </div>
      )}
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
    return <Fragment>text</Fragment>;
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
