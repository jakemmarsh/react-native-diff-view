import React from 'react';
import { ViewStyle } from 'react-native';
import { IHunk, IChange, Widgets, Events } from '../../types';
import { useDiffSettings } from '../../context';
import UnifiedHunk from './unified_hunk';

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

    return <UnifiedHunk {...context} {...props} hunk={hunk} hideGutter={hideGutter} style={style} />;
  },
);

Hunk.defaultProps = {
  gutterEvents: {},
  codeEvents: {},
};

export default Hunk;
