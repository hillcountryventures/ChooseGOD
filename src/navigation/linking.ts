import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'choosegod://',
    'https://choosegod.app',
    'https://www.choosegod.app',
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Bible: {
            path: 'bible/:book?/:chapter?/:verse?',
            parse: {
              book: (book: string) => decodeURIComponent(book),
              chapter: (chapter: string) => parseInt(chapter, 10) || 1,
              verse: (verse: string) => parseInt(verse, 10) || undefined,
            },
          },
          Journey: 'journey',
          Prayers: 'prayers',
          Devotionals: 'devotionals',
        },
      },
    },
  },
};
