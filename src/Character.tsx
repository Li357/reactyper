import React from 'react';

import { ICharacterProps } from './types';
import './styles/Character.css';

export default function Character({ value, status }: ICharacterProps) {
  return (<span className={`reactyper-char ${status}`}>{value}</span>);
}
