import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import type { AuthStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLanding'>;

const AuthLandingScreen: React.FC<Props> = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.badge}>Smart Shopping</Text>
    <Text style={styles.title}>Groceries, organized. AI ready.</Text>
    <Text style={styles.subtitle}>
      Sign in to keep your shopping trips synced, categorized by store, and powered by intelligent suggestions.
    </Text>

    <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
    <Button
      label="Create an account"
      variant="secondary"
      onPress={() => navigation.navigate('SignUp')}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  badge: {
    color: palette.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: palette.muted,
    marginBottom: 32,
  },
});

export default AuthLandingScreen;
