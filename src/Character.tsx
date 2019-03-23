import React from 'react';

import './styles/Character.css';

export const enum CharacterStatus {
  UNTYPED = 'untyped',
  TYPED = 'typed',
  SELECTED = 'selected',
  ERASED = 'erased',
}

export interface ICharacterProps {
  value: string;
  status: CharacterStatus;
}

export default function Character({ value, status }: ICharacterProps) {
  return (<span className={`reactyper-char ${status}`}>{value}</span>);
}
