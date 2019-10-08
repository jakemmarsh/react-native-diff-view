import React from 'react';
import { IChange } from 'gitdiff-parser';
import { View } from 'react-native';
import { Widgets } from '../../../types';
import { getChangeKey, computeOldLineNumber, computeNewLineNumber } from '../../../utils';
import SplitChange from './split_change';
import SplitWidget from './split_widget';
import { IHunkProps } from '..';

type ChangeRow = ['change', string, IChange, IChange];
type WidgetRow = ['widget', string, JSX.Element, JSX.Element];
type Row = ChangeRow | WidgetRow;

const keyForPair = (x: IChange, y: IChange): string => {
  const keyForX = x ? getChangeKey(x) : '00';
  const keyForY = y ? getChangeKey(y) : '00';

  return keyForX + keyForY;
};

const groupElements = (changes: IChange[], widgets: Widgets): Row[] => {
  const findWidget = (change: IChange): JSX.Element => {
    if (!change) {
      return null;
    }

    const key = getChangeKey(change);

    return widgets[key] || null;
  };

  const elements: Row[] = [];

  // This could be a very complex reduce call, use `for` loop seems to make it a little more readable
  for (let i = 0; i < changes.length; i++) {
    const current = changes[i];

    // A normal change is displayed on both side
    if (current.isNormal) {
      elements.push(['change', keyForPair(current, current), current, current]);
    } else if (current.isDelete) {
      const next = changes[i + 1];

      // If an insert change is following a elete change, they should be displayed side by side
      if (next && next.isInsert) {
        i = i + 1;
        elements.push(['change', keyForPair(current, next), current, next]);
      } else {
        elements.push(['change', keyForPair(current, null), current, null]);
      }
    } else {
      elements.push(['change', keyForPair(null, current), null, current]);
    }

    const rowChanges = elements[elements.length - 1] as ChangeRow;
    const [oldWidget, newWidget] = [rowChanges[2], rowChanges[3]].map((change) => findWidget(change));

    if (oldWidget || newWidget) {
      const key = rowChanges[1];

      elements.push(['widget', key, oldWidget, newWidget]);
    }
  }

  return elements;
};

const renderRow = ([type, key, oldValue, newValue]: Row, props: any): JSX.Element => {
  const { selectedChanges, monotonous, hideGutter, tokens, lineStyle, ...changeProps } = props;

  if (type === 'change') {
    const oldSelected = oldValue ? selectedChanges.includes(getChangeKey(oldValue)) : false;
    const newSelected = newValue ? selectedChanges.includes(getChangeKey(newValue)) : false;
    const oldTokens = oldValue && tokens ? tokens.old[computeOldLineNumber(oldValue) - 1] : null;
    const newTokens = newValue && tokens ? tokens.new[computeNewLineNumber(newValue) - 1] : null;

    return (
      <SplitChange
        key={`change${key}`}
        style={lineStyle}
        oldChange={oldValue}
        newChange={newValue}
        monotonous={monotonous}
        hideGutter={hideGutter}
        oldSelected={oldSelected}
        newSelected={newSelected}
        oldTokens={oldTokens}
        newTokens={newTokens}
        {...changeProps}
      />
    );
  } else if (type === 'widget') {
    return (
      <SplitWidget
        key={`widget${key}`}
        monotonous={monotonous}
        oldElement={oldValue as JSX.Element}
        newElement={newValue as JSX.Element}
      />
    );
  }

  return null;
};

interface ISplitHunkProps extends IHunkProps {
  hideGutter: boolean;
}

const SplitHunk: React.FunctionComponent<ISplitHunkProps> = React.memo((props) => {
  const { hunk, widgets, style, ...childrenProps } = props;
  const elements = groupElements(hunk.changes, widgets);

  return <View style={style}>{elements.map((item) => renderRow(item, childrenProps))}</View>;
});

export default SplitHunk;
