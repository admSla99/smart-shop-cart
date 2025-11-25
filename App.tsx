import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { palette } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: palette.background }}>
          <AppNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
