import { ResizerDirection, WindowSizeMode } from './types';
import { CSSProperties } from 'react';

export const TIMEOUT_DURATION = 1000;

export const MIN_WINDOW_PADDING = 100;

export const MIN_WINDOW_SIDE = 400;

export const INITIAL_SIZE_MODE = WindowSizeMode.NORMAL;

export const NORMAL_DEFAULT_SIZE = {
  x: 600,
  y: 400,
};

export const SPRING_CONFIG = {
  mass: 3,
  tension: 200,
  friction: 50,
};

export const RESIZE_CURSOR_MAP = new Map<ResizerDirection, CSSProperties['cursor']>([
  [ResizerDirection.TL, 'nwse-resize'],
  [ResizerDirection.T, 'ns-resize'],
  [ResizerDirection.TR, 'nesw-resize'],
  [ResizerDirection.R, 'ew-resize'],
  [ResizerDirection.RB, 'nwse-resize'],
  [ResizerDirection.B, 'ns-resize'],
  [ResizerDirection.LB, 'nesw-resize'],
  [ResizerDirection.L, 'ew-resize'],
]);

export const POSITIVE_X_DIFF_DIRECTIONS = [
  ResizerDirection.R,
  ResizerDirection.RB,
  ResizerDirection.TR,
];

export const POSITIVE_Y_DIFF_DIRECTIONS = [
  ResizerDirection.B,
  ResizerDirection.RB,
  ResizerDirection.LB,
];
