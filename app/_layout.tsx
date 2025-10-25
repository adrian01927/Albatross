
import React, { useEffect } from 'react';
import { useColorScheme, Alert } from 'react-native';
import { useNetworkState } from 'expo-network';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/button';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SystemBars } from 'react-native-edge-to-edge';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isConnected } = useNetworkState();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WidgetProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SystemBars style="auto" />
            <Stack>
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: 'modal',
                  headerTitle: 'Modal',
                  headerRight: () => (
                    <Button onPress={() => router.back()}>Close</Button>
                  ),
                }}
              />
              <Stack.Screen
                name="formsheet"
                options={{
                  presentation: 'formSheet',
                  headerTitle: 'Form Sheet',
                  headerRight: () => (
                    <Button onPress={() => router.back()}>Close</Button>
                  ),
                }}
              />
              <Stack.Screen
                name="transparent-modal"
                options={{
                  presentation: 'transparentModal',
                  animation: 'fade',
                  headerShown: false,
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WidgetProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
