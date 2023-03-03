import { SyntheticEvent } from 'react';
import { ResizerDirection } from './types';
import { MIN_WINDOW_PADDING, MIN_WINDOW_SIDE, RESIZE_CURSOR_MAP } from './consants';

export const noop = () => undefined;

export const stopPropagation = <T extends (e: SyntheticEvent) => void>(
  fn: T = noop as unknown as T,
): T => {
  const enhanced = (e: Parameters<T>[0]) => {
    e.stopPropagation();
    return fn(e);
  };
  return enhanced as T;
};

export const moveRefInitial = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): {
  stoppedX: number;
  stoppedY: number;
  currentX: number;
  currentY: number;
  windowWidth: number;
  windowHeight: number;
  resizeDirection: ResizerDirection;
} => ({
  stoppedX: 0,
  stoppedY: 0,
  currentX: 0,
  currentY: 0,
  windowWidth: width,
  windowHeight: height,
  resizeDirection: ResizerDirection.T,
});

export const clampMax = (first: number, second: number) => (first > second ? first : second);

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const getWindowTransform = (
  x: number,
  y: number,
  width: number,
  height: number,
  active: boolean,
) =>
  `translate(${Math.round(x - width / 2)}px, ${Math.round(y - height / 2)}px) scale(${
    active ? 1 : 0
  })`;

export const getNormalWindowSize = (parent: HTMLElement, normalX: number, normalY: number) => ({
  width: clamp(normalX, MIN_WINDOW_SIDE, parent.offsetWidth - MIN_WINDOW_PADDING),
  height: clamp(normalY, MIN_WINDOW_SIDE, parent.offsetHeight - MIN_WINDOW_PADDING),
});

export const getResizeDragCursor = (target: HTMLElement) =>
  RESIZE_CURSOR_MAP.get(target.dataset.direction as ResizerDirection) || 'default';

export const getCursor = () => 'move';
