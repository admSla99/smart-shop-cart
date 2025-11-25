import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { signUpWithEmail } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to sign up');
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Track multiple store-specific lists with AI assistance.</Text>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
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
        <Button label="Create account" onPress={handleSubmit} loading={submitting} />
        <Button label="Already have an account?" variant="ghost" onPress={() => navigation.replace('SignIn')} />
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

export default SignUpScreen;
