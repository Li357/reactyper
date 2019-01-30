import React, { Component } from 'react';
import split from 'lodash.split';

import Caret from './Caret';
import Character from './Character';
import { CaretAnimationStyle, EraseStyle, ITyperProps, ITyperState, TyperState } from './types';
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

  public state: ITyperState = {
    repeatCount: 0,
    spool: this.props.shuffle ? shuffle(this.props.spool) : this.props.spool,
    spoolIndex: 0,
    wordIndex: 0,

    typerState: this.props.initialAction,
    typerTimeout: 0,
    typerInterval: 0,
  };

  public componentDidMount() {
    const { initialAction } = this.props;
    if (initialAction === TyperState.TYPING) {
      this.startTyping();
    } else if (initialAction === TyperState.ERASING) {
      const { spool, spoolIndex } = this.state;
      this.shiftCaret(spool[spoolIndex].length);
      this.startErasing();
    }
  }

  private startTyping = () => {
    const { preTypeDelay, typeDelay } = this.props;

    const typerTimeout = window.setTimeout(() => {
      this.typeStep();
      const typerInterval = window.setInterval(this.typeStep, typeDelay);
      this.setState({ typerInterval });
    }, preTypeDelay);
    this.setState(({ repeatCount }) => ({
      typerTimeout,
      typerState: TyperState.TYPING,
      repeatCount: repeatCount + 1,
    }));
  }

  private startErasing() {
    const { preEraseDelay, eraseDelay } = this.props;

    const typerTimeout = window.setTimeout(() => {
      this.eraseStep();
      const typerInterval = window.setInterval(this.eraseStep, eraseDelay);
      this.setState({ typerInterval });
    }, preEraseDelay);
    this.setState({ typerTimeout, typerState: TyperState.ERASING });
  }

  private typeStep = () => {
    const { spool, spoolIndex, wordIndex } = this.state;
    const chars = split(spool[spoolIndex], '');
    const isDoneTypingWord = wordIndex === chars.length;

    this.props.onType();
    if (isDoneTypingWord) {
      return this.onTyped();
    }
    this.shiftCaret(1);
  }

  private eraseStep = () => {
    const { typerInterval, wordIndex } = this.state;
    const { eraseStyle, preClearDelay, onErase } = this.props;
    const isDoneErasingWord = wordIndex === 0;

    onErase();
    if (isDoneErasingWord) {
      const isSelectionErase = eraseStyle === EraseStyle.SELECTALL || eraseStyle === EraseStyle.SELECT;
      if (isSelectionErase) {
        window.clearInterval(typerInterval);
        const typerTimeout = window.setTimeout(this.onErased, preClearDelay);
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
    this.setState(({ spoolIndex }) => ({ spoolIndex: spoolIndex + 1 }), cb);
  }

  private onTyped = () => {
    const { spool, spoolIndex, repeatCount, typerInterval } = this.state;
    const { repeats, eraseOnComplete, onTyped } = this.props;

    const isLastWord = spoolIndex === spool.length - 1;
    const shouldRepeat = repeatCount < repeats;

    window.clearInterval(typerInterval);
    onTyped();
    if (isLastWord || !shouldRepeat) { // !shouldRepeat makes sure repeats takes precedence over spool length
      if (eraseOnComplete || shouldRepeat) {
        return this.startErasing();
      }
      return this.onFinish();
    }
    this.startErasing();
  }

  private onErased = () => {
    const { spool, spoolIndex, repeatCount, typerInterval } = this.state;
    const { repeats, onErased } = this.props;

    const isLastWord = spoolIndex === spool.length - 1;
    const shouldRepeat = repeatCount < repeats;

    window.clearInterval(typerInterval);
    onErased();
    if (isLastWord) {
      if (shouldRepeat) {
        return this.resetSpool(this.startTyping);
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
    window.clearInterval(typerTimeout);
    window.clearInterval(typerInterval);
  }

  public render() {
    const { spool, spoolIndex, wordIndex, typerState } = this.state;
    const { eraseStyle } = this.props;

    const chars = split(spool[spoolIndex], '');
    const leftChars = chars.slice(0, wordIndex);
    const rightChars = chars.slice(wordIndex);

    const isTyping = typerState === TyperState.TYPING;
    const isFinished = typerState === TyperState.COMPLETE;
    const isSelectionErase = eraseStyle === EraseStyle.SELECT || eraseStyle === EraseStyle.SELECTALL;
    const rightStatus = isSelectionErase ? 'selected' : 'erased';
    const isSelectionAndErasing = typerState === TyperState.ERASING && isSelectionErase;

    return (
      <span className="react-typer">
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
