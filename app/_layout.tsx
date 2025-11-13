import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessionProvider } from '@/context/AuthContext';
import React from 'react';

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}
