import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { FadeInView } from '../components/FadeInView';
import { TextField } from '../components/TextField';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/layout';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
    >
      <DecorativeBackground variant="cool" />
      <FadeInView style={styles.card}>
        <View style={styles.header}>
          <LinearGradient
            colors={palette.gradientSecondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Feather name="user" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to access your lists.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="hello@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label="Sign In"
            onPress={handleSignIn}
            loading={loading}
            style={styles.submitButton}
          />

          <Button
            label="Back"
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>
      </FadeInView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.large,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    zIndex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: palette.textSecondary,
  },
  form: {
    gap: 8,
    zIndex: 1,
  },
  error: {
    ...typography.caption,
    color: palette.danger,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default SignInScreen;
