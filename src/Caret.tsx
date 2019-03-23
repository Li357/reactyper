import React from 'react';

import './styles/Caret.css';

export interface ICaretProps {
  animation: string;
}

export default function Caret({ animation }: ICaretProps) {
  return (<span className={`reactyper-caret ${animation}`}></span>);
}
