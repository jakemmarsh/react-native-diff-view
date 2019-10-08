import { Side } from '../../types';

export type StartProperty = 'oldStart' | 'newStart';
export type LinesProperty = 'oldLines' | 'newLines';

export const first = <P>(array: P[]): P => array[0];

export const last = <P>(array: P[]): P => array[array.length - 1];

export const sideToProperty = (side: Side): [StartProperty, LinesProperty] => [
  (side + 'Start') as StartProperty,
  (side + 'Lines') as LinesProperty,
];

export const findLastIndex = <P>(arr: P[], checker: (arg: P) => boolean, fromIndex = arr.length - 1): number => {
  let currIndex = -1;

  for (let i = fromIndex; i > -1; i--) {
    if (checker(arr[i]) && i > currIndex) {
      currIndex = i;
    }
  }

  return currIndex;
};

export const flatten = <P>(list: P[]): P[] => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
