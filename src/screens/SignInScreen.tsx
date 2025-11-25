import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to keep your lists synced and smart.</Text>
        <TextField
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign in" onPress={handleSubmit} loading={submitting} />
        <Button label="Need an account?" variant="ghost" onPress={() => navigation.replace('SignUp')} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: palette.background,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: palette.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    color: palette.text,
  },
  subtitle: {
    color: palette.muted,
    marginBottom: 20,
  },
  error: {
    color: palette.danger,
    marginBottom: 10,
  },
});

export default SignInScreen;
