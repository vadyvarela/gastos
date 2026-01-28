import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<TabParamList>;
  'add-expense': undefined;
  'expense/[id]': { id: string };
  modal: undefined;
};

export type TabParamList = {
  index: undefined;
  summary: undefined;
  categories: undefined;
};
