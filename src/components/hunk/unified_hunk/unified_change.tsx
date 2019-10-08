import React, { useMemo, useCallback, useState } from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { IChange } from 'gitdiff-parser';
import { Side, Events, IGutterOptions } from '../../../types';
import { INode } from '../../../tokenize/back_to_tree';
import { composeCallback, renderDefaultBy } from '../utils';
import cx from '../../../utils/classnames';
import CodeCell from '../code_cell';
import styles from '../styles';

const useBoundCallbacks = (callbacks: Events, arg: any, hoverOn: () => any, hoverOff: () => any): Events =>
  useMemo(() => {
    const output: Events = Object.keys(callbacks).reduce((acc, key) => {
      (acc as any)[key] = (fn: (arg: any) => any) => () => fn(arg);
      return acc;
    }, {});

    output.onMouseEnter = composeCallback(hoverOn, output.onMouseEnter);
    output.onMouseLeave = composeCallback(hoverOff, output.onMouseLeave);

    return output;
  }, [callbacks, arg, hoverOn, hoverOff]);

const useBoolean = (): [boolean, () => void, () => void] => {
  const [value, setValue] = useState(false);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);

  return [value, on, off];
};

const renderGutterCell = (
  style: ViewStyle,
  change: IChange,
  side: Side,
  events: Events,
  inHoverState: boolean,
  renderGutter: (options: IGutterOptions) => JSX.Element,
): JSX.Element => {
  const gutterOptions: IGutterOptions = {
    change,
    side,
    inHoverState,
    textStyle: styles.diffGutterText,
    renderDefault: renderDefaultBy(change, side),
  };

  return (
    <View style={cx(styles.diffGutter, style)} {...events}>
      {renderGutter(gutterOptions)}
    </View>
  );
};

interface IUnifiedChangeProps {
  change: IChange;
  selected: boolean;
  tokens: INode[];
  style?: ViewStyle;
  gutterStyle?: ViewStyle;
  codeStyle?: ViewStyle;
  gutterEvents?: Events;
  codeEvents?: Events;
  hideGutter: boolean;
  renderGutter: (options: IGutterOptions) => JSX.Element;
  renderToken?: (token: INode) => JSX.Element;
  onChangePress?: (change: IChange) => any;
}

const UnifiedChange: React.FunctionComponent<IUnifiedChangeProps> = React.memo((props) => {
  const {
    change,
    tokens,
    style,
    gutterStyle,
    codeStyle,
    gutterEvents,
    codeEvents,
    hideGutter,
    renderToken,
    renderGutter,
    onChangePress,
  } = props;
  const { content } = change;
  const [hover, hoverOn, hoverOff] = useBoolean();
  const eventArg = useMemo(() => ({ change }), [change]);
  const boundGutterEvents = useBoundCallbacks(gutterEvents, eventArg, hoverOn, hoverOff);
  const boundCodeEvents = useBoundCallbacks(codeEvents, eventArg, hoverOn, hoverOff);
  const computedGutterStyle = cx(
    gutterStyle,
    [styles.diffGutterInsert, change.type === 'insert'],
    [styles.diffGutterDelete, change.type === 'delete'],
  );
  const computedCodeStyle = cx(
    codeStyle,
    [styles.diffCodeCellInsert, change.type === 'insert'],
    [styles.diffCodeCellDelete, change.type === 'delete'],
  );

  return (
    <TouchableOpacity
      style={cx(styles.diffUnifiedChange, style)}
      disabled={!onChangePress}
      activeOpacity={0.65}
      onPress={() => onChangePress(change)}
    >
      {!hideGutter && renderGutterCell(computedGutterStyle, change, 'old', boundGutterEvents, hover, renderGutter)}
      {!hideGutter && renderGutterCell(computedGutterStyle, change, 'new', boundGutterEvents, hover, renderGutter)}
      <CodeCell
        style={computedCodeStyle}
        text={content}
        tokens={tokens}
        renderToken={renderToken}
        {...boundCodeEvents}
      />
    </TouchableOpacity>
  );
});

UnifiedChange.defaultProps = {
  tokens: null,
};

export default UnifiedChange;
