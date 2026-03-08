import React from "react";
import { View, Image, StyleSheet } from "react-native";
import ThemedText from "@shared/components/ui/ThemedText";
import { Meal } from "@shared/types/data";
import { formatRupiah } from "@shared/utils/formatRupiah";

interface OrderItemCardProps {
  meal: Meal;
  qty: number;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ meal, qty }) => {
  if (!meal) return null;

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>{meal.name}</ThemedText>
      </View>

      {/* BODY */}
      <View style={styles.card}>
        {/* IMAGE */}
        <Image source={{ uri: meal.image }} style={styles.image} />

        {/* LEFT INFO */}
        <View style={styles.leftInfo}>
          <ThemedText style={styles.calories}>
            {meal.calories} kcal 🔥
          </ThemedText>

          <ThemedText style={styles.price}>
            {formatRupiah(meal.price)}
          </ThemedText>
        </View>

        {/* RIGHT MACRO */}
        <View style={styles.macroBox}>
          <ThemedText style={styles.macro}>
            {meal.protein} g{" "}
            <ThemedText style={styles.macroLabel}>Protein</ThemedText>
          </ThemedText>

          <ThemedText style={styles.macro}>
            {meal.carbs} g <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
          </ThemedText>

          <ThemedText style={styles.macro}>
            {meal.fat} g <ThemedText style={styles.macroLabel}>Fat</ThemedText>
          </ThemedText>
        </View>

        {/* QTY */}
        <View style={styles.qtyBox}>
          <ThemedText style={styles.qtyText}>{qty}x</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default OrderItemCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },

  /* HEADER */
  header: {
    backgroundColor: "#34699A",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  headerText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayBold",
  },

  /* CARD BODY */
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 12,
    elevation: 3,
  },

  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 10,
  },

  leftInfo: {
    justifyContent: "space-between",
    paddingVertical: 4,
    marginRight: 12,
  },

  calories: {
    fontSize: 13,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  price: {
    fontSize: 13,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
  },

  macroBox: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },

  macro: {
    fontSize: 12,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
  },

  macroLabel: {
    fontFamily: "SF-Pro-DisplayRegular",
    fontSize: 11,
  },

  qtyBox: {
    position: "absolute",
    right: 10,
    bottom: 8,
  },

  qtyText: {
    fontSize: 13,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
  },
});
