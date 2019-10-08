declare module 'gitdiff-parser' {
  export interface IChange {
    content?: string;
    isDelete?: boolean;
    isInsert?: boolean;
    isNormal?: boolean;
    lineNumber?: number;
    newLineNumber?: number;
    oldLineNumber?: number;
    type: 'normal' | 'insert' | 'delete';
  }

  export interface IHunk {
    changes: IChange[];
    content: string;
    isPlain: boolean;
    newLines: number;
    newStart: number;
    oldLines: number;
    oldStart: number;
  }

  export interface IParseDiffResult {
    hunks: IHunk[];
    newEndingNewLine: boolean;
    newMode: string;
    newPath: string;
    newRevision: string;
    oldEndingNewLine: boolean;
    oldMode: string;
    oldPath: string;
    oldRevision: string;
    type: 'add' | 'delete' | 'modify' | 'rename' | 'copy';
  }

  declare const Parser: {
    parse: (diffText: string) => IParseDiffResult[];
  };

  export default Parser;
}
