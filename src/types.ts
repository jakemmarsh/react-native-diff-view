import { IHunk, IChange } from 'gitdiff-parser';
import { TextStyle, ViewStyle } from 'react-native';

export type DiffType = 'add' | 'delete' | 'modify' | 'rename' | 'copy';

export type Side = 'old' | 'new';

export type ViewType = 'unified' | 'split';

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
