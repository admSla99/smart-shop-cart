import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../components/Button';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { FadeInView } from '../components/FadeInView';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import type { AuthStackParamList } from '../navigation/AppNavigator';
import type { Layout } from '../theme/layout';
import type { Palette } from '../theme/colors';
import type { Typography } from '../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLanding'>;

const AuthLandingScreen: React.FC<Props> = ({ navigation }) => {
  const { palette, typography, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(palette, typography, layout),
    [palette, typography, layout],
  );

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="warm" />
      <ThemeToggle rightOffset={24} />
      <FadeInView style={styles.content}>
        <LinearGradient
          colors={palette.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Feather name="shopping-cart" size={40} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.title}>Smart Shopping List</Text>
        <Text style={styles.subtitle}>
          Plan your runs, organize by shop, and never forget an item again.
        </Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Feather name="zap" size={14} color={palette.primary} />
            <Text style={styles.chipText}>AI sorting</Text>
          </View>
          <View style={styles.chip}>
            <Feather name="list" size={14} color={palette.primary} />
            <Text style={styles.chipText}>Templates</Text>
          </View>
          <View style={styles.chip}>
            <Feather name="map-pin" size={14} color={palette.primary} />
            <Text style={styles.chipText}>Store layouts</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={120} style={styles.footer}>
        <Button
          label="Sign In"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.button}
        />
        <Button
          label="Create Account"
          variant="secondary"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.button}
        />
      </FadeInView>
    </View>
  );
};

const createStyles = (palette: Palette, typography: Typography, layout: Layout) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      padding: 24,
      position: 'relative',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 1,
      borderColor: palette.borderHighlight,
      ...layout.shadows.large,
    },
    title: {
      ...typography.display,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      ...typography.body,
      color: palette.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
      marginBottom: 24,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: layout.borderRadius.full,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      ...layout.shadows.small,
    },
    chipText: {
      ...typography.caption,
      color: palette.textSecondary,
    },
    footer: {
      gap: 16,
      marginBottom: 24,
      zIndex: 1,
    },
    button: {
      width: '100%',
    },
  });

export default AuthLandingScreen;
