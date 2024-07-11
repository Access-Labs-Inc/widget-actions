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
  title?: string;
  description?: string;
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
    <div className="action-content">
      {buttons && buttons.length > 0 && (
        <div className="action-content-buttons">
          {buttons?.map((it, index) => (
            <div key={index} className="action-content-button-wrapper">
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
    <div className="action-form">
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
    <div className="action-layout">
      {image && (
        <Linkable url={websiteUrl}>
          <img
            className={clsx('action-layout-image-base', {
              'action-layout-image-no-form': !form,
              'action-layout-image-form': form,
            })}
            src={image}
            alt="action-image"
          />
        </Linkable>
      )}
      {(websiteUrl || websiteUrl || title || description || disclaimer) && (
        <div className="action-layout-info">
          <div className="action-layout-external-info">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                className="action-layout-website-link"
                rel="noopener noreferrer"
              >
                <LinkIcon className="action-layout-website-link-icon" />
                {websiteText ?? websiteUrl}
              </a>
            )}
            {websiteText && !websiteUrl && (
              <span className="action-layout-website-text">
                {websiteText}
              </span>
            )}
            {(websiteUrl || websiteUrl) && (
              <a
                href="https://docs.dialect.to/documentation/actions/security"
                target="_blank"
                rel="noopener noreferrer"
                className="action-layout-security-link"
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
            )}
          </div>
          {title && (
            <span className="action-layout-title">
              {title}
            </span>
          )}
          {description && (
            <span className="action-layout-description">
              {description}
            </span>
          )}
          {disclaimer && (
            <div className="action-layout-disclaimer">{disclaimer}</div>
          )}
        </div>
      )}
      <ActionContent form={form} inputs={inputs} buttons={buttons} />
      {success && (
        <span className="action-layout-success">
          {success}
        </span>
      )}
      {error && !success && (
        <span className="action-layout-error">
          {error}
        </span>
      )}
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
    <div className="action-input-wrapper">
      <input
        placeholder={placeholderWithRequired}
        value={value}
        disabled={disabled}
        onChange={extendedChange}
        className="action-input"
      />
      {button && (
        <div className="action-input-button-wrapper">
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
        <span className="action-button-loading">
          {text} <SpinnerDots />
        </span>
      );
    if (variant === 'success')
      return (
        <span className="action-button-success">
          {text}
          <CheckIcon />
        </span>
      );
    return <Fragment>{text}</Fragment>;
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
