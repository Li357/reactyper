import React from 'react';

import './styles/Character.css';

type CharacterStatus = 'untyped' | 'typed' | 'selected' | 'erased';

export interface ICharacterProps {
  value: string;
  status: CharacterStatus;
}

export default function Character({ value, status }: ICharacterProps) {
  return (<span className={`reactyper-char ${status}`}>{value}</span>);
}
