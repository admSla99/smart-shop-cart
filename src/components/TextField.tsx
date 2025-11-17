import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

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
      placeholderTextColor="#9CA3AF"
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
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  error: {
    color: '#DC2626',
    marginTop: 4,
    fontSize: 13,
  },
});

export default TextField;
