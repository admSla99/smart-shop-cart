import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLanding'>;

const AuthLandingScreen: React.FC<Props> = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Smart Shopping List</Text>
    <Text style={styles.subtitle}>
      Collect your essentials, sync across devices, and let AI recommend what you might need next.
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
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F5F5F4',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 40,
  },
});

export default AuthLandingScreen;
