import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

import ThemedText from "@shared/components/ui/ThemedText";

interface OrderMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

const BLUE = "#34699A";

const OrderMap: React.FC<OrderMapProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
}) => {
  const handleOpenPicker = () => {
    router.push({
      pathname: "/LocationPicker",
      params: { lat: latitude, lng: longitude },
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>WHERE TO?</ThemedText>

      <Pressable
        onPress={handleOpenPicker}
        style={({ pressed }) => [
          styles.mapButton,
          pressed && styles.mapButtonPressed,
        ]}
      >
        <MaterialIcons name="location-on" size={28} color="#E74C3C" />
        <View style={styles.mapButtonTextWrap}>
          <ThemedText style={styles.mapButtonLabel}>
            {address || "Tap to pick a delivery location"}
          </ThemedText>
          <ThemedText style={styles.coords}>
            Lat: {latitude.toFixed(6)} | Lng: {longitude.toFixed(6)}
          </ThemedText>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </Pressable>
    </View>
  );
};

export default OrderMap;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D2D4D8",
  },
  title: {
    fontSize: 14,
    color: BLUE,
    fontFamily: "SF-Pro-DisplayBold",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(52,105,154,0.12)",
  },
  mapButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  mapButtonTextWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  mapButtonLabel: {
    fontSize: 14,
    color: BLUE,
    fontFamily: "SF-Pro-DisplayBold",
    lineHeight: 20,
  },
  coords: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
});
