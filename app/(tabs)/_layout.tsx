import React from "react";
import { Tabs, router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TabIcon = ({
  name,
  focused
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  isCenter?: boolean;
}) => (
  <View
    style={[
      styles.iconContainer,
    ]}
  >
    <Ionicons
      name={name}
      size={focused ? 36 : 28}
      color={focused ? "#4A7EB8" : "#8E8E93"}
    />
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#4A7EB8",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
          paddingTop: 25,
          paddingBottom: 30,
          paddingHorizontal: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="chatbox" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: "Consultation",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="barbell" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="restaurant" focused={focused} isCenter />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="time" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
  },
});
