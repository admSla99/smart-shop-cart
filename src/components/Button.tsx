import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/layout';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  compact?: boolean;
  iconOnly?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  compact = false,
  iconOnly = false,
  accessibilityLabel,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const hasLabel = typeof label === 'string' && label.length > 0;
  const isIconOnly = iconOnly || (!!icon && !hasLabel);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getLabelColor = () => {
    if (variant === 'primary' || variant === 'danger') return '#FFFFFF';
    if (variant === 'secondary') return palette.text;
    return palette.textSecondary;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.container,
        compact && styles.compactContainer,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          getVariantStyle(),
          compact && styles.compact,
          isIconOnly && styles.iconOnlyBase,
          isDisabled && styles.disabled,
          { transform: [{ scale }] },
        ]}
      >
        {variant === 'primary' && (
          <LinearGradient
            colors={palette.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        )}
        {loading ? (
          <ActivityIndicator color={getLabelColor()} />
        ) : (
          <View
            style={[
              styles.content,
              icon && iconPosition === 'right' ? styles.reverse : undefined,
              isIconOnly && styles.iconOnlyContent,
            ]}
          >
            {icon ? (
              <Feather
                name={icon}
                size={compact ? 16 : 20}
                color={getLabelColor()}
                style={[
                  isIconOnly ? styles.iconOnlyIcon : styles.icon,
                  iconPosition === 'right' && !isIconOnly && styles.iconRight,
                ]}
              />
            ) : null}
            {hasLabel ? (
              <Text
                style={[
                  styles.label,
                  compact && styles.compactLabel,
                  { color: getLabelColor() },
                ]}
              >
                {label}
              </Text>
            ) : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  compactContainer: {
    marginVertical: 4,
  },
  base: {
    flexDirection: 'row',
    borderRadius: layout.borderRadius.l,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...layout.shadows.medium,
  },
  primary: {
    shadowColor: palette.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  danger: {
    backgroundColor: palette.danger,
    shadowColor: palette.danger,
    shadowOpacity: 0.4,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: layout.borderRadius.m,
  },
  iconOnlyBase: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 0,
    minHeight: 0,
    flex: 1,
  },
  label: {
    ...typography.label,
    fontSize: 16,
  },
  compactLabel: {
    fontSize: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconOnlyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  reverse: {
    flexDirection: 'row-reverse',
  },
  icon: {
    marginRight: 8,
  },
  iconOnlyIcon: {
    marginRight: 0,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: 8,
  },
});

export default Button;
