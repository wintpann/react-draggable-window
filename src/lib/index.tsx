import React, { FC, memo, useRef, useState } from 'react';
import classNames from 'classnames';
import { animated, useSpring } from '@react-spring/web';
import { useKeepMounted } from './hooks/use-keep-mounted';
import { useExhaustive } from './hooks/use-exhaustive';
import { useAction } from './hooks/use-action';
import { ButtonDragClicked, MoveCallback, useDragHandlers } from './hooks/use-drag';
import { BoundsObserver } from './components/bounds-observer';
import { Bounds, useBounds } from './hooks/use-bounds';
import { useClickOutside } from './hooks/use-click-outside';
import { WindowSizeMode, ResizerDirection, WindowProps, WindowControl } from './types';
import {
  MIN_WINDOW_SIDE,
  INITIAL_SIZE_MODE,
  NORMAL_DEFAULT_SIZE,
  POSITIVE_Y_DIFF_DIRECTIONS,
  POSITIVE_X_DIFF_DIRECTIONS,
  SPRING_CONFIG,
  TIMEOUT_DURATION,
} from './consants';
import {
  clampMax,
  getWindowTransform,
  getCursor,
  stopPropagation,
  getResizeDragCursor,
  getNormalWindowSize,
  moveRefInitial,
} from './utils';
import './index.scss';

const windows: HTMLElement[] = [];

const Window: FC<WindowProps> = ({
  active,
  variant = 'liquid',
  header,
  footer,
  children,
  onClose,
  steady = false,
  canClose = true,
  canMinMax = true,
  canCollapse = true,
  normalX = NORMAL_DEFAULT_SIZE.x,
  normalY = NORMAL_DEFAULT_SIZE.y,
  controlRef,
  onMinimized,
  parent,
  title,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef(parent);
  const moveRef = useRef(moveRefInitial(getNormalWindowSize(parent, normalX, normalY)));
  const heightRef = useRef({ header: 0, footer: 0, window: 0 });

  const [animation, spring] = useSpring(() => {
    const width = moveRef.current.windowWidth;
    const height = moveRef.current.windowHeight;

    return {
      width,
      height,
      transform: getWindowTransform(0, 0, width, height, false),
      opacity: 0,
      config: SPRING_CONFIG,
    };
  });

  const recalculateContentHeight = () => {
    if (!childrenRef.current) return;

    const maxAvailableContentHeight =
      heightRef.current.window - heightRef.current.footer - heightRef.current.header;

    childrenRef.current.style.maxHeight = `${Math.round(clampMax(0, maxAvailableContentHeight))}px`;
  };

  const [sizeMode, setSizeMode] = useState<WindowSizeMode>(INITIAL_SIZE_MODE);
  const [isFocused, setIsFocused] = useState(false);

  const mounted = useKeepMounted({
    shown: active,
    timeoutDuration: TIMEOUT_DURATION,
    keepMounted: false,
  });
  const canMove = !steady && sizeMode === WindowSizeMode.NORMAL;

  const saveCurrentWindowBounds = () => {
    if (!windowRef.current) return;

    const widthDiff = (windowRef.current.offsetWidth - moveRef.current.windowWidth) / 2;
    const heightDiff = (windowRef.current.offsetHeight - moveRef.current.windowHeight) / 2;

    if (POSITIVE_X_DIFF_DIRECTIONS.includes(moveRef.current.resizeDirection)) {
      moveRef.current.currentX += widthDiff;
    } else {
      moveRef.current.currentX -= widthDiff;
    }

    if (POSITIVE_Y_DIFF_DIRECTIONS.includes(moveRef.current.resizeDirection)) {
      moveRef.current.currentY += heightDiff;
    } else {
      moveRef.current.currentY -= heightDiff;
    }

    moveRef.current.windowHeight = windowRef.current.offsetHeight;
    moveRef.current.windowWidth = windowRef.current.offsetWidth;
    moveRef.current.stoppedX = moveRef.current.currentX;
    moveRef.current.stoppedY = moveRef.current.currentY;
  };

  const onWindowMove: MoveCallback = ([x, y]) => {
    const newX = moveRef.current.stoppedX + x;
    const newY = moveRef.current.stoppedY + y;

    spring.start({
      transform: getWindowTransform(
        newX,
        newY,
        moveRef.current.windowWidth,
        moveRef.current.windowHeight,
        true,
      ),
      immediate: true,
    });

    moveRef.current.currentX = newX;
    moveRef.current.currentY = newY;
  };

  const windowDragHandlers = useDragHandlers({
    onMove: onWindowMove,
    onEndMove: saveCurrentWindowBounds,
    enabled: canMove,
    button: ButtonDragClicked.WHEEL,
    getCursor,
    stopPropagation: false,
  });

  const panelDragHandlers = useDragHandlers({
    onMove: onWindowMove,
    onEndMove: saveCurrentWindowBounds,
    enabled: canMove,
    getCursor,
  });

  const onStartResizerMove = (target: HTMLElement) => {
    moveRef.current.resizeDirection = target.dataset.direction as ResizerDirection;
  };

  const onResizeHandlerMove: MoveCallback = ([x, y]) => {
    switch (moveRef.current.resizeDirection) {
      case ResizerDirection.B: {
        const newHeight = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowHeight + y);

        spring.start({
          height: newHeight,
          immediate: true,
        });
        break;
      }
      case ResizerDirection.L: {
        const newWidth = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowWidth - x);
        const widthDiff = moveRef.current.windowWidth - newWidth;
        const currentX = moveRef.current.stoppedX + widthDiff / 2;

        spring.start({
          width: newWidth,
          transform: getWindowTransform(
            currentX,
            moveRef.current.stoppedY,
            newWidth,
            moveRef.current.windowHeight,
            true,
          ),
          immediate: true,
        });
        break;
      }
      case ResizerDirection.LB: {
        const newHeight = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowHeight + y);
        const newWidth = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowWidth - x);
        const widthDiff = moveRef.current.windowWidth - newWidth;
        const currentX = moveRef.current.stoppedX + widthDiff / 2;

        spring.start({
          height: newHeight,
          width: newWidth,
          transform: getWindowTransform(
            currentX,
            moveRef.current.stoppedY,
            newWidth,
            moveRef.current.windowHeight,
            true,
          ),
          immediate: true,
        });
        break;
      }
      case ResizerDirection.R: {
        const newWidth = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowWidth + x);

        spring.start({
          width: newWidth,
          immediate: true,
        });
        break;
      }
      case ResizerDirection.RB: {
        const newWidth = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowWidth + x);
        const newHeight = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowHeight + y);

        spring.start({
          width: newWidth,
          height: newHeight,
          immediate: true,
        });
        break;
      }
      case ResizerDirection.T: {
        const newHeight = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowHeight - y);
        const heightDiff = moveRef.current.windowHeight - newHeight;
        const currentY = moveRef.current.stoppedY + heightDiff / 2;

        spring.start({
          height: newHeight,
          transform: getWindowTransform(
            moveRef.current.stoppedX,
            currentY,
            moveRef.current.windowWidth,
            newHeight,
            true,
          ),
          immediate: true,
        });
        break;
      }
      case ResizerDirection.TL: {
        const newHeight = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowHeight - y);
        const heightDiff = moveRef.current.windowHeight - newHeight;
        const currentY = moveRef.current.stoppedY + heightDiff / 2;
        const newWidth = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowWidth - x);
        const widthDiff = moveRef.current.windowWidth - newWidth;
        const currentX = moveRef.current.stoppedX + widthDiff / 2;

        spring.start({
          height: newHeight,
          width: newWidth,
          transform: getWindowTransform(currentX, currentY, newWidth, newHeight, true),
          immediate: true,
        });
        break;
      }
      case ResizerDirection.TR: {
        const newWidth = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowWidth + x);
        const newHeight = clampMax(MIN_WINDOW_SIDE, moveRef.current.windowHeight - y);
        const heightDiff = moveRef.current.windowHeight - newHeight;
        const currentY = moveRef.current.stoppedY + heightDiff / 2;

        spring.start({
          width: newWidth,
          height: newHeight,
          transform: getWindowTransform(
            moveRef.current.stoppedX,
            currentY,
            moveRef.current.windowWidth,
            newHeight,
            true,
          ),
          immediate: true,
        });
        break;
      }
      default:
        break;
    }
  };

  const resizeHandlers = useDragHandlers({
    onStartMove: onStartResizerMove,
    onMove: onResizeHandlerMove,
    onEndMove: saveCurrentWindowBounds,
    getCursor: getResizeDragCursor,
    enabled: canMove,
  });

  useExhaustive.effect(() => {
    if (!mounted) {
      setSizeMode(INITIAL_SIZE_MODE);
      moveRef.current = moveRefInitial(getNormalWindowSize(parent, normalX, normalY));
    }
  }, [mounted]);

  useExhaustive.effect(() => {
    if (!mounted) {
      spring.start({ ...getNormalWindowSize(parent, normalX, normalY), immediate: true });
    }
  }, [normalY, normalX, mounted]);

  const onFocus = () => {
    setIsFocused(true);

    if (windowRef.current) {
      windows.forEach((w) => {
        w.style.setProperty('z-index', w === windowRef.current ? '1' : '0');
      });
    }
  };

  const onBlur = () => setIsFocused(false);

  useClickOutside(windowRef, onBlur);

  useExhaustive.effect(() => {
    if (!windowRef.current) return;

    const width = windowRef.current.offsetWidth;
    const height = windowRef.current.offsetHeight;

    switch (sizeMode) {
      case WindowSizeMode.MINIMIZED: {
        spring.start({
          transform: getWindowTransform(0, parent.offsetHeight, width, height, false),
        });
        break;
      }
      case WindowSizeMode.MAXIMIZED: {
        moveRef.current.windowHeight = windowRef.current.offsetHeight;
        moveRef.current.windowWidth = windowRef.current.offsetWidth;

        spring.start({
          transform: getWindowTransform(0, 0, parent.offsetWidth, parent.offsetHeight, active),
          opacity: active ? 1 : 0,
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
        break;
      }
      case WindowSizeMode.NORMAL: {
        spring.start({
          transform: getWindowTransform(
            moveRef.current.stoppedX,
            moveRef.current.stoppedY,
            moveRef.current.windowWidth,
            moveRef.current.windowHeight,
            active,
          ),
          width: moveRef.current.windowWidth,
          height: moveRef.current.windowHeight,
          opacity: active ? 1 : 0,
        });
        break;
      }
      default:
        break;
    }

    if (active) {
      onFocus();
    } else {
      onBlur();
    }
  }, [sizeMode, active]);

  const onMinMax = () => {
    setSizeMode((prev) =>
      prev === WindowSizeMode.NORMAL ? WindowSizeMode.MAXIMIZED : WindowSizeMode.NORMAL,
    );
  };

  const onCollapse = () => {
    onMinimized?.(sizeMode as WindowSizeMode.NORMAL | WindowSizeMode.MAXIMIZED);
    setSizeMode(WindowSizeMode.MINIMIZED);
  };

  const maximize = useAction(() => {
    if (active) setSizeMode(WindowSizeMode.MAXIMIZED);
  });

  const minimize = useAction(() => {
    if (active) setSizeMode(WindowSizeMode.MINIMIZED);
  });

  const normalize = useAction(() => {
    if (active) setSizeMode(WindowSizeMode.NORMAL);
  });

  useExhaustive.effect(() => {
    if (controlRef) {
      // eslint-disable-next-line no-param-reassign
      controlRef.current = {
        maximize,
        minimize,
        normalize,
      };
    }

    const { current: currentWindow } = windowRef;

    if (currentWindow) {
      windows.push(currentWindow);
    }

    return () => {
      const currentWindowIndex = windows.findIndex((w) => w === currentWindow);
      windows.splice(currentWindowIndex, 1);
    };
  }, []);

  useBounds(parentRef, recalculateContentHeight);

  const onWindowBoundsChange = (bounds: Bounds) => {
    if (windowRef.current) {
      windowRef.current.style.setProperty(
        '--draggable-steady-translateX',
        `-${Math.round(bounds.width / 2)}px`,
      );
      windowRef.current.style.setProperty(
        '--draggable-steady-translateY',
        `-${Math.round(bounds.height / 2)}px`,
      );
    }

    heightRef.current.window = bounds.height;
    recalculateContentHeight();
  };

  const onFooterBoundsChange = (bounds: Bounds) => {
    heightRef.current.footer = bounds.height;
    recalculateContentHeight();
  };

  const onHeaderBoundsChange = (bounds: Bounds) => {
    heightRef.current.header = bounds.height;
    recalculateContentHeight();
  };

  const resizerClassName = classNames({
    'draggable-window_resizer': true,
    'draggable-window_resizer--disabled': !canMove,
  });

  return (
    <BoundsObserver onBoundsChange={onWindowBoundsChange}>
      <animated.div
        ref={windowRef}
        style={animation}
        className={classNames('draggable-window', `draggable-window_variant--${variant}`, {
          'draggable-window--steady': steady,
          'draggable-window--focused': isFocused,
        })}
        onMouseDown={(e) => {
          onFocus();
          windowDragHandlers.onMouseDown(e);
        }}
      >
        {mounted && (
          <>
            <div className={resizerClassName} data-direction="tl" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="t" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="tr" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="r" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="rb" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="b" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="lb" {...resizeHandlers} />
            <div className={resizerClassName} data-direction="l" {...resizeHandlers} />
            <BoundsObserver onBoundsChange={onHeaderBoundsChange}>
              <div className="draggable-window_header">
                {!steady && (
                  <div
                    className="draggable-window_panel"
                    onMouseDown={(e) => {
                      onFocus();
                      panelDragHandlers.onMouseDown(e);
                    }}
                  >
                    {title && <span className="draggable-window_panel-title">{title}</span>}
                    <div
                      className="draggable-window_panel-icons"
                      onMouseDown={stopPropagation(onFocus)}
                    >
                      <div
                        className={classNames({
                          'draggable-window_panel-icon': true,
                          'draggable-window_panel-icon--disabled': !canCollapse,
                          'draggable-window_panel-icon-collapse': true,
                        })}
                        onMouseDown={stopPropagation()}
                        onClick={onCollapse}
                      />
                      <div
                        className={classNames({
                          'draggable-window_panel-icon': true,
                          'draggable-window_panel-icon--disabled': !canMinMax,
                          'draggable-window_panel-icon-minmax': true,
                        })}
                        onMouseDown={stopPropagation(onFocus)}
                        onClick={onMinMax}
                      />
                      <div
                        className={classNames({
                          'draggable-window_panel-icon': true,
                          'draggable-window_panel-icon--disabled': !canClose,
                          'draggable-window_panel-icon-cross': true,
                        })}
                        onMouseDown={stopPropagation()}
                        onClick={() => onClose()}
                      />
                    </div>
                  </div>
                )}
                {header}
              </div>
            </BoundsObserver>
            {children && (
              <div className="draggable-window_children" ref={childrenRef}>
                {children}
              </div>
            )}
            {footer && (
              <BoundsObserver onBoundsChange={onFooterBoundsChange}>
                <div className="draggable-window_footer">{footer}</div>
              </BoundsObserver>
            )}
          </>
        )}
      </animated.div>
    </BoundsObserver>
  );
};

const WindowMemo = memo(Window);
export { WindowMemo as Window };
export type { WindowSizeMode, ResizerDirection, WindowProps, WindowControl };
