import { Stack } from "expo-router";
import React from "react";

export default function ListsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="lists" />
    </Stack>
  );
}