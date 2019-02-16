import { Component } from 'react';
import { ShallowWrapper } from 'enzyme';

export function testInstance<C extends Component>(instance: ShallowWrapper<C['props'], C['state'], C>) {
  return function expectState(expectMap: Partial<C['state']>) {
    Object.keys(expectMap).forEach((key) => {
      expect(expectMap[key as keyof C['state']]).toBe(instance.state(key));
    });
  };
}
