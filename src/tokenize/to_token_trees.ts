import { IHunk, IChange, Side } from '../types';
import { INode } from './back_to_tree';
import { computeOldLineNumber, computeNewLineNumber } from '../utils';
import { last } from '../utils/diff/util';

// This function mutates `linesOfCode` argument.
const applyHunk = (linesOfCode: string[], { newStart, changes }: IHunk): string[] => {
  // Within each hunk, changes are continous, so we can use a sequential algorithm here.
  //
  // When `linesOfCode` is received here, it has already patched by previous hunk,
  // thus the starting line number has changed due to possible unbanlanced deletions and insertions,
  // we should use `newStart` as the first line number of current reduce.
  const [patchedLines] = changes.reduce(
    ([lines, cursor], { content, isInsert, isDelete }) => {
      if (isDelete) {
        lines.splice(cursor, 1);
        return [lines, cursor];
      }

      if (isInsert) {
        lines.splice(cursor, 0, content);
      }

      return [lines, cursor + 1];
    },
    [linesOfCode, newStart - 1],
  );

  return patchedLines;
};

const applyDiff = (oldSource: string, hunks: IHunk[]): string => {
  // `hunks` must be ordered here.
  const patchedLines = hunks.reduce(applyHunk, oldSource.split('\n'));

  return patchedLines.join('\n');
};

const mapChanges = (changes: IChange[], side: Side, toValue: (change: IChange) => any): IChange[] => {
  if (!changes.length) {
    return [];
  }

  const computeLineNumber = side === 'old' ? computeOldLineNumber : computeNewLineNumber;
  const changesByLineNumber = changes.reduce(
    (acc, change) => {
      acc[computeLineNumber(change)] = change;
      return acc;
    },
    {} as Record<number, IChange>,
  );
  const maxLineNumber = computeLineNumber(last(changes));

  return Array.from({ length: maxLineNumber }).map((_value, i) => toValue(changesByLineNumber[i + 1]));
};

const groupChanges = (hunks: IHunk[]): IChange[][] => {
  const changes = hunks.reduce((acc, hunk) => {
    acc.push(...hunk.changes);
    return acc;
  }, []);

  return changes.reduce(
    ([oldChanges, newChanges], change) => {
      if (change.isNormal) {
        oldChanges.push(change);
        newChanges.push(change);
      } else if (change.isDelete) {
        oldChanges.push(change);
      } else {
        newChanges.push(change);
      }

      return [oldChanges, newChanges];
    },
    [[], []],
  );
};

const toTextPair = (hunks: IHunk[]): [string, string] => {
  const toText = (change: IChange): string => (change ? change.content : '');
  const [oldChanges, newChanges] = groupChanges(hunks);
  const oldText = mapChanges(oldChanges, 'old', toText).join('\n');
  const newText = mapChanges(newChanges, 'new', toText).join('\n');

  return [oldText, newText];
};

const createRoot = (children: INode[]): INode => ({ type: 'root', children });

export default (hunks: IHunk[], { highlight, refractor, oldSource, language }: any): INode[] => {
  if (oldSource) {
    const newSource = applyDiff(oldSource, hunks);
    const highlightText = highlight
      ? (text: string, language: string) => refractor.highlight(text, language)
      : (text: string) => [{ type: 'text', value: text }];

    return [createRoot(highlightText(oldSource, language)), createRoot(highlightText(newSource, language))];
  }

  const textPair = toTextPair(hunks);
  const toTree = highlight
    ? (text: string) => createRoot(refractor.highlight(text, language))
    : (text: string) => createRoot([{ type: 'text', value: text }]);

  return textPair.map(toTree);
};
