import { h } from 'preact';

import './styles/Character.css';

type CharacterStatus = 'untyped' | 'typed' | 'selected' | 'erased';

export interface ICharacterProps {
  value: string;
  status: CharacterStatus;
}

export default function Character({ value, status }: ICharacterProps) {
  return (<span className={`preactyper-char ${status}`}>{value}</span>);
}
