import { RefObject } from 'react';
import { useAction } from './use-action';
import { ResizeCallback, useResizeObserver } from './use-resize-observer';
import { useExhaustive } from './use-exhaustive';

export type Bounds = Omit<DOMRectReadOnly, 'toJSON'>;

export type BoundsCallback = (bounds: Bounds) => void;

export const useBounds = (ref: RefObject<HTMLElement>, callback: BoundsCallback) => {
  const handleResize: ResizeCallback = useAction((entry) => {
    callback(entry.contentRect);
  });
  useExhaustive.effect(() => {
    if (ref.current) {
      callback(ref.current.getBoundingClientRect());
    }
  }, []);
  useResizeObserver(ref, handleResize);
};
