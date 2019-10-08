import { IChange, IHunk } from '../types';
import { diff_match_patch as DiffMatchPatch, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } from 'diff-match-patch';
import pickRanges from './pick_ranges';
import { last, flatten } from '../utils/diff/util';
import { INode } from './back_to_tree';

type Diff = [number, string];

export interface IEdit {
  type: string;
  lineNumber: number;
  start: number;
  length: number;
}

const findChangeBlocks = (changes: IChange[]): IChange[][] => {
  const start = changes.findIndex((change) => !change.isNormal);

  if (start === -1) {
    return [];
  }

  const end = [...changes.slice(start)].findIndex((change) => change.isNormal);

  if (end === -1) {
    return [changes.slice(start)];
  }

  return [changes.slice(start, end), ...findChangeBlocks(changes.slice(end))];
};

const groupDiffs = (diffs: Diff[]): Diff[][] =>
  diffs.reduce(
    ([oldDiffs, newDiffs], diff) => {
      const [type] = diff;

      switch (type) {
        case DIFF_INSERT:
          newDiffs.push(diff);
          break;
        case DIFF_DELETE:
          oldDiffs.push(diff);
          break;
        default:
          oldDiffs.push(diff);
          newDiffs.push(diff);
          break;
      }

      return [oldDiffs, newDiffs];
    },
    [[], []],
  );

const splitDiffToLines = (diffs: Diff[]): Diff[][] =>
  diffs.reduce(
    (lines, [type, value]) => {
      const currentLines = value.split('\n');
      const [currentLineRemaining, ...nextLines] = currentLines.map((line) => [type, line]);
      const next = [...lines.slice(0, -1), [...last(lines), currentLineRemaining], ...nextLines.map((line) => [line])];

      return next;
    },
    [[]],
  );

const diffsToEdits = (diffs: Diff[], lineNumber: number): IEdit[] => {
  const output = diffs.reduce(
    (acc, diff) => {
      const { edits, start } = acc;
      const [type, value] = diff;

      if (type !== DIFF_EQUAL) {
        const edit = {
          type: 'edit',
          lineNumber,
          start,
          length: value.length,
        };

        edits.push(edit);
      }

      return {
        edits,
        start: start + value.length,
      };
    },
    { edits: [], start: 0 },
  );

  return output.edits;
};

const convertToLinesOfEdits = (linesOfDiffs: Diff[][], startLineNumber: number): IEdit[][] => {
  return linesOfDiffs.reduce(
    (acc, diffs, index) => {
      acc.push(diffsToEdits(diffs, startLineNumber + index));

      return acc;
    },
    [] as IEdit[][],
  );
};

const diffText = (a: string, b: string): Diff[][] => {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(a, b);

  dmp.diff_cleanupSemantic(diffs);

  if (diffs.length <= 1) {
    return [[], []];
  }

  return groupDiffs(diffs);
};

const diffChangeBlock = (changes: IChange[]): { oldEdits: any[]; newEdits: any[] } => {
  const [oldSource, newSource] = changes.reduce(
    ([oldSource, newSource], { isDelete, content }) =>
      isDelete
        ? [oldSource + (oldSource ? '\n' : '') + content, newSource]
        : [oldSource, newSource + (newSource ? '\n' : '') + content],
    ['', ''],
  );

  const [oldDiffs, newDiffs] = diffText(oldSource, newSource);

  if (oldDiffs.length === 0 && newDiffs.length === 0) {
    return {
      oldEdits: oldDiffs,
      newEdits: newDiffs,
    };
  }

  const getLineNumber = (change: IChange): number => change && change.lineNumber;

  const oldStartLineNumber = getLineNumber(changes.find((change) => change.isDelete));
  const newStartLineNumber = getLineNumber(changes.find((change) => change.isInsert));
  const oldEdits = convertToLinesOfEdits(splitDiffToLines(oldDiffs), oldStartLineNumber);
  const newEdits = convertToLinesOfEdits(splitDiffToLines(newDiffs), newStartLineNumber);

  return {
    oldEdits,
    newEdits,
  };
};

const diffByLine = (changes: IChange[]): { oldEdits: IEdit[]; newEdits: IEdit[]; previousChange: IChange } => {
  return changes.reduce(
    ({ oldEdits, newEdits, previousChange }, currentChange) => {
      if (!previousChange.isDelete || !currentChange.isInsert) {
        return { oldEdits, newEdits, previousChange: currentChange };
      }

      const [oldDiffs, newDiffs] = diffText(previousChange.content, currentChange.content);

      return {
        oldEdits: oldEdits.concat(diffsToEdits(oldDiffs, previousChange.lineNumber)),
        newEdits: newEdits.concat(diffsToEdits(newDiffs, currentChange.lineNumber)),
        previousChange: currentChange,
      };
    },
    {
      oldEdits: [],
      newEdits: [],
      previousChange: {} as IChange,
    },
  );
};

export default (hunks: IHunk[], { type = 'block' } = {}): ((nodes: INode[][][]) => INode[][][]) => {
  const findEdits = type === 'block' ? diffChangeBlock : diffByLine;
  const changeBlocks = hunks.reduce((acc, hunk) => {
    acc.push(...findChangeBlocks(hunk.changes));
    return acc;
  }, []);

  const { oldEdits, newEdits } = changeBlocks
    .map((edits) => findEdits(edits))
    .reduce(
      ({ oldEdits, newEdits }, { oldEdits: currentOld, newEdits: currentNew }) => {
        return {
          oldEdits: oldEdits.concat(currentOld),
          newEdits: newEdits.concat(currentNew),
        };
      },
      { oldEdits: [], newEdits: [] },
    );

  return pickRanges(flatten(oldEdits), flatten(newEdits));
};
