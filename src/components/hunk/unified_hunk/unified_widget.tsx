import React from 'react';
import { View } from 'react-native';

interface IUnifiedWidgetProps {
  element: JSX.Element;
}

const UnifiedWidget: React.FunctionComponent<IUnifiedWidgetProps> = React.memo(
  (props): JSX.Element => <View>{props.element}</View>,
);

export default UnifiedWidget;
