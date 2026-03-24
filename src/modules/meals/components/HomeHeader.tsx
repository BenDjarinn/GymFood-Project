import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedText from "@shared/components/ui/ThemedText";

interface HomeHeaderProps {
  cartKindsCount: number;
  onPressCart: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ cartKindsCount, onPressCart }) => (
  <View style={styles.headerContainer}>
    <ThemedText style={styles.headerTitle}>Category</ThemedText>

    <Pressable
      onPress={onPressCart}
      style={({ pressed }) => [
        styles.cartButton,
        {
          opacity: pressed ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      <MaterialIcons name="shopping-cart" size={36} color="#34699A" />
      {cartKindsCount > 0 && (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{cartKindsCount}</ThemedText>
        </View>
      )}
    </Pressable>
  </View>
);

export default HomeHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 25,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  cartButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 6,
    backgroundColor: "#E74C3C",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "SF-Pro-DisplayBold",
    lineHeight: 14,
  },
});
