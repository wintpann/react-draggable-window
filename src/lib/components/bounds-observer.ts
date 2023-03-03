import { cloneElement, FC, ReactElement, RefAttributes, useRef } from 'react';
import composeRefs from '@seznam/compose-react-refs';
import { Bounds, useBounds } from '../hooks/use-bounds';

export type BoundsObserverProps = {
  onBoundsChange: (bounds: Bounds) => void;
  children: ReactElement & RefAttributes<HTMLElement>;
};

export const BoundsObserver: FC<BoundsObserverProps> = ({ children, onBoundsChange }) => {
  const ref = useRef(null);

  useBounds(ref, onBoundsChange);

  return cloneElement(children, {
    ref: composeRefs(children.ref, ref),
  });
};
