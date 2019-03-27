import React from 'react';
import { configure, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Character, { ICharacterProps } from '../../src/Character';

configure({ adapter: new Adapter() });

describe('Character', () => {
  const char = 'a';
  const $ = render<ICharacterProps, {}>(<Character status="typed" value={char} />);

  it('renders correct status class name', () => {
    expect($.hasClass('typed')).toBe(true);
  });

  it('renders correct child character', () => {
    expect($.text()).toBe(char);
  });
});
