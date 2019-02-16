import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Typer from '../../src/Typer';
import { TyperState, ITyperProps, ITyperState } from '../../src/types';
import { testInstance } from './utils';

configure({ adapter: new Adapter() });
jest.useFakeTimers();

describe('Typer', () => {
  const preTypeDelay = 1;
  const typeDelay = 1;
  const preEraseDelay = 1;
  const eraseDelay = 1;

  const typeTimeout = preTypeDelay + typeDelay;
  const eraseTimeout = preEraseDelay + eraseDelay;

  const renderWithProps = (props: Partial<ITyperProps>) => shallow<Typer>(<Typer {...props} />);

  describe('repeats, eraseOnComplete', () => {
    const renderWithOptions = (repeats: number, eraseOnComplete: boolean, spool = ['a']) => (
      renderWithProps({
        repeats,
        eraseOnComplete,
        spool,
        preTypeDelay,
        typeDelay,
        preEraseDelay,
        eraseDelay,
      })
    );

    it('should not repeat and should not erase on completion', () => {
      const instance = renderWithOptions(0, false);
      const expectState = testInstance<Typer>(instance);

      jest.advanceTimersByTime(typeTimeout);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 0 });
    });

    it('should not repeat and should erase on completion', () => {
      const instance = renderWithOptions(0, true);
      const expectState = testInstance<Typer>(instance);

      jest.advanceTimersByTime(typeTimeout);
      expectState({ typerState: TyperState.ERASING, repeatCount: 0 });
      jest.advanceTimersByTime(eraseTimeout);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 0 });
    });

    it('should repeat specified times and should not erase on completion', () => {
      const instance = renderWithOptions(1, false);
      const expectState = testInstance<Typer>(instance);

      jest.advanceTimersByTime(typeTimeout);
      expectState({ typerState: TyperState.ERASING, repeatCount: 0 });
      jest.advanceTimersByTime(eraseTimeout);
      expectState({ typerState: TyperState.TYPING, repeatCount: 1 });
      jest.advanceTimersByTime(typeTimeout);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 1 });
    });

    it('should repeat specified times and should erase on completion', () => {
      const instance = renderWithOptions(1, true);
      const expectState = testInstance<Typer>(instance);

      jest.advanceTimersByTime(typeTimeout);
      expectState({ typerState: TyperState.ERASING, repeatCount: 0 });
      jest.advanceTimersByTime(eraseTimeout);
      expectState({ typerState: TyperState.TYPING, repeatCount: 1 });

      jest.advanceTimersByTime(typeTimeout);
      expectState({ typerState: TyperState.ERASING, repeatCount: 1 });
      jest.advanceTimersByTime(eraseTimeout);
      expectState({ typerState: TyperState.COMPLETE, repeatCount: 1 });
    });

    it('should run (repeats + 1) * spool.length times', () => {
      const runDelay = preTypeDelay + typeDelay + preEraseDelay + eraseDelay;
      const instance = renderWithOptions(1, true, ['a', 'b']);
      const expectState = testInstance<Typer>(instance);

      jest.advanceTimersByTime(runDelay);
      expectState({ spoolIndex: 1, repeatCount: 0 });
      jest.advanceTimersByTime(runDelay);
      expectState({ spoolIndex: 0, repeatCount: 1 });

      jest.advanceTimersByTime(runDelay);
      expectState({ spoolIndex: 1, repeatCount: 1 });
      jest.advanceTimersByTime(runDelay);
      expectState({ spoolIndex: 1, repeatCount: 1, typerState: TyperState.COMPLETE });
    });
  });
});
