import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Typer, { TyperState, ITyperProps, EraseStyle } from '../../src/Typer';
import { testInstance } from './utils';

configure({ adapter: new Adapter() });
jest.useFakeTimers();

const waitForAsync = () => new Promise((resolve) => setImmediate(resolve));
const advanceTimersByTime = async (...times: number[]) => {
  for (const time of times) {
    jest.advanceTimersByTime(time);
    await waitForAsync(); // See https://github.com/airbnb/enzyme/issues/1587
  }
};

describe('Typer', () => {
  const preTypeDelay = 1; // Delay before first type step, step happens directly after - IDLE during
  const typeDelay = 1; // Delay for each successive time step - TYPING
  const preEraseDelay = 1; // Delay before first erase step - IDLE
  const eraseDelay = 1; // Delay for each successive erase step - ERASING

  const constantProps = { preTypeDelay, typeDelay, preEraseDelay, eraseDelay };
  const renderWithProps = (props: Partial<ITyperProps>) => (
    shallow<Typer>(<Typer {...constantProps} {...props} />)
  );

  describe('spool, unicode support', () => {
    const testEmojis: { [key: string]: string[] } = {
      1: ['💙', '⛳', '⛈'],
      2: ['❤️', '💩'],
      3: ['✍🏻', '🔥'],
      4: ['👍🏻', '🤳🏻'],
      5: ['💅🏻', '👨‍⚖️'],
      7: ['👩🏻‍🎤', '👩🏻‍✈️'],
      8: ['👩‍❤️‍👩', '👨‍👩‍👧'],
      9: ['👩‍👩‍👦'],
      11: ['👩‍❤️‍💋‍👩', '👨‍👩‍👧‍👦'],
    };

    Object.keys(testEmojis).forEach((emojiLength: string) => {
      describe(`Handle ${emojiLength} codepoint emojis`, () => {
        const emojiList = testEmojis[emojiLength];
        emojiList.forEach((emoji: string) => {
          it(`should handle ${emoji} as one character`, async () => {
            const instance = renderWithProps({ spool: [emoji], preTypeDelay, typeDelay });
            const expectState = testInstance(instance);

            await advanceTimersByTime(preTypeDelay);
            expectState({ wordIndex: 1 });
          });
        });
      });
    });
  });

  describe('repeats, eraseOnComplete', () => {
    const renderWithOptions = (repeats: number, eraseOnComplete: boolean, spool = ['a']) => (
      renderWithProps({
        repeats,
        eraseOnComplete,
        spool,
      })
    );

    it('should not repeat and should not erase on completion', async () => {
      const instance = renderWithOptions(0, false);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 0 });
    });

    it('should not repeat and should erase on completion', async () => {
      const instance = renderWithOptions(0, true);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay);
      expectState({ typerState: TyperState.IDLE, repeatCount: 0 });

      await advanceTimersByTime(preEraseDelay);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 0 });
    });

    it('should repeat specified times and should not erase on completion', async () => {
      const instance = renderWithOptions(1, false);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay);
      expectState({ typerState: TyperState.IDLE, repeatCount: 0 });

      await advanceTimersByTime(preEraseDelay);
      expectState({ typerState: TyperState.IDLE, repeatCount: 0 });

      await advanceTimersByTime(preTypeDelay); // repeatCount should increment at next type start
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 1 });
    });

    it('should repeat specified times and should erase on completion', async () => {
      const instance = renderWithOptions(1, true);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay);
      expectState({ typerState: TyperState.IDLE, repeatCount: 0 });
      await advanceTimersByTime(preEraseDelay);
      expectState({ typerState: TyperState.IDLE, repeatCount: 0 });

      await advanceTimersByTime(preTypeDelay);
      expectState({ typerState: TyperState.IDLE, repeatCount: 1 });
      await advanceTimersByTime(preEraseDelay);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 1 });
    });

    it('should run (repeats + 1) * spool.length times', async () => {
      const instance = renderWithOptions(1, false, ['a', 'b']);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay, preEraseDelay);
      expectState({ spoolIndex: 0, repeatCount: 0 });
      await advanceTimersByTime(preTypeDelay, preEraseDelay);
      expectState({ spoolIndex: 1, repeatCount: 0 });

      await advanceTimersByTime(preTypeDelay, preEraseDelay);
      expectState({ spoolIndex: 0, repeatCount: 1 });
      await advanceTimersByTime(preTypeDelay, preEraseDelay);
      expectState({ spoolIndex: 1, repeatCount: 1, typerState: TyperState.COMPLETE });
    });
  });

  describe('eraseStyle', () => {
    const renderWithStyle = (eraseStyle: EraseStyle) => renderWithProps({
      repeats: 0,
      eraseOnComplete: true,
      spool: ['ab'],
      eraseStyle,
    });

    it('should clear all characters with select-all', async () => {
      const instance = renderWithStyle(EraseStyle.SELECTALL);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay, typeDelay);
      expectState({ wordIndex: 2 });

      await advanceTimersByTime(preEraseDelay);
      expectState({ wordIndex: 0 });
    });

    it('should clear all characters with clear', async () => {
      const instance = renderWithStyle(EraseStyle.CLEAR);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay, typeDelay);
      expectState({ wordIndex: 2 });

      await advanceTimersByTime(preEraseDelay);
      expectState({ wordIndex: 0 });
    });
  });

  describe('initialAction', () => {
    const renderWithAction = (initialAction: TyperState.TYPING | TyperState.ERASING) => (
      renderWithProps({
        repeats: 0,
        spool: ['abc'],
        initialAction,
      })
    );

    it('should start typing', async () => {
      const instance = renderWithAction(TyperState.TYPING);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay);
      expectState({ wordIndex: 1 });
    });

    it('should start erasing', async () => {
      const instance = renderWithAction(TyperState.ERASING);
      const expectState = testInstance(instance);

      await advanceTimersByTime(preTypeDelay);
      expectState({ wordIndex: 3 });

      await advanceTimersByTime(preEraseDelay);
      expectState({ wordIndex: 2 });
    });
  });

  describe('event handlers', () => {
    const renderWithCallback = (type: string, handler: () => void, spool: string[], repeats?: number) => (
      renderWithProps({
        spool,
        repeats,
        [type]: handler,
      })
    );

    it('should call onType', async () => {
      const onType = jest.fn();
      renderWithCallback('onType', onType, ['ab']);

      await advanceTimersByTime(preTypeDelay);
      expect(onType.mock.calls.length).toBe(1);
      expect(onType.mock.calls[0][0]).toBe('a');

      await advanceTimersByTime(typeDelay);
      expect(onType.mock.calls.length).toBe(2);
      expect(onType.mock.calls[1][0]).toBe('ab');
    });

    it('should call onTyped', async () => {
      const onTyped = jest.fn();
      renderWithCallback('onTyped', onTyped, ['ab']);

      await advanceTimersByTime(preTypeDelay);
      expect(onTyped.mock.calls.length).toBe(0);

      await advanceTimersByTime(typeDelay);
      expect(onTyped.mock.calls.length).toBe(1);
      expect(onTyped.mock.calls[0][0]).toBe('ab');
    });

    it('should call onErase', async () => {
      const onErase = jest.fn();
      renderWithCallback('onErase', onErase, ['ab']);

      await advanceTimersByTime(preTypeDelay, typeDelay, preEraseDelay);
      expect(onErase.mock.calls.length).toBe(1);
      expect(onErase.mock.calls[0][0]).toBe('a');

      await advanceTimersByTime(eraseDelay);
      expect(onErase.mock.calls.length).toBe(2);
      expect(onErase.mock.calls[1][0]).toBe('');
    });

    it('should call onErased', async () => {
      const onErased = jest.fn();
      const i = renderWithCallback('onErased', onErased, ['ab']);

      await advanceTimersByTime(preTypeDelay, typeDelay, preEraseDelay);

      expect(onErased.mock.calls.length).toBe(0);

      await advanceTimersByTime(eraseDelay);
      expect(onErased.mock.calls.length).toBe(1);
      expect(onErased.mock.calls[0][0]).toBe('ab');
    });

    it('should call onFinish', async () => {
      const onFinish = jest.fn();
      renderWithCallback('onFinish', onFinish, ['a'], 0);

      await advanceTimersByTime(preTypeDelay);
      expect(onFinish.mock.calls.length).toBe(1);
    });
  });
});
