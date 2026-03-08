import React, {useState} from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import OrderItemCard from "@modules/checkout/components/OrderItemCard";

import { useCartStore } from "@modules/cart/store/useCartStore";
import { buildCartItems } from "@modules/cart/utils/cartSelectors";

const ShoppingCartScreen: React.FC = () => {
  const cartById = useCartStore((s) => s.cartById);
  const cartItems = buildCartItems(cartById);
  
  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={36} color="#34699A" />
          </Pressable>

          <ThemedText style={styles.headerTitle}>Shopping Cart</ThemedText>
        </View>
      </View>

      {/* LIST + EMPTY STATE */}
      <View style={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ThemedText style={styles.emptyText}>No meal was selected</ThemedText>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.meal?.id || "unknown"}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              item.meal ? <OrderItemCard meal={item.meal} qty={item.qty} /> : null
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </ThemedView>
  );
};

export default ShoppingCartScreen;

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

});
