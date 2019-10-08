import { TextProperties } from 'react-native';
import { last } from '../utils/diff/util';

export interface INode {
  children?: INode[];
  markType?: string;
  type?: string;
  value?: string;
  properties?: TextProperties;
}

const areNodesMeregable = (x: INode, y: INode): boolean => {
  if (x.type !== y.type) {
    return false;
  }

  if (x.type === 'text') {
    return true;
  }

  if (!x.children || !y.children) {
    return false;
  }

  const xBase = { ...x };

  delete xBase.children;

  const yBase = { ...y };

  delete yBase.children;

  return Object.keys(xBase).every((key) => {
    return xBase[key as keyof typeof x] === yBase[key as keyof typeof y];
  });
};

const mergeNode = (x: INode, y: INode): INode => {
  if ('value' in x) {
    return {
      ...x,
      value: x.value + y.value,
    };
  }

  return x;
};

const attachNode = (parent: INode, node: INode): INode => {
  const previousSibling = last(parent.children);

  if (previousSibling && areNodesMeregable(previousSibling, node)) {
    parent.children[parent.children.length - 1] = mergeNode(previousSibling, node);
  } else {
    parent.children.push(node);
  }

  return last(parent.children);
};

export default (pathList: INode[][]): INode => {
  const root: INode = { type: 'root', children: [] };

  for (const path of pathList) {
    path.reduce((parent, node, i) => {
      const nodeToUse = i === path.length - 1 ? { ...node } : { ...node, children: [] };

      return attachNode(parent, nodeToUse);
    }, root);
  }

  return root;
};
