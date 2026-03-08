import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppFonts } from "@/assets/fonts";

interface CategoryCardProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ label, icon, active, onPress }) => {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && styles.activeCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.cardLabel}>{label}</Text>

        <MaterialCommunityIcons
          name={icon as any}
          size={40}
          color="#eee"
          style={styles.icon}
        />
      </View>
    </Pressable>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    width: 92,
    height: 92,
    backgroundColor: "#2F6A9E",
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 5,
  },
  activeCard: {
    backgroundColor: "#1E4F80",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#fff",
    fontFamily: "SF-Pro-DisplayBold",
    fontSize: 16,
    position: "absolute",
    top: 18,
  },
  icon: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
