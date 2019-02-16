// Since Node's versions return a NodeJS.Timer, not number, and window does not work with Jest
declare global {
  function setTimeout(callback: () => void, timeout: number): number;
  function setInterval(callback: () => void, interval: number): number;
  function clearTimeout(id: number): void;
  function clearInterval(id: number): void;
}

export const enum TyperState {
  TYPING = 'typing',
  ERASING = 'erasing',
  COMPLETE = 'complete',
}

export const enum EraseStyle {
  BACKSPACE = 'backspace',
  SELECT = 'select',
  SELECTALL = 'select-all',
  CLEAR = 'clear',
}

export const enum CaretAnimationStyle {
  SOLID = 'solid',
  BLINK = 'blink',
  SMOOTH = 'smooth',
}

export const enum CharacterStatus {
  UNTYPED = 'untyped',
  TYPED = 'typed',
  SELECTED = 'selected',
  ERASED = 'erased',
}

export interface ITyperProps {
  spool: string[];
  repeats: number;
  shuffle: boolean;

  preTypeDelay: number;
  typeDelay: number;
  preEraseDelay: number;
  eraseDelay: number;
  preClearDelay: number;

  initialAction: TyperState.TYPING | TyperState.ERASING;
  eraseOnComplete: boolean;
  eraseStyle: EraseStyle;
  caretAnimationStyle: CaretAnimationStyle;

  onType: () => void; // TODO: fix args
  onTyped: () => void;
  onErase: () => void;
  onErased: () => void;
  onFinish: () => void;
}

export interface ITyperState {
  repeatCount: number;
  spool: string[];
  spoolIndex: number;
  wordIndex: number;

  typerState: TyperState;
  typerTimeout: number;
  typerInterval: number;
}

export interface ICaretProps {
  animation: string;
}

export interface ICharacterProps {
  value: string;
  status: CharacterStatus;
}
