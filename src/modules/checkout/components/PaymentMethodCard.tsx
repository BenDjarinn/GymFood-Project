import React from "react";
import { Pressable, View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ThemedText from "@shared/components/ui/ThemedText";

interface PaymentMethodCardProps {
  label: string;
  logo: ImageSourcePropType;
  onPress: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ label, logo, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.leftWrap}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>

      <MaterialIcons name="chevron-right" size={34} color="#34699A" />
    </Pressable>
  );
};

export default PaymentMethodCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    elevation: 3,
    marginBottom: 10,
  },

  leftWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    width: 40,
    height: 40,
  },

  label: {
    fontSize: 15,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },
});
