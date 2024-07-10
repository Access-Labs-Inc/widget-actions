// @ts-ignore
import React, { h } from 'preact';
import { useEffect, useMemo, useReducer, useState, useContext } from 'preact/compat';
import { Buffer } from 'buffer';
import { ActionLayout, ButtonProps } from './ActionLayout';
import { VersionedTransaction } from '@solana/web3.js';
import { Action, ActionComponent } from '../api/Action';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import ActionLayoutSkeleton from '../ui/ActionLayoutSkeleton';
import { PublicConnection } from '../utils/public-connection';
import { Snackbar } from '../ui/Snackbar';
import { ConfigContext } from '../../../AppContext';
import {
  ActionsRegistry,
  getExtendedActionState,
} from '../api/ActionsRegistry';
import { ClusterTarget } from '../constants';
import { toSpliced } from '../../../libs/utils';

const CONFIRM_TIMEOUT_MS = 60000 * 1.2; // 20% extra time

const confirmTransaction = (
  signature: string,
  cluster: ClusterTarget = 'mainnet',
) => {
  return new Promise<void>((res, rej) => {
    const start = Date.now();

    const confirm = async () => {
      if (Date.now() - start >= CONFIRM_TIMEOUT_MS) {
        rej(new Error('Unable to confirm transaction'));
        return;
      }

      try {
        const status =
          await PublicConnection.getInstance(
            cluster,
          ).connection.getSignatureStatus(signature);

        // if error present, transaction failed
        if (status.value?.err) {
          rej(new Error('Transaction execution failed'));
          return;
        }

        // if has confirmations, transaction is successful
        if (status.value && status.value.confirmations !== null) {
          res();
          return;
        }
      } catch (e) {
        console.error('Error confirming transaction', e);
      }

      setTimeout(confirm, 3000);
    };

    confirm();
  });
};

type ExecutionStatus = 'blocked' | 'idle' | 'executing' | 'success' | 'error';

interface ExecutionState {
  status: ExecutionStatus;
  executingAction?: ActionComponent | null;
  errorMessage?: string | null;
  successMessage?: string | null;
}

enum ExecutionType {
  INITIATE = 'INITIATE',
  FINISH = 'FINISH',
  FAIL = 'FAIL',
  RESET = 'RESET',
  UNBLOCK = 'UNBLOCK',
  BLOCK = 'BLOCK',
}

type ActionValue =
  | {
      type: ExecutionType.INITIATE;
      executingAction: ActionComponent;
      errorMessage?: string;
    }
  | {
      type: ExecutionType.FINISH;
      successMessage?: string | null;
    }
  | {
      type: ExecutionType.FAIL;
      errorMessage: string;
    }
  | {
      type: ExecutionType.RESET;
    }
  | {
      type: ExecutionType.UNBLOCK;
    }
  | {
      type: ExecutionType.BLOCK;
    };

const executionReducer = (
  state: ExecutionState,
  action: ActionValue,
): ExecutionState => {
  switch (action.type) {
    case ExecutionType.INITIATE:
      return { status: 'executing', executingAction: action.executingAction };
    case ExecutionType.FINISH:
      return {
        ...state,
        status: 'success',
        successMessage: action.successMessage,
        errorMessage: null,
      };
    case ExecutionType.FAIL:
      return {
        ...state,
        status: 'error',
        errorMessage: action.errorMessage,
        successMessage: null,
      };
    case ExecutionType.RESET:
      return {
        status: 'idle',
      };
    case ExecutionType.BLOCK:
      return {
        status: 'blocked',
      };
    case ExecutionType.UNBLOCK:
      return {
        status: 'idle',
      };
  }
};

const buttonVariantMap: Record<
  ExecutionStatus,
  'default' | 'error' | 'success'
> = {
  blocked: 'default',
  idle: 'default',
  executing: 'default',
  success: 'success',
  error: 'error',
};

const buttonLabelMap: Record<ExecutionStatus, string | null> = {
  blocked: null,
  idle: null,
  executing: 'Executing',
  success: 'Completed',
  error: 'Failed',
};

const SOFT_LIMIT_BUTTONS = 10;
const SOFT_LIMIT_INPUTS = 3;

export const ActionContainer = ({
  initialApiUrl,
  websiteUrl,
  cluster = 'mainnet',
}: {
  cluster?: ClusterTarget;
  initialApiUrl: string;
  websiteUrl?: string;
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const { element } = useContext(ConfigContext);

  const [action, setAction] = useState<Action | null>(null);
  const [actionState, setActionState] = useState(
    action ? getExtendedActionState(action) : null,
  );

  const [executionState, dispatch] = useReducer(executionReducer, {
    status: actionState !== 'malicious' ? 'idle' : 'blocked',
  });

  console.log("State: ", executionState);

  const website = useMemo(() => {
    // TODO: which label for link to show, us or the website
    if (websiteUrl) {
      const url = new URL(websiteUrl);
      return { text: url.hostname, link: websiteUrl };
    }

    if (action?.url) {
      const url = new URL(action.url);
      return { text: url.hostname, link: null };
    }

    return { text: null, link: null };
  }, [websiteUrl, action?.url]);

  useEffect(() => {
    const init = async () => {
      try {
        await ActionsRegistry.getInstance().init();

        const url = initialApiUrl.startsWith('http')
          ? initialApiUrl
          : `${window.location.origin}${initialApiUrl}`;
        const action = await Action.fetch(url);
        const state = getExtendedActionState(url);

        setAction(action);
        setActionState(state);

        if (state === 'malicious') {
          dispatch({ type: ExecutionType.BLOCK });
        }
      } catch (e) {
        console.error('Failed to init action', e);
        setAction(null);
      }
    };

    init();
  }, [initialApiUrl]);

  console.log("Actions: ", action)

  const buttons = useMemo(
    () =>
      toSpliced(action?.actions
        .filter((it) => !it.parameter)
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true
        ), SOFT_LIMIT_BUTTONS) ?? [],
    [action, executionState.executingAction],
  );

  console.log("Buttons: ", buttons)

  const inputs = useMemo(
    () =>
      toSpliced(action?.actions
        .filter((it) => it.parameter)
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true
        ), SOFT_LIMIT_INPUTS) ?? [],
    [action, executionState.executingAction],
  );

  const disclaimer = useMemo(() => {
    if (actionState === 'malicious' && executionState.status === 'blocked') {
      return (
        <Snackbar variant="error">
          <p>
            This Action has been flagged as an unsafe action, & has been
            blocked. If you believe this action has been blocked in error,
            please{' '}
            <a
              href="#"
              className="cursor-pointer underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              submit an issue
            </a>
            .
          </p>
          <button
            className="mt-3 font-semibold transition-colors hover:text-accent-error-lighter motion-reduce:transition-none"
            onClick={() => dispatch({ type: ExecutionType.UNBLOCK })}
          >
            Ignore warning & proceed
          </button>
        </Snackbar>
      );
    }

    if (actionState === 'unknown') {
      return (
        <Snackbar variant="warning">
          <p>
            This Action has not yet been registered. Only use it if you trust
            the source.
          </p>
          <a
            className="mt-3 inline-block font-semibold transition-colors hover:text-accent-warning-lighter motion-reduce:transition-none"
            href="https://discord.gg/saydialect"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report
          </a>
        </Snackbar>
      );
    }

    return null;
  }, [actionState, executionState.status]);

  if (!action || !actionState) {
    return <ActionLayoutSkeleton />;
  }

  const execute = async (
    component: ActionComponent,
    params?: Record<string, string>,
  ) => {
    if (component.parameter && params) {
      component.setValue(params[component.parameter.name]);
    }

    const newActionState = getExtendedActionState(action);
    // if action state has changed, and it doesn't pass the security check or became malicious, block the action
    if (newActionState !== actionState && newActionState === 'malicious') {
      setActionState(newActionState);
      dispatch({ type: ExecutionType.BLOCK });
      return;
    }

    dispatch({ type: ExecutionType.INITIATE, executingAction: component });

    try {
      if (!publicKey) {
        setWalletModalVisible(true);
        dispatch({ type: ExecutionType.RESET });
        return;
      }

      const tx = await component.post(publicKey.toBase58());

      const result = await sendTransaction(
        VersionedTransaction.deserialize(Buffer.from(tx.transaction, 'base64')),
        PublicConnection.getInstance(cluster).connection,
      )
        .then((signature) => ({ signature, error: null }))
        .catch((e) => ({ signature: null, error: e }));

      if (result.error || !result.signature) {
        dispatch({ type: ExecutionType.RESET });
      } else {
        await confirmTransaction(result.signature, cluster);
        dispatch({
          type: ExecutionType.FINISH,
          successMessage: tx.message,
        });
        const boughtEvent = new CustomEvent('bought', {
          detail: {
            signature: result.signature
          },
          bubbles: true,
          cancelable: true,
          composed: false, // if you want to listen on parent turn this on
        });
        console.log('Bought event: ', boughtEvent);
        element?.dispatchEvent(boughtEvent);
      }
    } catch (e) {
      console.error(e);
      dispatch({
        type: ExecutionType.FAIL,
        errorMessage: (e as Error).message ?? 'Unknown error',
      });
    }
  };

  const asButtonProps = (it: ActionComponent): ButtonProps => ({
    text: buttonLabelMap[executionState.status] ?? it.label,
    loading:
      executionState.status === 'executing' &&
      it === executionState.executingAction,
    disabled: action.disabled || executionState.status !== 'idle',
    variant: buttonVariantMap[executionState.status],
    onClick: (params?: Record<string, string>) => execute(it, params),
  });

  const asInputProps = (it: ActionComponent) => {
    return {
      // since we already filter this, we can safely assume that parameter is not null
      placeholder: it.parameter!.label,
      disabled: action.disabled || executionState.status !== 'idle',
      name: it.parameter!.name,
      button: asButtonProps(it),
    };
  };

  return (
    <ActionLayout
      type={actionState}
      title={action.title}
      description={action.description}
      websiteUrl={website.link}
      websiteText={website.text}
      image={action.icon}
      error={
        executionState.status !== 'success'
          ? executionState.errorMessage ?? action.error
          : null
      }
      success={executionState.successMessage}
      buttons={buttons.map(asButtonProps)}
      inputs={inputs.map(asInputProps)}
      disclaimer={disclaimer}
    />
  );
};
