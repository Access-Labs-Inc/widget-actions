import { ClassValue, clsx } from 'clsx';

export const formatACSCurrency = (amount: number) => {
  const amountAsACS = amount;
  return parseFloat(
    parseFloat(amountAsACS.toString()).toFixed(2)
  ).toLocaleString('en-US', {
    useGrouping: true,
  });
};

export const formatPenyACSCurrency = (amount: number) => {
  const amountAsACS = amount / 10 ** 6;
  return parseFloat(
    parseFloat(amountAsACS.toString()).toFixed(2)
  ).toLocaleString('en-US', {
    useGrouping: true,
  });
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clsxp(prefix: string, ...args: ClassValue[]) {
  return clsx(args.filter(Boolean).map((arg) => `${prefix}${arg}`));
}

export function toSpliced<T>(arr: T[] | undefined, n: number): T[] {
  if (!arr) { return []; }
  const carr = arr.slice(); // copy
  carr.splice(n);
  return carr;
}

class TimeoutError extends Error {}

export function isTimeoutError(err: any): err is TimeoutError {
  return err instanceof TimeoutError;
}

export function timeout<T>(
  promise: Promise<T>,
  time: number,
  exceptionValue: string,
): Promise<T | Error> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<T | Error>((res, rej) => {
      timer = setTimeout(() => {
        rej(new TimeoutError(exceptionValue));
      }, time);
    }),
  ]).finally(() => {
    clearTimeout(timer);
  }) as Promise<T | Error>;
}
