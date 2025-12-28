import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { AppNavigator } from './src/navigation/AppNavigator';
import { palette } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Sora-Regular': require('./assets/fonts/Sora-Regular.ttf'),
    'Sora-SemiBold': require('./assets/fonts/Sora-SemiBold.ttf'),
    'Sora-Bold': require('./assets/fonts/Sora-Bold.ttf'),
    'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('./assets/fonts/DMSans-Medium.ttf'),
    'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <LoadingOverlay message="Loading fonts..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: palette.background }}>
          <AppNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
