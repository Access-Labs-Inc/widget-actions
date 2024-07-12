// @ts-ignore
import React, { h } from 'preact';
import { useEffect, useMemo, useReducer, useState, useContext } from 'preact/compat';
import { Buffer } from 'buffer';
import { ActionLayout, ButtonProps } from './ActionLayout';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { Action, ActionComponent } from '../api/Action';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import ActionLayoutSkeleton from '../ui/ActionLayoutSkeleton';
import { Snackbar } from '../ui/Snackbar';
import { ConfigContext } from '../../../AppContext';
import {
  ActionsRegistry,
  getExtendedActionState,
} from '../api/ActionsRegistry';
import { ClusterTarget } from '../constants';
import { isTimeoutError, timeout, toSpliced } from '../../../libs/utils';
import { sleep } from '@accessprotocol/js';

const CONFIRM_TIMEOUT_MS = 60000 * 1.2; // 20% extra time
const CONFIRM_STATUS = "confirmed";

const confirmTransaction = async (
  signature: string,
  connection: Connection
) => {
  for (let i=0; i<90; i+=1) {
    try {
      const status = await timeout(
        connection.getSignatureStatus(signature, {
          searchTransactionHistory: true
        }),
        CONFIRM_TIMEOUT_MS,
        "Timing out waiting for signature"
      );

      if (isTimeoutError(status)) {
        console.log(`Confirming signature ${signature} attemp ${i} ~ 1s sleep`);
        await sleep(1000);
      } else if (status.value?.err) {
        throw new Error('Transaction execution failed');
      } else {
        const statusValue = status.value?.confirmationStatus;
        if (statusValue === CONFIRM_STATUS || statusValue === "finalized") {
          return;
        }
      }
    } catch (e) {
      if (isTimeoutError(e)) {
        console.log(`Confirming signature ${signature} attemp ${i} ~ 1s sleep`);
        await sleep(1000);
      } else {
        console.error('Error confirming transaction', e);
        throw e;
      }
    }
  }
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
  showImage,
  showTitle,
  showDescription,
  showWebsite,
}: {
  initialApiUrl: string;
  websiteUrl?: string;
  showImage: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showWebsite: boolean;
  cluster?: ClusterTarget;
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const { element } = useContext(ConfigContext);
  const { connection } = useConnection();

  const [action, setAction] = useState<Action | null>(null);
  const [actionState, setActionState] = useState(
    action ? getExtendedActionState(action) : null,
  );

  const [executionState, dispatch] = useReducer(executionReducer, {
    status: actionState !== 'malicious' ? 'idle' : 'blocked',
  });

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
              className="action-container-unsafe-submit-issue-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              submit an issue
            </a>
            .
          </p>
          <button
            className="action-container-unsafe-ignore-button"
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
            className="action-container-unknown-report-link"
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
    connection: Connection,
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
        connection,
      )
        .then((signature) => ({ signature, error: null }))
        .catch((e) => ({ signature: null, error: e }));

      if (result.error || !result.signature) {
        dispatch({ type: ExecutionType.RESET });
      } else {
        await confirmTransaction(result.signature, connection);
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

  const asButtonProps = (connection: Connection) =>
    (it: ActionComponent): ButtonProps => ({
      text: buttonLabelMap[executionState.status] ?? it.label,
      loading:
        executionState.status === 'executing' &&
        it === executionState.executingAction,
      disabled: action.disabled || executionState.status !== 'idle',
      variant: buttonVariantMap[executionState.status],
      onClick: (params?: Record<string, string>) => execute(it, connection, params),
    });

  const asInputProps = (connection: Connection) =>
    (it: ActionComponent) => {
      return {
        // since we already filter this, we can safely assume that parameter is not null
        placeholder: it.parameter!.label,
        disabled: action.disabled || executionState.status !== 'idle',
        name: it.parameter!.name,
        button: asButtonProps(connection)(it),
      };
    };

  return (
    <ActionLayout
      type={actionState}
      title={showTitle ? action.title : undefined}
      description={showDescription ? action.description : undefined}
      websiteUrl={showWebsite ? website.link : undefined}
      websiteText={showWebsite ? website.text : undefined}
      image={showImage ? action.icon : undefined}
      error={
        executionState.status !== 'success'
          ? executionState.errorMessage ?? action.error
          : null
      }
      success={executionState.successMessage}
      buttons={buttons.map(asButtonProps(connection))}
      inputs={inputs.map(asInputProps(connection))}
      disclaimer={disclaimer}
    />
  );
};
