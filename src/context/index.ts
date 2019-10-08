import { createContext, useContext } from 'react';
import { GutterType } from '../types';

export interface IDiffSettings {
  gutterType: GutterType;
  monotonous: boolean;
}

const ContextType = createContext<IDiffSettings>({} as IDiffSettings);
const { Provider } = ContextType;
const useDiffSettings = (): IDiffSettings => useContext(ContextType);

export { Provider, useDiffSettings };
