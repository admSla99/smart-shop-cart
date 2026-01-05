import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingOverlay } from './src/components/LoadingOverlay';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const AppShell = () => {
  const { palette, themeMode } = useTheme();

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <AppNavigator />
      </View>
    </>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Sora-Regular': require('./assets/fonts/Sora-Regular.ttf'),
    'Sora-SemiBold': require('./assets/fonts/Sora-SemiBold.ttf'),
    'Sora-Bold': require('./assets/fonts/Sora-Bold.ttf'),
    'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('./assets/fonts/DMSans-Medium.ttf'),
    'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          {fontsLoaded ? <AppShell /> : <LoadingOverlay message="Loading fonts..." />}
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
