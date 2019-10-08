import { createContext, useContext } from 'react';
import { ViewType, GutterType } from '../types';

export interface IDiffSettings {
  viewType: ViewType;
  gutterType: GutterType;
  monotonous: boolean;
}

const ContextType = createContext<IDiffSettings>({} as IDiffSettings);
const { Provider } = ContextType;
const useDiffSettings = (): IDiffSettings => useContext(ContextType);

export { Provider, useDiffSettings };
