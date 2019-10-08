import { IHunk, IChange } from '../../types';
import { basicHunk, normalChange, insertChange, deleteChange } from '../../fixtures';
import {
  computeLineNumberFactory,
  isInHunkFactory,
  isBetweenHunksFactory,
  findChangeByLineNumberFactory,
  getCorrespondingLineNumberFactory,
} from '../diff/factory';
import {
  textLinesToHunk,
  insertHunk,
  expandFromRawCode,
  getCollapsedLinesCountBetween,
  expandCollapsedBlockBy,
  getChangeKey,
} from '..';

describe('utils/diff', () => {
  describe('textLinesToHunk', () => {
    test('basic', () => {
      const lines = [''];

      expect(textLinesToHunk(lines, 0, 0)).toMatchSnapshot();
    });
  });

  describe('insertHunk', () => {
    test('basic', () => {
      expect(
        insertHunk([{ changes: [{ isInsert: true, lineNumber: 0, oldLineNumber: 0, type: 'insert' }] } as IHunk], {
          changes: [{ isInsert: true, lineNumber: 1, oldLineNumber: 1, type: 'insert' }],
        } as IHunk),
      ).toEqual([{ changes: [{ isInsert: true, lineNumber: 1, oldLineNumber: 1, type: 'insert' }] }]);
    });
  });

  describe('expandFromRawCode', () => {
    test('basic', () => {
      const hunks = [basicHunk];

      expect(expandFromRawCode(hunks, '')).toMatchSnapshot();
    });
  });

  describe('getCollapsedLinesCountBetween', () => {
    test('empty', () => {
      const previousHunk = {} as IHunk;
      const nextHunk = {} as IHunk;

      expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(NaN);
    });

    test('basic', () => {
      const previousHunk = { oldStart: 1, oldLines: 2 } as IHunk;
      const nextHunk = { oldStart: 10 } as IHunk;

      expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(7);
    });

    test('minus number', () => {
      const previousHunk = { oldStart: 1, oldLines: 10 } as IHunk;
      const nextHunk = { oldStart: 2 } as IHunk;

      expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(-9);
    });

    test('no previousHunk', () => {
      const nextHunk = { oldStart: 2 } as IHunk;

      expect(getCollapsedLinesCountBetween(null, nextHunk)).toBe(1);
    });

    test('throw when nextHunk is null', () => {
      expect(() => getCollapsedLinesCountBetween({} as IHunk, null)).toThrow();
    });
  });

  describe('expandCollapsedBlockBy', () => {
    test('basic', () => {
      const hunks = [basicHunk];
      const noop = (): boolean => true;

      expect(expandCollapsedBlockBy(hunks, '', noop)).toMatchSnapshot();
    });
  });

  describe('getChangeKey', () => {
    test('normal change', () => {
      expect(getChangeKey(normalChange)).toBe('N0');
    });

    test('insert change', () => {
      expect(getChangeKey(insertChange)).toBe('I0');
    });

    test('delete change', () => {
      expect(getChangeKey(deleteChange)).toBe('D0');
    });
  });

  describe('factory', () => {
    test('returns a function', () => {
      expect(typeof (computeLineNumberFactory as any)()).toBe('function');
      expect(typeof (isInHunkFactory as any)()).toBe('function');
      expect(typeof (isBetweenHunksFactory as any)()).toBe('function');
      expect(typeof (findChangeByLineNumberFactory as any)()).toBe('function');
      expect(typeof (getCorrespondingLineNumberFactory as any)()).toBe('function');
    });
  });

  describe('computeLineNumber', () => {
    test('old', () => {
      const computeOldLineNumber = computeLineNumberFactory('old');

      expect(computeOldLineNumber({ isInsert: true } as IChange)).toBe(-1);
      expect(computeOldLineNumber({ isNormal: true, lineNumber: 0, oldLineNumber: 1 } as IChange)).toBe(1);
      expect(computeOldLineNumber({ isNormal: false, lineNumber: 0, oldLineNumber: 1 } as IChange)).toBe(0);
    });

    test('new', () => {
      const computeNewLineNumber = computeLineNumberFactory('new');

      expect(computeNewLineNumber({ isDelete: true } as IChange)).toBe(-1);
      expect(computeNewLineNumber({ isNormal: true, lineNumber: 0, newLineNumber: 1 } as IChange)).toBe(1);
      expect(computeNewLineNumber({ isNormal: false, lineNumber: 0, newLineNumber: 1 } as IChange)).toBe(0);
    });
  });

  describe('isInHunk', () => {
    test('old', () => {
      const isInOldHunk = isInHunkFactory('oldStart', 'oldLines');

      expect(isInOldHunk({ oldStart: 1, oldLines: 2 } as IHunk, 2)).toBe(true);
      expect(isInOldHunk({ oldStart: 1, oldLines: 2 } as IHunk, 3)).toBe(false);
    });

    test('new', () => {
      const isInNewHunk = isInHunkFactory('newStart', 'newLines');

      expect(isInNewHunk({ newStart: 1, newLines: 2 } as IHunk, 2)).toBe(true);
      expect(isInNewHunk({ newStart: 1, newLines: 2 } as IHunk, 3)).toBe(false);
    });
  });

  describe('isBetweenHunks', () => {
    test('old', () => {
      const isOldLineNumberBetweenHunks = isBetweenHunksFactory('oldStart', 'oldLines');

      expect(isOldLineNumberBetweenHunks({ oldStart: 1, oldLines: 2 } as IHunk, { oldStart: 4 } as IHunk, 2)).toBe(
        false,
      );
      expect(isOldLineNumberBetweenHunks({ oldStart: 1, oldLines: 2 } as IHunk, { oldStart: 4 } as IHunk, 3)).toBe(
        true,
      );
    });

    test('new', () => {
      const isNewLineNumberBetweenHunks = isBetweenHunksFactory('newStart', 'newLines');

      expect(isNewLineNumberBetweenHunks({ newStart: 1, newLines: 2 } as IHunk, { newStart: 4 } as IHunk, 2)).toBe(
        false,
      );
      expect(isNewLineNumberBetweenHunks({ newStart: 1, newLines: 2 } as IHunk, { newStart: 4 } as IHunk, 3)).toBe(
        true,
      );
    });
  });

  describe('findChangeByLineNumber', () => {
    test('old', () => {
      const findChangeByLineNumber = findChangeByLineNumberFactory('old');
      const change = { isNormal: true, lineNumber: 0, oldLineNumber: 1 } as IChange;
      const hunk = { oldStart: 1, oldLines: 2, changes: [change] } as IHunk;

      expect(findChangeByLineNumber([hunk], 1)).toBe(change);
      expect(findChangeByLineNumber([hunk], 3)).toBe(undefined);
    });

    test('new', () => {
      const findChangeByLineNumber = findChangeByLineNumberFactory('new');
      const change = { isNormal: true, lineNumber: 0, newLineNumber: 1 } as IChange;
      const hunk = { newStart: 1, newLines: 2, changes: [change] } as IHunk;

      expect(findChangeByLineNumber([hunk], 1)).toBe(change);
      expect(findChangeByLineNumber([hunk], 3)).toBe(undefined);
    });
  });

  describe('getCorrespondingLineNumber', () => {
    test('old', () => {
      // getNewCorrespondingLineNumber is the same
      const getOldCorrespondingLineNumber = getCorrespondingLineNumberFactory('old');
      const hunk = { oldStart: 10, oldLines: 5, newStart: 20, newLines: 5, changes: [] } as IHunk;

      expect(() => getOldCorrespondingLineNumber([], 0)).toThrow();
      expect(getOldCorrespondingLineNumber([hunk], 0)).toBe(10);
      expect(getOldCorrespondingLineNumber([hunk], 20)).toBe(30);

      hunk.changes = [{ isNormal: true, oldLineNumber: 11 } as IChange];
      expect(getOldCorrespondingLineNumber([hunk], 11)).toBe(undefined);

      hunk.changes = [{ isNormal: true, oldLineNumber: 12, newLineNumber: 22 } as IChange];
      expect(getOldCorrespondingLineNumber([hunk], 12)).toBe(22);

      hunk.changes = [{ isInsert: true, lineNumber: 13 } as IChange];
      expect(() => getOldCorrespondingLineNumber([hunk], 13)).toThrow();

      hunk.changes = [{ isDelete: true, lineNumber: 14 } as IChange];
      expect(getOldCorrespondingLineNumber([hunk], 14)).toBe(-1);

      const nextHunk = { oldStart: 20, oldLines: 5, newStart: 30, newLines: 5, changes: [] } as IHunk;

      expect(getOldCorrespondingLineNumber([hunk, nextHunk], 16)).toBe(26);
    });
  });
});
