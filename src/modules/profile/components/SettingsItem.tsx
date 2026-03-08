import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ThemedText from "@shared/components/ui/ThemedText";

interface SettingsItemProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  icon = "settings",
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <MaterialIcons name={icon} size={28} color="#34699A" />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
};

export default SettingsItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#34699A",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  label: {
    fontSize: 20,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
  },
});
