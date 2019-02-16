import React from 'react';
import { configure, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Character from '../../src/Character';
import { ICharacterProps, CharacterStatus } from '../../src/types';

configure({ adapter: new Adapter() });

describe('Character', () => {
  const char = 'a';
  const $ = render<ICharacterProps, {}>(<Character status={CharacterStatus.TYPED} value={char} />);

  it('renders correct status class name', () => {
    expect($.hasClass(CharacterStatus.TYPED)).toBe(true);
  });

  it('renders correct child character', () => {
    expect($.text()).toBe(char);
  });
});
