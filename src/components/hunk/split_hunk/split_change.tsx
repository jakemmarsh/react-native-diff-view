import React, { useState, useCallback, useMemo } from 'react';
import { IChange } from 'gitdiff-parser';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { Side, Events, IGutterOptions } from '../../../types';
import { INode } from '../../../tokenize/back_to_tree';
import { composeCallback, renderDefaultBy } from '../utils';
import cx from '../../../utils/classnames';
import CodeCell from '../code_cell';
import styles from '../styles';

const useCallbackOnSide = (
  side: Side,
  setHover: (side: Side) => any,
  change: IChange,
  customCallbacks: Events,
): Events => {
  const markHover = useCallback(() => setHover(side), [side, setHover]);
  const unmarkHover = useCallback(() => setHover(null), [setHover]);
  const arg = { side, change };

  // Unlike selectors, hooks do not provide native functionality to customize comparator,
  // on realizing that this does not reduce amount of renders, only preventing duplicate merge computations,
  // we decide not to optimize this extremely, leave it recomputed on certain rerenders.
  const callbacks = useMemo(() => {
    const output: Events = Object.keys(callbacks).reduce((acc, key) => {
      (acc as any)[key] = (fn: (arg: any) => any) => () => fn(arg);
      return acc;
    }, {});

    output.onMouseEnter = composeCallback(markHover, output.onMouseEnter);
    output.onMouseLeave = composeCallback(unmarkHover, output.onMouseLeave);

    return output;
  }, [change, customCallbacks, markHover, unmarkHover]);

  return callbacks;
};

interface IRenderCellArgs {
  change: IChange;
  side: Side;
  tokens: INode[];
  gutterStyle?: ViewStyle;
  codeStyle?: ViewStyle;
  gutterEvents?: Events;
  codeEvents?: Events;
  hideGutter: boolean;
  hover: boolean;
  renderToken?: (token: INode) => JSX.Element;
  renderGutter?: (options: IGutterOptions) => JSX.Element;
  onChangePress?: (change: IChange) => any;
}

const renderCells = (args: IRenderCellArgs): JSX.Element => {
  const {
    change,
    side,
    tokens,
    gutterStyle,
    codeStyle,
    gutterEvents,
    codeEvents,
    hideGutter,
    hover,
    renderToken,
    renderGutter,
    onChangePress,
  } = args;

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

  if (!change) {
    return (
      <React.Fragment>
        {!hideGutter && <View key="gutter" style={computedGutterStyle} />}
        <View key="code" style={codeStyle} />
      </React.Fragment>
    );
  }

  const { content } = change;
  const gutterOptions = {
    change,
    side,
    inHoverState: hover,
    renderDefault: renderDefaultBy(change, side),
  };
  const gutterProps = {
    style: gutterStyle,
    children: renderGutter(gutterOptions),
    ...gutterEvents,
  };

  return (
    <TouchableOpacity disabled={!onChangePress} activeOpacity={0.65} onPress={() => onChangePress(change)}>
      {!hideGutter && <View key="gutter" {...gutterProps} />}
      <CodeCell
        key="code"
        style={computedCodeStyle}
        text={content}
        tokens={tokens}
        renderToken={renderToken}
        {...codeEvents}
      />
    </TouchableOpacity>
  );
};

interface ISplitChangeProps {
  monotonous: boolean;
  oldSelected: boolean;
  newSelected: boolean;
  oldTokens: INode[];
  newTokens: INode[];
  oldChange: IChange;
  newChange: IChange;
  style?: ViewStyle;
  gutterStyle?: ViewStyle;
  codeStyle?: ViewStyle;
  gutterEvents?: Events;
  codeEvents?: Events;
  hideGutter: boolean;
  renderToken?: (token: INode) => JSX.Element;
  renderGutter?: (options: IGutterOptions) => JSX.Element;
}

const SplitChange: React.FunctionComponent<ISplitChangeProps> = React.memo(
  (props): JSX.Element => {
    const {
      style,
      gutterStyle,
      codeStyle,
      gutterEvents,
      codeEvents,
      oldChange,
      newChange,
      oldSelected,
      newSelected,
      oldTokens,
      newTokens,
      monotonous,
      hideGutter,
      renderToken,
      renderGutter,
    } = props;

    const [hover, setHover] = useState('');
    const oldGutterEvents = useCallbackOnSide('old', setHover, oldChange, gutterEvents);
    const newGutterEvents = useCallbackOnSide('new', setHover, newChange, gutterEvents);
    const oldCodeEvents = useCallbackOnSide('old', setHover, oldChange, codeEvents);
    const newCodeEvents = useCallbackOnSide('new', setHover, newChange, codeEvents);
    const commons = {
      monotonous,
      hideGutter,
      gutterStyle,
      codeStyle,
      gutterEvents,
      codeEvents,
      renderToken,
      renderGutter,
    };
    const oldArgs = {
      ...commons,
      change: oldChange,
      side: 'old' as Side,
      selected: oldSelected,
      tokens: oldTokens,
      gutterEvents: oldGutterEvents,
      codeEvents: oldCodeEvents,
      hover: hover === 'old',
    };
    const newArgs = {
      ...commons,
      change: newChange,
      side: 'new' as Side,
      selected: newSelected,
      tokens: newTokens,
      gutterEvents: newGutterEvents,
      codeEvents: newCodeEvents,
      hover: hover === 'new',
    };

    if (monotonous) {
      return <View style={style}>{renderCells(oldChange ? oldArgs : newArgs)}</View>;
    }

    return (
      <View style={style}>
        {renderCells(oldArgs)}
        {renderCells(newArgs)}
      </View>
    );
  },
);

SplitChange.defaultProps = {
  oldTokens: null,
  newTokens: null,
};

export default SplitChange;
