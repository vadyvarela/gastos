import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppInit } from '@/hooks/useAppInit';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isInitialized, error } = useAppInit();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ErrorBoundary fallback={
          <View>
            <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          </View>
        }>
          <View />
        </ErrorBoundary>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="add-expense" 
            options={{ 
              presentation: 'modal', 
              headerShown: true,
              title: 'Novo Gasto' 
            }} 
          />
          <Stack.Screen 
            name="add-income" 
            options={{ 
              presentation: 'modal', 
              headerShown: true,
              title: 'Nova Receita' 
            }} 
          />
          <Stack.Screen 
            name="expense/[id]" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="income/[id]" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <ToastProvider />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
