import { RefObject, useRef } from 'react';
import { useAction } from './use-action';
import { noop } from '../utils';
import { useExhaustive } from './use-exhaustive';

export type ResizeCallback = (entry: ResizeObserverEntry) => void;

export const useResizeObserver = (ref: RefObject<HTMLElement>, callback: ResizeCallback): void => {
  const observerRef = useRef<ResizeObserver | null>(null);

  const action = useAction(callback);

  useExhaustive.effect(() => {
    if (!ref.current) {
      return noop;
    }

    observerRef.current = new ResizeObserver((entries) => action(entries[0]));
    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [ref]);
};
