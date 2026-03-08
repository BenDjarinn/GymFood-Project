import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import OrderItemCard from "@modules/checkout/components/OrderItemCard";
import OrderSummaryCard from "@modules/checkout/components/OrderSummaryCard";

import { useOrderHistoryStore } from "@modules/cart/store/useOrderHistoryStore";

const TAX = 2000;
const HEALTH_INSURANCE = 8000;

const formatRupiah = (n: number): string =>
  `Rp. ${Number(n || 0).toLocaleString("id-ID")}`;

const OrderReviewScreen: React.FC = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orders = useOrderHistoryStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);

  const [reviewText, setReviewText] = useState("");

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.headerContainer}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <MaterialIcons name="arrow-back" size={36} color="#34699A" />
            </Pressable>
            <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
          </View>
        </View>
        <View style={styles.emptyWrap}>
          <ThemedText style={styles.emptyText}>Order not found.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const cartItems = order.items.map((it) => ({
    meal: it.meal,
    qty: it.qty,
  }));

  const subTotalFood = cartItems.reduce(
    (sum, it) => sum + Number(it.meal?.price ?? 0) * (it.qty ?? 0),
    0
  );

  const grandTotal = subTotalFood + TAX + HEALTH_INSURANCE;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={36} color="#34699A" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.meal?.id || "unknown"}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.meal ? (
              <OrderItemCard meal={item.meal} qty={item.qty} />
            ) : null
          }
          ListFooterComponent={
            <View>
              <OrderSummaryCard items={cartItems as any} />

              <View style={styles.totalPayRow}>
                <ThemedText style={styles.totalPayLabel}>TOTAL PAYMENT</ThemedText>
                <ThemedText style={styles.totalPayValue}>
                  {formatRupiah(grandTotal)}
                </ThemedText>
              </View>

              {/* REVIEW SECTION */}
              <ThemedText style={styles.reviewTitle}>Review</ThemedText>
              <TextInput
                style={styles.reviewInput}
                placeholder="Describe here."
                placeholderTextColor="#A0BDD4"
                multiline
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
              />

              {/* ACTION BUTTONS */}
              <View style={styles.buttonRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.ratingBtn,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() => console.log("Rating pressed")}
                >
                  <ThemedText style={styles.ratingBtnText}>Rating</ThemedText>
                </Pressable>

                <Pressable
                  disabled={!reviewText.trim()}
                  style={({ pressed }) => [
                    styles.reorderBtn,
                    !reviewText.trim() && { backgroundColor: "#C4C4C4" },
                    { opacity: pressed && reviewText.trim() ? 0.8 : 1 },
                  ]}
                  onPress={() => console.log("Re-Order pressed")}
                >
                  <ThemedText style={styles.reorderBtnText}>Re-Order</ThemedText>
                </Pressable>
              </View>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </ThemedView>
  );
};

export default OrderReviewScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 70,
    paddingHorizontal: 20,
    zIndex: 10,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    fontSize: 25,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  content: {
    paddingTop: 140,
    paddingHorizontal: 20,
    flex: 1,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    fontWeight: "600",
  },

  totalPayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 5,
  },

  totalPayLabel: {
    fontSize: 14,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
    letterSpacing: 1,
  },

  totalPayValue: {
    fontSize: 20,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
  },

  /* ── Review Section ── */
  reviewTitle: {
    fontSize: 20,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    marginTop: 18,
    marginBottom: 20,
  },

  reviewInput: {
    borderWidth: 1,
    borderColor: "#D0DDE8",
    borderRadius: 12,
    padding: 14,
    minHeight: 240,
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    backgroundColor: "#fff",
    marginBottom: 20,
  },

  /* ── Action Buttons ── */
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },

  ratingBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#34699A",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  ratingBtnText: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#34699A",
  },

  reorderBtn: {
    flex: 1,
    backgroundColor: "#319F43",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  reorderBtnText: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#fff",
  },
});
