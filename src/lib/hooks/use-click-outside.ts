import { RefObject } from 'react';
import { useAction } from './use-action';
import { useExhaustive } from './use-exhaustive';

type Event = MouseEvent | TouchEvent;

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: (event: Event) => void,
): void => {
  const action = useAction(handler);
  useExhaustive.effect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      action(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref]);
};
