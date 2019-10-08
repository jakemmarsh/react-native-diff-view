import { TextStyle, ViewStyle } from 'react-native';

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

export interface IFile {
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

export type DiffType = 'add' | 'delete' | 'modify' | 'rename' | 'copy';

export type Side = 'old' | 'new';

export type GutterType = 'default' | 'none' | 'anchor';

export type Widgets = Record<string, JSX.Element>;

export type Events = Record<string, (arg: any) => any>;

export type DiffChildren = (hunks: IHunk[]) => JSX.Element | JSX.Element[];

export interface IGutterOptions {
  change: IChange;
  side: Side;
  inHoverState: boolean;
  textStyle?: TextStyle;
  renderDefault: (style?: TextStyle, textStyle?: ViewStyle) => JSX.Element;
}
