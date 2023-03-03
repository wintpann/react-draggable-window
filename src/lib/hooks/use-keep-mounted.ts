import { useEffect, useState } from 'react';
import { noop } from '../utils';

export const useKeepMounted = ({
  keepMounted,
  shown,
  timeoutDuration,
}: {
  keepMounted: boolean;
  shown: boolean;
  timeoutDuration: number;
}) => {
  const [mounted, setMounted] = useState(keepMounted ? true : shown);

  useEffect(() => {
    if (keepMounted) return noop;

    if (shown) {
      setMounted(shown);
      return noop;
    }

    const timeout = setTimeout(() => setMounted(shown), timeoutDuration);
    return () => clearTimeout(timeout);
  }, [shown, keepMounted, timeoutDuration]);

  return mounted;
};
