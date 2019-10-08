import React from 'react';
import { View } from 'react-native';

interface ISplitWidgetProps {
  monotonous: boolean;
  oldElement?: JSX.Element;
  newElement?: JSX.Element;
}

const SplitWidget: React.FunctionComponent<ISplitWidgetProps> = React.memo(
  ({ monotonous, oldElement, newElement }: ISplitWidgetProps) => {
    if (monotonous) {
      return <View>{oldElement || newElement}</View>;
    }

    if (oldElement === newElement) {
      return <View>{oldElement}</View>;
    }

    return (
      <View>
        <View>{oldElement}</View>
        <View>{newElement}</View>
      </View>
    );
  },
);

export default SplitWidget;
