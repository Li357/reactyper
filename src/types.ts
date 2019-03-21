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
  IDLE = 'idle',
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

  onType: (typed: string) => void;
  onTyped: (typed: string) => void;
  onErase: (erased: string) => void;
  onErased: (erased: string) => void;
  onFinish: () => void;
}

export interface ITyperState {
  repeatCount: number;
  spool: string[];
  spoolIndex: number;
  wordIndex: number;
  currentWord: string;
  currentChars: string[];

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
