import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Root Stack Navigator (includes both Auth and Main flows)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
  Chat: {
    initialMessage?: string;
    conversationId?: string;
  };
};

// Bottom Tab Navigator param list
export type BottomTabParamList = {
  Home: undefined;
  Bible: {
    book?: string;
    chapter?: number;
    verse?: number;
  };
  Ask: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
