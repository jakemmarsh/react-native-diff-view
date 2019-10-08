import React from 'react';
import { TextStyle, Text, View, ViewStyle } from 'react-native';
import { INode } from '../../tokenize/back_to_tree';
import cx from '../../utils/classnames';
import styles from './styles';

const defaultRenderToken = ({ type, value, properties, children }: INode, index: number): JSX.Element | string => {
  const renderWithStyle = (style: TextStyle): JSX.Element => (
    <Text key={index} style={style} numberOfLines={1}>
      {value ? value : children && children.map(defaultRenderToken)}
    </Text>
  );

  switch (type) {
    case 'text': {
      return value;
    }

    default: {
      return renderWithStyle(properties.style as TextStyle);
    }
  }
};

interface ICodeCellProps {
  text: string;
  tokens?: INode[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  renderToken?: (
    token: object,
    renderToken: (token: INode, index: number) => JSX.Element | string,
    index: number,
  ) => JSX.Element | string;
}

const CodeCell: React.FunctionComponent<ICodeCellProps> = React.memo(
  (props): JSX.Element => {
    const { text, tokens, renderToken, style, textStyle, ...attributes } = props;
    const actualRenderToken = renderToken
      ? (token: INode, index: number) => renderToken(token, defaultRenderToken, index)
      : defaultRenderToken;

    return (
      <View style={cx(styles.diffCodeCell, style)} {...attributes}>
        <Text style={cx(styles.diffCodeCellText, textStyle)} numberOfLines={1}>
          {tokens ? (tokens.length ? tokens.map(actualRenderToken) : ' ') : text || ' '}
        </Text>
      </View>
    );
  },
);

CodeCell.defaultProps = {
  tokens: null,
};

export default CodeCell;
