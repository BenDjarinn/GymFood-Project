import React from "react";
import { View, Image, StyleSheet } from "react-native";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import { SettingsItem } from "@modules/profile";

import settingsItems from "@/data/settingsItem";

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerTitle}>Profile</ThemedText>

      {/* Profile Header */}
      <View style={styles.profileRow}>
        <Image
          source={require("@/assets/avatar.png")}
          style={styles.avatar}
        />
        <View>
          <ThemedText style={styles.profileName}>Abri Busetda</ThemedText>
          <ThemedText style={styles.profileEmail}>
            abribusetda@gmail.com
          </ThemedText>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Settings List */}
      {settingsItems.map((item) => (
        <SettingsItem
          key={item.label}
          label={item.label}
          icon={item.icon as any}
          onPress={() => console.log(item.label)}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 25,
  },

  headerTitle: {
    fontSize: 24,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    marginBottom: 20,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  profileName: {
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#34699A",
  },

  profileEmail: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    marginTop: 2,
  },

  divider: {
    height: 1.5,
    backgroundColor: "#34699A",
    opacity: 1,
    marginBottom: 18,
  },
});
