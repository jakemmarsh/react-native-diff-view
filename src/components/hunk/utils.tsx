import React from 'react';
import { Text, TextStyle } from 'react-native';
import { IChange, Side } from '../../types';
import { computeOldLineNumber, computeNewLineNumber } from '../../utils';

export const renderDefaultBy = (change: IChange, side: Side): ((style: TextStyle) => JSX.Element) => (
  style: TextStyle,
): JSX.Element => {
  const lineNumber = side === 'old' ? computeOldLineNumber(change) : computeNewLineNumber(change);

  return (
    <Text style={style} numberOfLines={1}>
      {lineNumber === -1 ? undefined : lineNumber}
    </Text>
  );
};

export const composeCallback = (own: (evt: any) => any, custom?: (evt: any) => any): ((evt: any) => any) => {
  if (custom) {
    return (evt) => {
      own(evt);
      custom(evt);
    };
  }

  return own;
};
