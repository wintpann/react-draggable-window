import { useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
export const useAction = <T extends Function>(actual: T): T => {
  const actionRef = useRef({
    actual,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
    memoized: (...args: any) => actionRef.current.actual(...args),
  });
  actionRef.current.actual = actual;
  return actionRef.current.memoized as unknown as T;
};
