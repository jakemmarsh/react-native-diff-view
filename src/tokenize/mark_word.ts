import { INode } from './back_to_tree';
import { replace } from './utils';
import { last } from '../utils/diff/util';

type MarkInPaths = (paths: INode[][]) => INode[];

const markInPaths = (word: string, name: string, replacement: string): MarkInPaths => (paths: INode[][]): INode[] => {
  if (!Array.isArray(paths)) {
    return [];
  }

  return paths.reduce((acc, path) => {
    const leaf = last(path);

    if (!leaf.value.includes(word)) {
      return [path] as INode[];
    }

    const segments = leaf.value.split(word);

    acc.push(
      ...segments.reduce((segmentsAcc, text, i) => {
        if (i !== 0) {
          segmentsAcc.push(replace(path, { type: 'mark', markType: name, value: replacement }));
        }

        if (text) {
          segmentsAcc.push(replace(path, { ...leaf, value: text }));
        }

        return segmentsAcc;
      }, []),
    );

    return acc;
  }, []);
};

export default (word?: string, name?: string, replacement = word): ((lines: INode[][][][]) => INode[][][]) => {
  const mark = markInPaths(word, name, replacement);

  return ([oldLinesOfPaths, newLinesOfPaths]: INode[][][][]) => {
    return [oldLinesOfPaths.map(mark), newLinesOfPaths.map(mark)];
  };
};
