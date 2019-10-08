import parser from 'gitdiff-parser';
import { IParseDiffResult, IHunk, IChange } from '../../types';

export interface IMapOptions {
  nearbySequences?: string;
}

const zipChanges = (changes: IChange[]): IChange[] => {
  const [result] = changes.reduce(
    ([result, last, lastDeletionIndex], current, i) => {
      if (!last) {
        result.push(current);
        return [result, current, current.isDelete ? i : -1];
      }

      if (current.isInsert && lastDeletionIndex >= 0) {
        result.splice(lastDeletionIndex + 1, 0, current);
        // The new `lastDeletionIndex` may be out of range, but `splice` will fix it
        return [result, current, lastDeletionIndex + 2];
      }

      result.push(current);

      // Keep the `lastDeletionIndex` if there are lines of deletions,
      // otherwise update it to the new deletion line
      const newLastDeletionIndex = current.isDelete ? (last.isDelete ? lastDeletionIndex : i) : i;

      return [result, current, newLastDeletionIndex];
    },
    [[], null, -1],
  );

  return result;
};

const mapHunk = (hunk: IHunk, options: IMapOptions): IHunk => {
  const changes = options.nearbySequences === 'zip' ? zipChanges(hunk.changes) : hunk.changes;

  return {
    ...hunk,
    isPlain: false,
    changes,
  };
};

const mapFile = (file: IParseDiffResult, options: IMapOptions): IParseDiffResult => {
  const hunks = file.hunks.map((hunk) => mapHunk(hunk, options));

  return { ...file, hunks };
};

const normalizeDiffText = (text: string): string => {
  if (text.indexOf('diff --git') === 0) {
    return text;
  }

  const indexOfFirstLineBreak = text.indexOf('\n');
  const indexOfSecondLineBreak = text.indexOf('\n', indexOfFirstLineBreak + 1);
  const firstLine = text.slice(0, indexOfFirstLineBreak);
  const secondLine = text.slice(indexOfFirstLineBreak + 1, indexOfSecondLineBreak);
  const oldPath = firstLine.slice(4);
  const newPath = secondLine.slice(4);
  const segments = [`diff --git ${oldPath} ${newPath}`, 'index 1111111..2222222 100644', text];

  return segments.join('\n');
};

export const parseDiff = (text: string, options: IMapOptions = {}): IParseDiffResult[] => {
  const diffText = normalizeDiffText(text);
  const files = parser.parse(diffText);

  return files.map((file) => mapFile(file, options));
};
