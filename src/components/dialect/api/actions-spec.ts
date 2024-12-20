import {
  SolanaPaySpecGetResponse,
  SolanaPaySpecPostRequestBody,
  SolanaPaySpecPostResponse,
} from '../api/solana-pay-spec';

export interface ActionsSpecGetResponse extends SolanaPaySpecGetResponse {
  icon: string; // image
  label: string; // button text
  title: string;
  description: string;
  disabled?: boolean; // allows to model invalid state of the action e.g. nft sold out
  links?: {
    // linked actions inspired by HAL https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-11
    actions: LinkedAction[];
  };
  // optional error indication for non-fatal errors, if present client should display it to the user
  // doesn't prevent client from interpreting the action or displaying it to the user
  // e.g. can be used together with 'disabled' to display the reason e.g. business constraint failure
  error?: ActionError;
}

export interface ActionsSpecPostResponse extends SolanaPaySpecPostResponse {}

// Linked action inspired by HAL https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-11
export interface LinkedAction {
  href: string; // solana pay/actions get/post url
  label: string; // button text
  // optional parameters for the action, e.g. input fields, inspired by OpenAPI
  // enforcing single parameter for now for simplicity and determenistic client UIs
  // can be extended to multiple inputs w/o breaking change by switching to Parameter[]
  // note: there are no use-cases for multiple parameters atm, e.g. farcaster frames also have just single input
  parameters?: [Parameter];
}

export interface Parameter {
  name: string; // parameter name in url
  label?: string; // input placeholder
}

// No changes
export interface ActionsSpecPostRequestBody
  extends SolanaPaySpecPostRequestBody {}

// A common error data structure that should be used in all responses for error indication,
// can be used in both GET and POST and extended with additional fields if needed
export interface ActionError {
  message: string;
}

// Error response that can be used in both GET and POST for non 200 status codes
// interoperable with: https://github.com/anza-xyz/solana-pay/blob/master/SPEC1.1.md#error-handling
export interface ActionsSpecErrorResponse extends ActionError {}
