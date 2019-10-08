import { IChange, IHunk } from '../../types';
import { computeLineNumberFactory } from './factory';
import { last, findLastIndex } from './util';

const computeOldLineNumber = computeLineNumberFactory('old');

const computeNewLineNumber = computeLineNumberFactory('new');

const getOldRangeFromHunk = ({ oldStart, oldLines }: IHunk): number[] => {
  return [oldStart, oldStart + oldLines - 1];
};

const createHunkFromChanges = (changes: IChange[]): IHunk => {
  if (!changes.length) {
    return null;
  }

  const initial = {
    isPlain: true,
    content: '',
    oldStart: -1,
    oldLines: 0,
    newStart: -1,
    newLines: 0,
  };

  const hunk = changes.reduce((hunk, change) => {
    if (!change.isNormal) {
      hunk.isPlain = false;
    }

    if (!change.isInsert) {
      hunk.oldLines = hunk.oldLines + 1;

      if (hunk.oldStart === -1) {
        hunk.oldStart = computeOldLineNumber(change);
      }
    }

    if (!change.isDelete) {
      hunk.newLines = hunk.newLines + 1;

      if (hunk.newStart === -1) {
        hunk.newStart = computeNewLineNumber(change);
      }
    }

    return hunk;
  }, initial);

  const { oldStart, oldLines, newStart, newLines } = hunk;

  return {
    ...hunk,
    content: `@@ -${oldStart},${oldLines} +${newStart},${newLines}`,
    changes,
  };
};

export const textLinesToHunk = (lines: string[], oldStartLineNumber: number, newStartLineNumber: number): IHunk => {
  const lineToChange = (line: string, index: number): IChange => {
    return {
      type: 'normal',
      isNormal: true,
      oldLineNumber: oldStartLineNumber + index,
      newLineNumber: newStartLineNumber + index,
      content: '' + line,
    };
  };

  const changes = lines.map(lineToChange);

  return createHunkFromChanges(changes);
};

const sliceHunk = (
  { changes }: { changes: IChange[] },
  startOldLineNumber: number,
  endOldLineNumber?: number,
): IHunk => {
  const changeIndex = changes.findIndex((change) => computeOldLineNumber(change) >= startOldLineNumber);

  if (changeIndex === -1) {
    return null;
  }

  // It is possible to have some insert changes before `startOldLineNumber`,
  // since we slice from old line number, these changes can be ommited, so we need to grab them back
  const startIndex = (() => {
    if (changeIndex === 0) {
      return changeIndex;
    }

    const nearestHeadingNormalChangeIndex = findLastIndex(
      changes,
      (change: IChange) => !change.isInsert,
      changeIndex - 1,
    );

    return nearestHeadingNormalChangeIndex === -1 ? changeIndex : nearestHeadingNormalChangeIndex + 1;
  })();

  if (endOldLineNumber === undefined) {
    const slicedChanges = changes.slice(startIndex);

    return createHunkFromChanges(slicedChanges);
  }

  const endIndex = findLastIndex(changes, (change) => computeOldLineNumber(change) <= endOldLineNumber);
  const slicedChanges = changes.slice(startIndex, endIndex === -1 ? undefined : endIndex);

  return createHunkFromChanges(slicedChanges);
};

const mergeHunk = (previousHunk: IHunk, nextHunk: IHunk): IHunk => {
  if (!previousHunk) {
    return nextHunk;
  }

  if (!nextHunk) {
    return previousHunk;
  }

  const [previousStart, previousEnd] = getOldRangeFromHunk(previousHunk);
  const [nextStart, nextEnd] = getOldRangeFromHunk(nextHunk);

  // They are just neighboring, simply concat changes and adjust lines count
  if (previousEnd + 1 === nextStart) {
    return createHunkFromChanges([...previousHunk.changes, ...nextHunk.changes]);
  }

  // It is possible that `previousHunk` entirely **contains** `nextHunk`,
  // and if we are merging a fake hunk with a valid hunk, we need to replace `nextHunk`'s corresponding range
  if (previousStart <= nextStart && previousEnd >= nextEnd) {
    if (previousHunk.isPlain && !nextHunk.isPlain) {
      const head = sliceHunk(previousHunk, previousStart, nextStart);
      const tail = sliceHunk(previousHunk, nextEnd + 1);

      return mergeHunk(mergeHunk(head, nextHunk), tail);
    }

    return previousHunk;
  }

  // The 2 hunks have some overlapping, we need to slice the fake one in order to preserve non-normal changes
  if (previousHunk.isPlain) {
    const head = sliceHunk(previousHunk, previousStart, nextStart);

    return mergeHunk(head, nextHunk);
  }

  const tail = sliceHunk(nextHunk, previousEnd + 1);

  return mergeHunk(previousHunk, tail);
};

const appendOrMergeHunk = (hunks: IHunk[], nextHunk: IHunk): IHunk[] => {
  const lastHunk = last(hunks);

  if (!lastHunk) {
    return [nextHunk];
  }

  const expectedNextStart = lastHunk.oldStart + lastHunk.oldLines;
  const actualNextStart = nextHunk.oldStart;

  if (expectedNextStart < actualNextStart) {
    return hunks.concat(nextHunk);
  }

  const mergedHunk = mergeHunk(lastHunk, nextHunk);

  return [...hunks.slice(0, -1), mergedHunk];
};

export const insertHunk = (hunks: IHunk[], insertion: IHunk): IHunk[] => {
  const insertionOldLineNumber = computeOldLineNumber(insertion.changes[0]);
  const isLaterThanInsertion = ({ changes }: { changes: IChange[] }): boolean => {
    if (!changes.length) {
      return false;
    }

    return computeOldLineNumber(changes[0]) >= insertionOldLineNumber;
  };

  const insertPosition = hunks.findIndex(isLaterThanInsertion);
  const hunksWithInsertion =
    insertPosition === -1
      ? hunks.concat(insertion)
      : [...hunks.slice(0, insertPosition), insertion, ...hunks.slice(insertPosition)];

  return hunksWithInsertion.reduce(appendOrMergeHunk, []);
};
