import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; resetCode: string };
};

export type UserStackParamList = {
  Products: undefined;
  Cart: undefined;
  Checkout: undefined;
};

export type AdminTabType = 'users' | 'products' | 'orders';

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type UserScreenProps<T extends keyof UserStackParamList> =
  NativeStackScreenProps<UserStackParamList, T>;
