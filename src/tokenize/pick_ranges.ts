import { last } from '../utils/diff/util';
import { split } from './utils';
import { INode } from './back_to_tree';

interface IRange {
  length: number;
  lineNumber: number;
  start: number;
  type: string;
  properties?: object;
}

const splitPathToEncloseRange = (paths: INode[][], { type, start, length, properties }: IRange): INode[][] => {
  const { output } = paths.reduce(
    ({ output, nodeStart }, path) => {
      const leaf = last(path);
      const nodeEnd = nodeStart + leaf.value.length;
      const rangeEnd = start + length;

      if (nodeStart > rangeEnd || nodeEnd < start) {
        output.push(path);
      } else {
        const wrapNode = { type, ...properties };
        const segments = split(path, start - nodeStart, rangeEnd - nodeStart, wrapNode);

        output.push(...segments);
      }

      return { output, nodeStart: nodeEnd };
    },
    {
      output: [] as INode[][],
      nodeStart: 0,
    },
  );

  return output;
};

const pickRangesFromPath = (paths: INode[], ranges: IRange[]): any[] => {
  if (!ranges || ranges.length === 0) {
    return paths;
  }

  return (ranges as any).reduce(splitPathToEncloseRange, paths);
};

const process = (linesOfPaths: INode[][], ranges: IRange[]): INode[][] => {
  const rangesByLine = ranges.reduce(
    (acc, range) => {
      if (!acc[range.lineNumber]) {
        acc[range.lineNumber] = [];
      }

      acc[range.lineNumber].push(range);
      return acc;
    },
    {} as Record<number, IRange[]>,
  );

  return linesOfPaths.map((line, i) => pickRangesFromPath(line, rangesByLine[i + 1]));
};

export default (oldRanges: IRange[], newRanges: IRange[]) => ([oldLinesOfPaths, newLinesOfPaths]: INode[][][]) => [
  process(oldLinesOfPaths, oldRanges),
  process(newLinesOfPaths, newRanges),
];
