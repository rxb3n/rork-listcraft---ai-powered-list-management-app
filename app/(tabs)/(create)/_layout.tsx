import { Stack } from "expo-router";
import React from "react";

export default function CreateStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}