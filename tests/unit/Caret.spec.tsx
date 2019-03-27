import React from 'react';
import { configure, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Caret, { ICaretProps } from '../../src/Caret';

configure({ adapter: new Adapter() });

describe('Caret', () => {
  it('renders correct animation class name', () => {
    const instance = render<ICaretProps, {}>(<Caret animation="solid" />);
    expect(instance.hasClass('solid')).toBe(true);
  });
});
