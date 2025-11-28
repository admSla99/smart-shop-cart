import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { LoadingOverlay } from '../components/LoadingOverlay';
import { useAuth } from '../contexts/AuthContext';
import AuthLandingScreen from '../screens/AuthLandingScreen';
import HomeScreen from '../screens/HomeScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import { palette } from '../theme/colors';

export type AuthStackParamList = {
  AuthLanding: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  ListDetail: { listId: string; title: string; shopName?: string | null; shopColor?: string | null };
  Templates: undefined;
};

export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<AppStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.background,
    card: palette.surface,
    border: palette.border,
    text: palette.text,
    primary: palette.primary,
  },
};

const AuthFlow = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="AuthLanding" component={AuthLandingScreen} />
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const AppFlow = () => (
  <MainStack.Navigator>
    <MainStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'My Lists', headerLargeTitle: true }}
    />
    <MainStack.Screen
      name="ListDetail"
      component={ListDetailScreen}
      options={({ route }) => ({ title: route.params.title })}
    />
    <MainStack.Screen
      name="Templates"
      component={TemplatesScreen}
      options={{ title: 'Templates' }}
    />
  </MainStack.Navigator>
);

export const AppNavigator = () => {
  const { loading, user } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      {loading ? <LoadingOverlay message="Preparing your workspace..." /> : user ? <AppFlow /> : <AuthFlow />}
    </NavigationContainer>
  );
};

export default AppNavigator;
