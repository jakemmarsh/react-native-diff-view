import React from 'react';
import { View } from 'react-native';
import { IDecorationProps } from '.';
import cx from '../../utils/classnames';
import styles from './styles';

export const UnifiedDecoration: React.FunctionComponent<IDecorationProps> = React.memo(
  (props): JSX.Element => {
    const computedStyle = cx(styles.diffDecoration, props.style);
    const computedGutterStyle = cx(styles.diffDecorationGutter, props.gutterStyle);
    const computedContentStyle = cx(styles.diffDecorationContent, props.contentStyle);

    // One element spans all gutter and content cells
    if (React.Children.count(props.children) === 1) {
      return (
        <View style={computedStyle}>
          <View style={computedContentStyle}>{props.children}</View>
        </View>
      );
    }

    const [gutter, content] = props.children as [React.ReactNode, React.ReactNode];

    return (
      <View style={computedStyle}>
        {!props.hideGutter && <View style={computedGutterStyle}>{gutter}</View>}
        <View style={computedContentStyle}>{content}</View>
      </View>
    );
  },
);

export default UnifiedDecoration;
