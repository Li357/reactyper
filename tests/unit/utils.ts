import { Component } from 'react';
import { ShallowWrapper } from 'enzyme';

export function testInstance<C extends Component>(instance: ShallowWrapper<C['props'], C['state'], C>) {
  return function expectState(expectMap: Partial<C['state']>) {
    Object.keys(expectMap).forEach((key) => {
      expect(instance.state(key)).toBe(expectMap[key as keyof C['state']]);
    });
  };
}
