import { MouseEventHandler } from 'react';
import { useAction } from '../use-action';
import { useExhaustive } from '../use-exhaustive';
import { ButtonDragClicked, DragProps, useDragBase } from './base';

export const useDragHandlers = ({
  enabled = true,
  onMove,
  onStartMove,
  onEndMove,
  getCursor,
  button = ButtonDragClicked.PRIMARY,
  stopPropagation = true,
}: Omit<DragProps, 'ref'>) => {
  const { onMouseMove, onMouseUp, state } = useDragBase({
    enabled,
    onMove,
    onEndMove,
  });

  const onMouseDown: MouseEventHandler<HTMLElement> = useAction((e) => {
    if (!state.current.enabled) return;

    const correctButtonClicked = e.button === button;

    if (correctButtonClicked) {
      if (stopPropagation) e.stopPropagation();
      state.current.startY = e.clientY;
      state.current.startX = e.clientX;

      onStartMove?.(e.target as HTMLElement);
      document.body.classList.add('inherit-cursor');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = getCursor?.(e.target as HTMLElement) ?? 'default';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  });

  useExhaustive.effect(
    () => () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    },
    [],
  );

  return { onMouseDown };
};
