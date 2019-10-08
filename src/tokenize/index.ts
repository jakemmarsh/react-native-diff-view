import { IHunk } from 'gitdiff-parser';
import toTokenTrees from './to_token_trees';
import normalizeToLines from './normalize_to_lines';
import backToTree, { INode } from './back_to_tree';

export interface ITokenizeOptions {
  highlight?: boolean;
  refractor?: any;
  oldSource?: any;
  language?: any;
  enhancers?: any[];
}

function flow(funcs: any[]): any {
  const length = funcs ? funcs.length : 0;
  let index = length;

  while (index--) {
    if (typeof funcs[index] !== 'function') {
      throw new TypeError('Expected a function');
    }
  }

  function doFlow(this: typeof doFlow, ...args: any[]): any {
    let index = 0;
    let result = length ? funcs[index].apply(this, args) : args[0];

    while (++index < length) {
      result = funcs[index].call(this, result);
    }

    return result;
  }

  return doFlow;
}

export const tokenize = (hunks: IHunk[], options: ITokenizeOptions): { old: INode[]; new: INode[] } => {
  const { highlight = false, refractor, oldSource, language, enhancers = [] } = options;

  const tokenTreesPair = toTokenTrees(hunks, { highlight, refractor, oldSource, language });
  const linesOfPathsPair = tokenTreesPair.map(normalizeToLines);

  const enhance = flow(enhancers);
  const enhancedLinesOfPathsPair = enhance(linesOfPathsPair);
  const [oldTrees, newTrees] = enhancedLinesOfPathsPair.map((paths: any) => paths.map(backToTree));

  return {
    old: oldTrees.map((root: any) => root.children),
    new: newTrees.map((root: any) => root.children),
  };
};

export { default as pickRanges } from './pick_ranges';

export { default as markEdits } from './mark_edits';

export { default as markWord } from './mark_word';
