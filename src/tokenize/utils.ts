import { INode } from './back_to_tree';
import { last } from '../utils/diff/util';

export const clone = (path: INode[]): INode[] => path.map((node) => ({ ...node }));

export const replace = (path: INode[], leaf: INode): INode[] => [...clone(path.slice(0, -1)), leaf];

export const wrap = (path: INode[], parent: INode): INode[] => [parent, ...clone(path)];

export const split = (path: INode[], splitStart: number, splitEnd: number, wrapSplitNode?: INode): INode[][] => {
  const parents = path.slice(0, -1);
  const leaf = last(path);
  const output = [];

  if (splitEnd <= 0 || splitStart >= leaf.value.length) {
    return [path];
  }

  const split = (start: number, end?: number): INode[] => {
    const value = leaf.value.slice(start, end);

    return [...parents, { ...leaf, value }];
  };

  if (splitStart > 0) {
    const head = split(0, splitStart);

    output.push(clone(head));
  }

  const body = split(Math.max(splitStart, 0), splitEnd);

  output.push(wrapSplitNode ? wrap(body, wrapSplitNode) : clone(body));

  if (splitEnd < leaf.value.length) {
    const tail = split(splitEnd);

    output.push(clone(tail));
  }

  return output;
};
