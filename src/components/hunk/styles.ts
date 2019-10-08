import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

interface IHunkStyles {
  diffGutter: ViewStyle;
  diffGutterText: TextStyle;

  diffGutterInsert: ViewStyle;
  diffGutterDelete: ViewStyle;

  diffCodeCell: ViewStyle;
  diffCodeCellText: TextStyle;

  diffCodeCellInsert: ViewStyle;
  diffCodeCellInsertEdit: ViewStyle;
  diffCodeCellDelete: ViewStyle;
  diffCodeCellDeleteEdit: ViewStyle;

  diffUnifiedChange: ViewStyle;
}

const CELL_PADDING_VERTICAL = 3;
const CELL_PADDING_HORIZONTAL = 6;
const CELL_FONT_SIZE = 12;

const CODE_FONT_FAMILY = Platform.select({ ios: 'Courier New', android: 'monospace' });

export default StyleSheet.create<IHunkStyles>({
  diffGutter: {
    flex: 0,
    width: 42,
    paddingVertical: CELL_PADDING_VERTICAL,
    paddingHorizontal: CELL_PADDING_HORIZONTAL,
  },
  diffGutterText: {
    fontFamily: CODE_FONT_FAMILY,
    fontSize: CELL_FONT_SIZE,
    textAlign: 'right',
  },

  diffGutterInsert: { backgroundColor: '#d6fedb' },
  diffGutterDelete: { backgroundColor: '#fadde0' },

  diffCodeCell: {
    flex: 1,
    paddingVertical: CELL_PADDING_VERTICAL,
    paddingHorizontal: CELL_PADDING_HORIZONTAL,
  },
  diffCodeCellText: {
    fontFamily: CODE_FONT_FAMILY,
    fontSize: CELL_FONT_SIZE,
  },

  diffCodeCellInsert: { backgroundColor: '#eaffee' },
  diffCodeCellInsertEdit: { backgroundColor: '#c0dc91' },
  diffCodeCellDelete: { backgroundColor: '#fdeff0' },
  diffCodeCellDeleteEdit: { backgroundColor: '#f39ea2' },

  diffUnifiedChange: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
});
