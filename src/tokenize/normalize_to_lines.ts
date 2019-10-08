import { INode } from './back_to_tree';
import { clone, replace } from './utils';
import { last } from '../utils/diff/util';

const treeToPathList = (node: INode, output: INode[][] = [], path: INode[] = []): INode[][] => {
  const nodeToUse = { ...node };

  delete nodeToUse.children;

  if (node.children) {
    path.push(nodeToUse);

    for (const child of node.children) {
      treeToPathList(child, output, path);
    }

    path.pop();
  } else {
    output.push(clone([...path.slice(1), nodeToUse]));
  }

  return output;
};

const splitPathToLines = (path: INode[]): INode[][] => {
  const leaf = last(path);

  if (!leaf.value.includes('\n')) {
    return [path];
  }

  const linesOfText: string[] = leaf.value.split('\n');

  return linesOfText.map((line) => replace(path, { ...leaf, value: line }));
};

const splitByLineBreak = (paths: INode[][]): INode[][] =>
  paths.reduce(
    (lines, path) => {
      const currentLine = last(lines);
      const [currentRemaining, ...nextLines] = splitPathToLines(path);

      return [...lines.slice(0, -1), [...currentLine, currentRemaining], ...nextLines.map((path) => [path])];
    },
    [[]],
  );

export default (tree: INode): INode[][] => {
  const paths = treeToPathList(tree);
  const linesOfPaths = splitByLineBreak(paths);

  return linesOfPaths;
};
