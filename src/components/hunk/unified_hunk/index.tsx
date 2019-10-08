import React from 'react';
import { View } from 'react-native';
import { IChange } from 'gitdiff-parser';
import { Widgets } from '../../../types';
import { IHunkProps } from '..';
import { getChangeKey, computeOldLineNumber, computeNewLineNumber } from '../../../utils';
import UnifiedChange from './unified_change';
import UnifiedWidget from './unified_widget';

type ChangeRow = ['change', string, IChange];
type WidgetRow = ['widget', string, JSX.Element];
type Row = ChangeRow | WidgetRow;

const groupElements = (changes: IChange[], widgets: Widgets): Row[] => {
  return changes.reduce((elements, change) => {
    const key = getChangeKey(change);

    elements.push(['change', key, change]);

    const widget = widgets[key];

    if (widget) {
      elements.push(['widget', key, widget]);
    }

    return elements;
  }, []);
};

const renderRow = ([type, key, value]: Row, props: any): JSX.Element => {
  const { hideGutter, selectedChanges, tokens, lineStyle, ...changeProps } = props;

  if (type === 'change') {
    const change = value as IChange;
    const side = change.isDelete ? 'old' : 'new';
    const lineNumber = change.isDelete ? computeOldLineNumber(value) : computeNewLineNumber(value);
    const tokensOfLine = tokens ? tokens[side][lineNumber - 1] : null;

    return (
      <UnifiedChange
        key={`change${key}`}
        style={lineStyle}
        change={value}
        hideGutter={hideGutter}
        selected={selectedChanges.includes(key)}
        tokens={tokensOfLine}
        {...changeProps}
      />
    );
  } else if (type === 'widget') {
    const element = value as JSX.Element;

    return <UnifiedWidget key={`widget${key}`} element={element} />;
  }

  return null;
};

interface IUnifiedHunkProps extends IHunkProps {
  hideGutter: boolean;
}

const UnifiedHunk: React.FunctionComponent<IUnifiedHunkProps> = React.memo(
  (props): JSX.Element => {
    const { hunk, widgets, style, ...childrenProps } = props;
    const elements = groupElements(hunk.changes, widgets);

    return <View style={style}>{elements.map((element) => renderRow(element, childrenProps))}</View>;
  },
);

export default UnifiedHunk;
