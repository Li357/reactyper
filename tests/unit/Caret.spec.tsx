import React from 'react';
import { configure, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Caret, { ICaretProps } from '../../src/Caret';
import { CaretAnimationStyle } from '../../src/Typer';

configure({ adapter: new Adapter() });

describe('Caret', () => {
  it('renders correct animation class name', () => {
    const instance = render<ICaretProps, {}>(<Caret animation={CaretAnimationStyle.SOLID} />);
    expect(instance.hasClass(CaretAnimationStyle.SOLID)).toBe(true);
  });
});
