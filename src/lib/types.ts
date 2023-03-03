import { MutableRefObject, ReactNode } from 'react';

export type WindowControl = {
  minimize: () => void;
  maximize: () => void;
  normalize: () => void;
};

export type WindowProps = {
  active: boolean;
  variant?: 'liquid' | 'solid';
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  canClose?: boolean;
  steady?: boolean;
  canMinMax?: boolean;
  canCollapse?: boolean;
  normalX?: number;
  normalY?: number;
  onMinimized?: (from: WindowSizeMode.NORMAL | WindowSizeMode.MAXIMIZED) => void;
  controlRef?: MutableRefObject<WindowControl | null>;
  parent: HTMLElement;
  title?: string;
};

export enum WindowSizeMode {
  NORMAL = 'normal',
  MAXIMIZED = 'maximized',
  MINIMIZED = 'minimized',
}

export enum ResizerDirection {
  TL = 'tl',
  T = 't',
  TR = 'tr',
  R = 'r',
  RB = 'rb',
  B = 'b',
  LB = 'lb',
  L = 'l',
}
