import { StyleSheet, ViewStyle } from 'react-native';

interface IDecorationStyles {
  diffDecoration: ViewStyle;
  diffDecorationGutter: ViewStyle;
  diffDecorationContent: ViewStyle;
}

export default StyleSheet.create<IDecorationStyles>({
  diffDecoration: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    lineHeight: 1.5,
  },
  diffDecorationGutter: {
    flex: 1,
  },
  diffDecorationContent: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
