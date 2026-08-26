import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import OrderItemCard from "@modules/checkout/components/OrderItemCard";
import OrderSummaryCard from "@modules/checkout/components/OrderSummaryCard";
import OrderMap from "@modules/checkout/components/OrderMap";

import { useCartStore } from "@modules/cart/store/useCartStore";
import { buildCartItems } from "@modules/cart/utils/cartSelectors";
import { useSupabaseMeals } from "@shared/hooks/useSupabaseMeals";
import { useOrderHistoryStore } from "@modules/cart/store/useOrderHistoryStore";
import { useStripeCheckout } from "@modules/checkout/hooks/useStripeCheckout";
import { CompletedOrder } from "@shared/types/data";

import { SuccessPopup } from "@/shared/components/ui/SuccessPopup";

const TAX = 2000;
const HEALTH_INSURANCE = 8000;

const formatRupiah = (n: number): string =>
  `Rp. ${Number(n || 0).toLocaleString("id-ID")}`;

const OrderDetails: React.FC = () => {
  const cartById = useCartStore((s) => s.cartById);
  const { meals } = useSupabaseMeals();
  const cartItems = buildCartItems(cartById, meals);

  const [lat, setLat] = useState(-6.2);
  const [lng, setLng] = useState(106.8);
  const [address, setAddress] = useState<string | undefined>();

  // ✅ Stripe
  const { initiatePayment, loading: stripeLoading } = useStripeCheckout();
  const [popupVisible, setPopupVisible] = useState(false);

  // Client-side total is display-only. Server recalculates for payment.
  const subTotalFood = cartItems.reduce(
    (sum, it) => sum + Number(it.meal?.price ?? 0) * (it.qty ?? 0),
    0
  );
  const grandTotal = subTotalFood + TAX + HEALTH_INSURANCE;

  // ⭐ STRIPE PAYMENT HANDLER
  const handlePayNow = async () => {
    // Build cart items as {mealId, qty} pairs — the server looks up prices
    const cartEntries = Object.entries(useCartStore.getState().cartById).map(
      ([mealId, qty]) => ({ mealId, qty })
    );

    const result = await initiatePayment({
      type: "meal",
      cartItems: cartEntries,
    });

    if (result.success) {
      // ✅ Update local store optimistically
      // The webhook confirms server-side, but we update the UI immediately.
      const validItems = cartItems.filter(
        (it): it is { meal: NonNullable<typeof it.meal>; qty: number } =>
          !!it.meal
      );
      const order: CompletedOrder = {
        id: result.orderId || `${Date.now()}`,
        items: validItems as any,
        totalAmount: result.amount || grandTotal,
        paidAt: new Date().toISOString(),
      };

      // Add to local store (skip Supabase insert — the Edge Function already created the order)
      useOrderHistoryStore.setState((state) => ({
        orders: [order, ...state.orders],
      }));
      useCartStore.getState().clearCart();

      setPopupVisible(true);
    }
  };

  const Footer = () => (
    <View>
      <OrderSummaryCard items={cartItems.filter((item) => item.meal) as any} />

      <OrderMap
        latitude={lat}
        longitude={lng}
        address={address}
        onLocationChange={(newLat, newLng, newAddress) => {
          setLat(newLat);
          setLng(newLng);
          if (newAddress) setAddress(newAddress);
        }}
      />

      <View style={styles.totalPayRow}>
        <ThemedText style={styles.totalPayLabel}>TOTAL PAYMENT</ThemedText>
        <ThemedText style={styles.totalPayValue}>
          {formatRupiah(grandTotal)}
        </ThemedText>
      </View>

      {/* ✅ Pay Now button */}
      <Pressable
        onPress={handlePayNow}
        disabled={stripeLoading}
        style={({ pressed }) => [
          styles.payButton,
          pressed && !stripeLoading && { opacity: 0.85, transform: [{ scale: 0.985 }] },
          stripeLoading && styles.payButtonDisabled,
        ]}
      >
        {stripeLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.payButtonContent}>
            <MaterialIcons name="payment" size={22} color="#fff" />
            <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
            <MaterialIcons name="arrow-forward" size={22} color="#fff" />
          </View>
        )}
      </Pressable>
    </View>
  );

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
        {cartItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ThemedText style={styles.emptyText}>No meal was selected</ThemedText>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.meal?.id || "unknown"}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              item.meal ? <OrderItemCard meal={item.meal} qty={item.qty} /> : null
            }
            ListFooterComponent={<Footer />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      <SuccessPopup
        visible={popupVisible}
        onDismiss={() => setPopupVisible(false)}
        title="Hooray!"
        message={"Payment has been accepted! We're\npreparing your food now!"}
        dimOpacity={0.55}
      />
    </ThemedView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    paddingTop: 70, paddingHorizontal: 20,
    zIndex: 10,
  },
  headerContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: {
    fontSize: 25, color: "#34699A", fontFamily: "SF-Pro-DisplayRegular",
  },
  content: { paddingTop: 140, paddingHorizontal: 20, flex: 1 },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    fontSize: 18, color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular", fontWeight: "600",
  },
  totalPayRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 18, paddingVertical: 5,
  },
  totalPayLabel: {
    fontSize: 14, color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold", letterSpacing: 1,
  },
  totalPayValue: {
    fontSize: 20, color: "#34699A", fontFamily: "SF-Pro-DisplayBold",
  },
  payButton: {
    backgroundColor: "#37A446", height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
    marginTop: 16, marginBottom: 10,
  },
  payButtonDisabled: { backgroundColor: "#9CA3AF", opacity: 0.6 },
  payButtonContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  payButtonText: {
    color: "#ffffff", fontSize: 16, fontFamily: "SF-Pro-DisplayBold",
  },
});
