import React from 'react';
import { IHunk, IChange } from 'gitdiff-parser';
import { ViewStyle } from 'react-native';
import { useDiffSettings } from '../../context';
import UnifiedHunk from './unified_hunk';
import SplitHunk from './split_hunk';
import { Widgets, Events } from '../../types';

export interface IHunkProps {
  hunk: IHunk;
  style?: ViewStyle;
  lineStyle?: ViewStyle;
  gutterStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  gutterEvents?: Events;
  codeEvents?: Events;
  widgets?: Widgets;
  onChangePress?: (change: IChange) => any;
}

const Hunk: React.FunctionComponent<IHunkProps> = React.memo(
  ({ hunk, style, ...props }): JSX.Element => {
    const { gutterType, ...context } = useDiffSettings();
    const hideGutter = gutterType === 'none';
    const RenderingHunk = context.viewType === 'unified' ? UnifiedHunk : SplitHunk;

    return <RenderingHunk {...context} {...props} hunk={hunk} hideGutter={hideGutter} style={style} />;
  },
);

Hunk.defaultProps = {
  gutterEvents: {},
  codeEvents: {},
};

export default Hunk;
