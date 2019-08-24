import { h } from 'preact';

import './styles/Caret.css';

export interface ICaretProps {
  animation: string;
}

export default function Caret({ animation }: ICaretProps) {
  return (<span className={`preactyper-caret ${animation}`}></span>);
}
