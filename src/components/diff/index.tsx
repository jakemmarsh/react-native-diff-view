import React from 'react';
import { ViewStyle, View } from 'react-native';
import { INode } from '../../tokenize/back_to_tree';
import { IHunk, IChange, ViewType, GutterType, DiffType, Widgets, DiffChildren, IGutterOptions } from '../../types';
import { Provider, IDiffSettings } from '../../context';
import Hunk from '../hunk';

interface IDiffProps {
  viewType: ViewType;
  diffType: DiffType;
  hunks: IHunk[];
  gutterType?: GutterType;
  style?: ViewStyle;
  selectedChanges?: string[];
  widgets?: Widgets;
  optimizeSelection?: boolean;
  children?: DiffChildren;
  renderGutter?: (options: IGutterOptions) => JSX.Element;
  renderToken?: (token: INode) => JSX.Element;
  onChangePress?: (change: IChange) => any;
}

const Diff: React.FunctionComponent<IDiffProps> = React.memo(
  (props): JSX.Element => {
    const { diffType, children, style, optimizeSelection, hunks, ...remainings } = props;
    const hideGutter = remainings.gutterType === 'none';
    const monotonous = diffType === 'add' || diffType === 'delete';
    const cols = ((viewType, monotonous) => {
      if (viewType === 'unified') {
        return (
          <View>
            {!hideGutter && <View />}
            {!hideGutter && <View />}
            <View />
          </View>
        );
      }

      if (monotonous) {
        return (
          <View>
            {!hideGutter && <View />}
            <View />
          </View>
        );
      }

      return (
        <View>
          {!hideGutter && <View />}
          <View />
          {!hideGutter && <View />}
          <View />
        </View>
      );
    })(props.viewType, monotonous);

    return (
      <Provider value={{ ...remainings, monotonous } as IDiffSettings}>
        <View style={style}>
          {cols}
          {children(hunks)}
        </View>
      </Provider>
    );
  },
);

Diff.defaultProps = {
  gutterType: 'default',
  optimizeSelection: false,
  selectedChanges: [],
  widgets: {},
  style: {},
  renderToken: undefined,
  renderGutter({ textStyle, renderDefault }) {
    return renderDefault(textStyle);
  },
  children(hunks) {
    const key = (hunk: IHunk): string => `-${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines}`;

    return hunks.map((hunk) => <Hunk key={key(hunk)} hunk={hunk} />);
  },
};

export default Diff;
