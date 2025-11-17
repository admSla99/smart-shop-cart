import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

type RuntimeConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  aiServiceUrl?: string;
  aiApiKey?: string;
};

type LegacyConstants = {
  manifest?: {
    extra?: RuntimeConfig;
  };
};

const legacyExtra = (Constants as unknown as LegacyConstants | undefined)?.manifest?.extra;
const extra = (Constants?.expoConfig?.extra as RuntimeConfig | undefined) ?? legacyExtra ?? {};

const fallback = (key: keyof RuntimeConfig) => extra?.[key] ?? '';

if (!fallback('supabaseUrl') || !fallback('supabaseAnonKey')) {
  console.warn('Supabase credentials are not configured. Set them in .env before running the app.');
}

export const supabase = createClient(fallback('supabaseUrl'), fallback('supabaseAnonKey'), {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const getRuntimeConfig = () => ({
  supabaseUrl: fallback('supabaseUrl'),
  aiServiceUrl: fallback('aiServiceUrl'),
  aiApiKey: fallback('aiApiKey'),
});
