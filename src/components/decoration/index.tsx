import React from 'react';
import { ViewStyle } from 'react-native';
import { useDiffSettings } from '../../context';
import SplitDecoration from './split_decoration';
import UnifiedDecoration from './unified_decoration';

export interface IDecorationProps {
  children: React.ReactNode | React.ReactNode[];
  hideGutter: boolean;
  monotonous: boolean;
  style?: ViewStyle;
  gutterStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Decoration: React.FunctionComponent<IDecorationProps> = React.memo(
  (props): JSX.Element => {
    const { viewType, gutterType, monotonous } = useDiffSettings();
    const RenderingDecoration = viewType === 'split' ? SplitDecoration : UnifiedDecoration;

    return <RenderingDecoration hideGutter={gutterType === 'none'} monotonous={monotonous} {...props} />;
  },
);

export default Decoration;
