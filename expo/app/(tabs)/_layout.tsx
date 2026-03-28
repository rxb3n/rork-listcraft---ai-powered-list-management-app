import { Tabs } from "expo-router";
import { ListPlus, Rows3 } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import { CreditsBadge } from "@/components/credits-badge";
import { LanguageSelector } from "@/components/language-selector";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        headerRight: () => <CreditsBadge />,
        headerLeft: () => <LanguageSelector />,
      }}
    >
      <Tabs.Screen
        name="(create)"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <ListPlus color={color} />,
          headerTitle: "ListCraft",
        }}
      />
      <Tabs.Screen
        name="(lists)"
        options={{
          title: "Lists",
          tabBarIcon: ({ color }) => <Rows3 color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}