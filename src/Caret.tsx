import * as React from 'react';

import { ICaretProps } from './types';
import './styles/Caret.css';

export default function Caret({ animation }: ICaretProps) {
  return (<span className={`react-typer-caret ${animation}`}></span>);
}
