import { config as loadEnv } from 'dotenv';
import type { ConfigContext, ExpoConfig } from 'expo/config';

loadEnv();

const getEnv = (key: string) => process.env[key] ?? '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Smart Shopping List',
  slug: 'smart-shopping-list',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'smartshoppinglist',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    supabaseUrl:
      getEnv('EXPO_PUBLIC_SUPABASE_URL') ||
      getEnv('SUPABASE_URL'),
    supabaseAnonKey:
      getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') ||
      getEnv('SUPABASE_ANON_KEY'),
    aiServiceUrl:
      getEnv('EXPO_PUBLIC_AI_SERVICE_URL') ||
      getEnv('AI_SERVICE_URL'),
    aiApiKey:
      getEnv('EXPO_PUBLIC_AI_API_KEY') ||
      getEnv('AI_API_KEY'),
  },
  assetBundlePatterns: ['**/*'],
});
