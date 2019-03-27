import React, { Component } from 'react';
import split from 'lodash.split';

import Caret from './Caret';
import Character from './Character';
import shuffle from './util/shuffle';
import './styles/Typer.css';

type InitialAction = 'typing' | 'erasing';
type TyperState = InitialAction | 'idle' | 'complete';
type CaretAnimationStyle = 'solid' | 'blink' | 'smooth';
type EraseStyle = 'backspace' | 'select' | 'select-all' | 'clear';

export interface ITyperProps {
  spool: string[];
  repeats: number;
  shuffle: boolean;

  preTypeDelay: number;
  typeDelay: number;
  preEraseDelay: number;
  eraseDelay: number;

  initialAction: InitialAction;
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

export default class Typer extends Component<ITyperProps, ITyperState> {
  public static defaultProps: ITyperProps = {
    spool: ['React Typer'],
    repeats: Infinity,
    shuffle: false,

    preTypeDelay: 70,
    typeDelay: 70,
    preEraseDelay: 2000,
    eraseDelay: 250,

    initialAction: 'typing',
    eraseOnComplete: false,
    eraseStyle: 'backspace',
    caretAnimationStyle: 'blink',

    onType: () => undefined,
    onTyped: () => undefined,
    onErase: () => undefined,
    onErased: () => undefined,
    onFinish: () => undefined,
  };

  constructor(props: ITyperProps) {
    super(props);

    const { shuffle: shouldShuffle, spool } = this.props;
    const shuffledSpool = shouldShuffle ? shuffle(spool) : spool;
    this.state = {
      repeatCount: 0,
      spool: shuffledSpool.filter((str) => str.length !== 0), // Ignore empty strings
      spoolIndex: -1, // So that spoolIndex is incremented to 0 when first typing
      wordIndex: 0,
      currentWord: '',
      currentChars: [],

      typerState: 'idle',
      typerTimeout: 0,
      typerInterval: 0,
    };
  }

  public async componentDidMount() {
    const { initialAction } = this.props;
    if (initialAction === 'typing') {
      this.startTyping();
    } else if (initialAction === 'erasing') {
      await this.advanceSpool();
      await this.shiftCaret(this.state.currentWord.length);
      this.startErasing();
    }
  }

  /* Utility methods */
  private safeSetState = <K extends keyof ITyperState>(
    state: (
      ((prevState: Readonly<ITyperState>, props: Readonly<ITyperProps>) => Pick<ITyperState, K>) | Pick<ITyperState, K>
    ),
  ) => new Promise((resolve) => this.setState(state, resolve))

  private advanceSpool = async () => {
    await this.safeSetState(({ spool, spoolIndex }) => {
      const nextIndex = spoolIndex + 1;
      const nextWord = spool[nextIndex];

      return {
        spoolIndex: nextIndex,
        currentWord: nextWord,
        currentChars: split(nextWord, ''),
      };
    });
  }

  private resetSpool = async () => {
    await this.safeSetState(({ repeatCount }, { shuffle: shouldShuffle, spool }) => {
      const shuffledSpool = shouldShuffle ? shuffle(spool) : spool;
      const nextWord = shuffledSpool[0];

      return {
        repeatCount: repeatCount + 1,
        spool: shuffledSpool,
        spoolIndex: 0,
        currentWord: nextWord,
        currentChars: split(nextWord, ''),
      };
    });
  }

  private shiftCaret = async (delta: number) => {
    await this.safeSetState(({ wordIndex }) => ({ wordIndex: wordIndex + delta }));
  }

  /* Typer lifecycle methods */
  private startTyping = (reset: boolean = false) => {
    const { preTypeDelay, typeDelay } = this.props;

    const typerTimeout = window.setTimeout(async () => {
      if (reset) {
        await this.resetSpool();
      } else {
        await this.advanceSpool();
      }

      await this.safeSetState({ typerState: 'typing' });
      await this.typeStep();
      if (this.state.currentChars.length > 1) { // Since a one-length string will finish typing after initial step
        const typerInterval = window.setInterval(this.typeStep, typeDelay);
        this.setState({ typerInterval });
      }
    }, preTypeDelay);
    this.setState({ typerTimeout });
  }

  private typeStep = async () => {
    await this.shiftCaret(1);

    const { wordIndex, currentChars } = this.state;
    const isDoneTypingWord = wordIndex === currentChars.length;
    const currentlyTyped = currentChars.slice(0, wordIndex).join('');

    this.props.onType(currentlyTyped);
    if (isDoneTypingWord) {
      this.finishTyping();
    }
  }

  private finishTyping = async () => {
    const { onTyped, eraseOnComplete, repeats } = this.props;
    const { spoolIndex, spool, currentWord, repeatCount, typerInterval } = this.state;
    const isLastWord = spoolIndex === spool.length - 1;
    const shouldRepeat = repeatCount < repeats;

    clearInterval(typerInterval);
    onTyped(currentWord);

    await this.safeSetState({ typerState: 'idle' });
    if (isLastWord) {
      if (eraseOnComplete || shouldRepeat) {
        return this.startErasing();
      }
      return this.finish();
    }
    this.startErasing();
  }

  private startErasing = async () => {
    const { preEraseDelay, eraseDelay, eraseStyle } = this.props;

    const typerTimeout = window.setTimeout(async () => {
      await this.safeSetState({ typerState: 'erasing' });
      await this.eraseStep();
      // Should repeat erasing if the currentChars length is greater than 1
      // But NOT if we have SELECTALL or CLEAR eraseStyles, they are completely erased on first step
      const isAllEraseStyle = eraseStyle === 'select-all' || eraseStyle === 'clear';
      if (!isAllEraseStyle && this.state.currentChars.length > 1) {
        const typerInterval = window.setInterval(this.eraseStep, eraseDelay);
        this.setState({ typerInterval });
      }
    }, preEraseDelay);
    this.setState({ typerTimeout });
  }

  private eraseStep = async () => {
    const { eraseStyle } = this.props;
    const isAllEraseStyle = eraseStyle === 'select-all' || eraseStyle === 'clear';

    await this.shiftCaret(isAllEraseStyle ? -this.state.wordIndex : -1);

    const { wordIndex, currentChars } = this.state;
    const isDoneErasingWord = wordIndex === 0;
    const currentlyErased = currentChars.slice(0, wordIndex).join('');

    this.props.onErase(currentlyErased);
    if (isDoneErasingWord) {
      this.finishErasing();
    }
  }

  private finishErasing = async () => {
    const { repeats, onErased } = this.props;
    const { spool, spoolIndex, currentWord, repeatCount, typerInterval } = this.state;
    const isLastWord = spoolIndex === spool.length - 1;
    const shouldRepeat = repeatCount < repeats;

    clearInterval(typerInterval);
    onErased(currentWord);

    await this.safeSetState({ typerState: 'idle' });
    if (isLastWord) {
      if (shouldRepeat) {
        return this.startTyping(true);
      }
      return this.finish();
    }
    this.startTyping();
  }

  private finish = async () => {
    await this.safeSetState({ typerState: 'complete' });
    this.props.onFinish();
  }

  public componentWillUnmount() {
    const { typerTimeout, typerInterval } = this.state;
    clearInterval(typerTimeout);
    clearInterval(typerInterval);
  }

  public render() {
    const { currentChars, wordIndex, typerState } = this.state;
    const { eraseStyle } = this.props;

    const leftChars = currentChars.slice(0, wordIndex);
    const rightChars = currentChars.slice(wordIndex);

    const isTyping = typerState === 'typing';
    const isFinished = typerState === 'complete';
    const isSelectionErase = eraseStyle === 'select' || eraseStyle === 'select-all';
    const rightStatus = isSelectionErase ? 'selected' : 'erased';
    const isSelectionAndErasing = typerState === 'erasing' && isSelectionErase;

    return (
      <span className="reactyper">
        {leftChars.map((char, i) => (
          <Character key={i} value={char} status="typed" />
        ))}
        {!(isFinished || isSelectionAndErasing) && <Caret animation={this.props.caretAnimationStyle} />}
        {rightChars.map((char, i) => (
          <Character key={i} value={char} status={isTyping ? 'untyped' : rightStatus} />
        ))}
      </span>
    );
  }
}
