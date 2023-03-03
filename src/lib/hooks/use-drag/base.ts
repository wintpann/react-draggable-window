import { CSSProperties, RefObject, useRef } from 'react';
import { useAction } from '../use-action';

export enum ButtonDragClicked {
  PRIMARY = 0,
  WHEEL = 1,
  SECONDARY = 2,
}

export type MoveCallback = (diff: [number, number], target: HTMLElement) => void;
export type StartEndCallback = (target: HTMLElement) => void;
export type CursorGetter = (target: HTMLElement) => CSSProperties['cursor'];
export type DragProps = {
  ref: RefObject<HTMLElement>;
  enabled?: boolean;
  onMove?: MoveCallback;
  onStartMove?: StartEndCallback;
  onEndMove?: StartEndCallback;
  getCursor?: CursorGetter;
  button?: ButtonDragClicked;
  stopPropagation?: boolean;
};

const initialState = {
  startX: 0,
  startY: 0,
  currX: 0,
  currY: 0,
  prevX: 0,
  prevY: 0,
  enabled: false,
};

const getDiff = (state: typeof initialState): [number, number] => [
  state.currX - state.startX,
  state.currY - state.startY,
];

export const useDragBase = ({
  enabled = true,
  onEndMove,
  onMove,
}: Pick<DragProps, 'enabled' | 'onMove' | 'onEndMove'>) => {
  const state = useRef({ ...initialState });
  state.current.enabled = enabled;

  const onMouseMove = useAction((e: MouseEvent) => {
    state.current.prevY = state.current.currY;
    state.current.prevX = state.current.currX;

    state.current.currY = e.clientY;
    state.current.currX = e.clientX;
    onMove?.(getDiff(state.current), e.target as HTMLElement);
  });

  const onMouseUp = useAction((e: MouseEvent) => {
    document.body.classList.remove('draggable-inherit-cursor');
    document.body.style.userSelect = 'auto';
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    onEndMove?.(e.target as HTMLElement);
  });

  return {
    onMouseUp,
    onMouseMove,
    state,
  };
};
