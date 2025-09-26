import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppErrorBoundary } from "@/components/error-boundary";
import { useAppBootstrap } from "@/hooks/use-bootstrap";
import { StorageProvider } from "@/providers/storage";
import { LocalizationProvider, CreditsProvider } from "@/providers/stores";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal", title: "Go Pro" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useAppBootstrap();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StorageProvider>
        <LocalizationProvider>
          <CreditsProvider>
            <GestureHandlerRootView>
              <AppErrorBoundary>
                <RootLayoutNav />
              </AppErrorBoundary>
            </GestureHandlerRootView>
          </CreditsProvider>
        </LocalizationProvider>
      </StorageProvider>
    </QueryClientProvider>
  );
}