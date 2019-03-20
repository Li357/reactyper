import React, { Component } from 'react';
import split from 'lodash.split';

import Caret from './Caret';
import Character from './Character';
import { CaretAnimationStyle, EraseStyle, ITyperProps, ITyperState, TyperState, CharacterStatus } from './types';
import shuffle from './util/shuffle';
import './styles/Typer.css';

export default class Typer extends Component<ITyperProps, ITyperState> {
  public static defaultProps: ITyperProps = {
    spool: ['React Typer'],
    repeats: Infinity,
    shuffle: false,

    preTypeDelay: 70,
    typeDelay: 70,
    preEraseDelay: 2000,
    eraseDelay: 250,
    preClearDelay: 1000,

    initialAction: TyperState.TYPING,
    eraseOnComplete: false,
    eraseStyle: EraseStyle.BACKSPACE,
    caretAnimationStyle: CaretAnimationStyle.BLINK,

    onType: () => undefined,
    onTyped: () => undefined,
    onErase: () => undefined,
    onErased: () => undefined,
    onFinish: () => undefined,
  };

  constructor(props: ITyperProps) {
    super(props);

    const { shuffle: shouldShuffle, spool, initialAction } = this.props;
    const shuffledSpool = shouldShuffle ? shuffle(spool) : spool;
    this.state = {
      repeatCount: 0,
      spool: shuffledSpool,
      spoolIndex: 0,
      wordIndex: 0,
      currentWord: shuffledSpool[0],
      currentChars: split(shuffledSpool[0], ''),

      typerState: initialAction,
      typerTimeout: 0,
      typerInterval: 0,
    };
  }

  public componentDidMount() {
    const { initialAction } = this.props;
    if (initialAction === TyperState.TYPING) {
      this.startTyping();
    } else if (initialAction === TyperState.ERASING) {
      const { currentWord } = this.state;
      this.shiftCaret(currentWord.length);
      this.startErasing();
    }
  }

  private startTyping = () => {
    const { preTypeDelay, typeDelay } = this.props;

    const typerTimeout = setTimeout(() => {
      this.typeStep();
      const typerInterval = setInterval(this.typeStep, typeDelay);
      this.setState({ typerInterval });
    }, preTypeDelay);
    this.setState({
      typerTimeout,
      typerState: TyperState.TYPING,
    });
  }

  private startErasing() {
    const { preEraseDelay, eraseDelay } = this.props;

    const typerTimeout = setTimeout(() => {
      this.eraseStep();
      const typerInterval = setInterval(this.eraseStep, eraseDelay);
      this.setState({ typerInterval });
    }, preEraseDelay);
    this.setState({ typerTimeout, typerState: TyperState.ERASING });
  }

  private typeStep = () => {
    const { wordIndex, currentChars } = this.state;
    const isDoneTypingWord = wordIndex === currentChars.length;

    this.props.onType(currentChars.slice(0, wordIndex).join(''));
    if (isDoneTypingWord) {
      return this.onTyped();
    }
    this.shiftCaret(1);
  }

  private eraseStep = () => {
    const { currentChars, typerInterval, wordIndex } = this.state;
    const { eraseStyle, preClearDelay, onErase } = this.props;
    const isDoneErasingWord = wordIndex === 0;

    onErase(currentChars.slice(0, wordIndex).join(''));
    if (isDoneErasingWord) {
      const isSelectionErase = eraseStyle === EraseStyle.SELECTALL || eraseStyle === EraseStyle.SELECT;
      if (isSelectionErase) {
        clearInterval(typerInterval);
        const typerTimeout = setTimeout(this.onErased, preClearDelay);
        return this.setState({ typerTimeout });
      }
      return this.onErased();
    }

    const isAllErase = eraseStyle === EraseStyle.SELECTALL || eraseStyle === EraseStyle.CLEAR;
    if (isAllErase) {
      return this.shiftCaret(-wordIndex);
    }
    this.shiftCaret(-1);
  }

  private shiftCaret = (delta: number, cb?: () => void) => {
    this.setState(({ wordIndex }) => ({ wordIndex: wordIndex + delta }), cb);
  }

  private resetSpool = (cb: () => void) => {
    const { spool, shuffle: shouldShuffle } = this.props;
    this.setState({
      spoolIndex: 0,
      spool: shouldShuffle ? shuffle(spool) : spool,
    }, cb);
  }

  private advanceSpool = (cb: () => void) => {
    this.setState(({ spoolIndex, spool }) => {
      const nextIndex = spoolIndex + 1;
      const nextWord = spool[nextIndex];
      return {
        spoolIndex: nextIndex,
        currentWord: nextWord,
        currentChars: split(nextWord, ''),
      };
    }, cb);
  }

  private onTyped = () => {
    const { spool, spoolIndex, currentWord, repeatCount, typerInterval } = this.state;
    const { repeats, eraseOnComplete, onTyped } = this.props;

    const isLastWord = spoolIndex === spool.length - 1;
    const shouldRepeat = repeatCount < repeats;

    clearInterval(typerInterval);
    onTyped(currentWord);
    if (isLastWord) {
      if (eraseOnComplete || shouldRepeat) {
        return this.startErasing();
      }
      return this.onFinish();
    }
    this.startErasing();
  }

  private onErased = () => {
    const { spool, spoolIndex, currentWord, repeatCount, typerInterval } = this.state;
    const { repeats, onErased } = this.props;

    const isLastWord = spoolIndex === spool.length - 1;
    const shouldRepeat = repeatCount < repeats;

    clearInterval(typerInterval);
    onErased(currentWord);
    if (isLastWord) {
      if (shouldRepeat) {
        return this.resetSpool(() => {
          this.setState({
            repeatCount: repeatCount + 1,
          }, this.startTyping);
        });
      }
      return this.onFinish();
    }
    this.advanceSpool(this.startTyping);
  }

  private onFinish = () => {
    this.setState({ typerState: TyperState.COMPLETE }, () => this.props.onFinish());
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

    const isTyping = typerState === TyperState.TYPING;
    const isFinished = typerState === TyperState.COMPLETE;
    const isSelectionErase = eraseStyle === EraseStyle.SELECT || eraseStyle === EraseStyle.SELECTALL;
    const rightStatus = isSelectionErase ? CharacterStatus.SELECTED : CharacterStatus.ERASED;
    const isSelectionAndErasing = typerState === TyperState.ERASING && isSelectionErase;

    return (
      <span className="react-typer">
        {leftChars.map((char, i) => (
          <Character key={i} value={char} status={CharacterStatus.TYPED} />
        ))}
        {!(isFinished || isSelectionAndErasing) && <Caret animation={this.props.caretAnimationStyle} />}
        {rightChars.map((char, i) => (
          <Character key={i} value={char} status={isTyping ? CharacterStatus.UNTYPED : rightStatus} />
        ))}
      </span>
    );
  }
}
