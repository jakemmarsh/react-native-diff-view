import React from 'react';
import { ViewStyle } from 'react-native';
import { useDiffSettings } from '../../context';
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
    const { gutterType, monotonous } = useDiffSettings();

    return <UnifiedDecoration hideGutter={gutterType === 'none'} monotonous={monotonous} {...props} />;
  },
);

export default Decoration;
