import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { palette } from '../theme/colors';

type TextFieldProps = TextInputProps & {
  label: string;
  errorMessage?: string;
};

export const TextField: React.FC<TextFieldProps> = ({ label, errorMessage, style, ...props }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      {...props}
      style={[styles.input, style]}
      placeholderTextColor={palette.muted}
    />
    {Boolean(errorMessage) && <Text style={styles.error}>{errorMessage}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: palette.text,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.text,
    backgroundColor: palette.card,
  },
  error: {
    color: palette.danger,
    marginTop: 4,
    fontSize: 13,
  },
});

export default TextField;
