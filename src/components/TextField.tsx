import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { palette } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/layout';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { onFocus, onBlur, ...inputProps } = props;

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={palette.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.label,
    color: palette.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: layout.borderRadius.m,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...layout.shadows.small,
  },
  focused: {
    borderColor: palette.primary,
    backgroundColor: palette.card,
    shadowColor: palette.primary,
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  errorBorder: {
    borderColor: palette.danger,
  },
  input: {
    ...typography.body,
    color: palette.text,
    padding: 0, // Reset default padding
  },
  errorText: {
    ...typography.caption,
    color: palette.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default TextField;
