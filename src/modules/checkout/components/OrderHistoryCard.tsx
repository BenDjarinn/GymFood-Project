import React from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ThemedText from "@shared/components/ui/ThemedText";
import { CompletedOrder } from "@shared/types/data";

interface OrderHistoryCardProps {
  order: CompletedOrder;
  onPress?: () => void;
  onReorder?: () => void;
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatRupiah = (n: number): string =>
  `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
  order,
  onPress,
  onReorder,
}) => {
  // Each item in the order becomes its own card row
  return (
    <>
      {order.items.map((item, index) => (
        <Pressable
          key={`${order.id}-${index}`}
          style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
          onPress={onPress}
        >
          {/* Left Image */}
          <Image source={{ uri: item.meal.image }} style={styles.image} />

          {/* Middle content */}
          <View style={styles.info}>
            <View style={styles.topRow}>
              <ThemedText style={styles.mealName}>{item.meal.name}</ThemedText>
              <ThemedText style={styles.date}>{formatDate(order.paidAt)}</ThemedText>
            </View>

            <View style={styles.calRow}>
              <ThemedText style={styles.calories}>{item.meal.calories} kl</ThemedText>
              <ThemedText style={styles.fireEmoji}>🔥</ThemedText>
            </View>

            <ThemedText style={styles.price}>
              {formatRupiah(item.meal.price * item.qty)}
            </ThemedText>
          </View>

          {/* Reorder icon bottom-right */}
          <Pressable style={styles.reorderBtn} onPress={onReorder} hitSlop={8}>
            <MaterialIcons name="reply" size={35} color="#34699A" />
          </Pressable>
        </Pressable>
      ))}
    </>
  );
};

export default OrderHistoryCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingRight: 12,
    shadowColor: "#cfcfcf",
    shadowOffset: { width: 0 , height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },

  image: {
    width: 110,
    height: 110,
    resizeMode: "cover",
  },

  info: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
    justifyContent: "flex-start",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  mealName: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#34699A",
    flex: 1,
    marginRight: 8,
  },

  date: {
    fontSize: 12,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#34699A",
    textAlign: "right",
  },

  calRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },

  calories: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
  },

  fireEmoji: {
    fontSize: 14,
  },

  price: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    marginTop: 2,
  },

  reorderBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
