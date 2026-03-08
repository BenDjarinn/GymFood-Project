import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import OrderItemCard from "@modules/checkout/components/OrderItemCard";
import OrderSummaryCard from "@modules/checkout/components/OrderSummaryCard";
import PaymentMethodCard from "@modules/checkout/components/PaymentMethodCard";
import OrderMap from "@modules/checkout/components/OrderMap";

import { useCartStore } from "@modules/cart/store/useCartStore";
import { buildCartItems } from "@modules/cart/utils/cartSelectors";

import paymentMethods from "@/data/paymentMethod.json";
import { paymentIcons } from "@shared/constants/paymentIcons";
import { PaymentMethod } from "@shared/types/data";

import Geocoder from "react-native-geocoding";

Geocoder.init("YOUR_GOOGLE_API_KEY");

const TAX = 2000;
const HEALTH_INSURANCE = 8000;

const PAYMENT_ROUTE_MAP: Record<string, string> = {
  bca: "/PaymentScreen",
};

const formatRupiah = (n: number): string =>
  `Rp. ${Number(n || 0).toLocaleString("id-ID")}`;

const OrderDetails: React.FC = () => {
  const cartById = useCartStore((s) => s.cartById);
  const cartItems = buildCartItems(cartById);

  const [lat, setLat] = useState(-6.2);
  const [lng, setLng] = useState(106.8);

  const subTotalFood = cartItems.reduce(
    (sum, it) => sum + Number(it.meal?.price ?? 0) * (it.qty ?? 0),
    0
  );

  const grandTotal = subTotalFood + TAX + HEALTH_INSURANCE;

  // ⭐ BEST PRACTICE HANDLER
  const handlePaymentPress = useCallback((method: PaymentMethod) => {
    const route = PAYMENT_ROUTE_MAP[method.id];

    if (route) {
      router.push(route);
      return;
    }

    console.log(`${method.id} selected`);
  }, []);

  const Footer = () => (
    <View>
      <OrderSummaryCard items={cartItems.filter(item => item.meal) as any} />

      <OrderMap
        latitude={lat}
        longitude={lng}
        onLocationChange={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
        }}
      />

      <View style={styles.totalPayRow}>
        <ThemedText style={styles.totalPayLabel}>TOTAL PAYMENT</ThemedText>
        <ThemedText style={styles.totalPayValue}>
          {formatRupiah(grandTotal)}
        </ThemedText>
      </View>

      <View style={styles.paymentSection}>
        {(paymentMethods as PaymentMethod[]).map((method) => (
          <PaymentMethodCard
            key={method.id}
            label={method.label}
            logo={paymentIcons[method.icon]}
            onPress={() => handlePaymentPress(method)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={36} color="#34699A" />
          </Pressable>

          <ThemedText style={styles.headerTitle}>
            Order Details
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ThemedText style={styles.emptyText}>
              No meal was selected
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.meal?.id || "unknown"}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              item.meal ? (
                <OrderItemCard meal={item.meal} qty={item.qty} />
              ) : null
            }
            ListFooterComponent={<Footer />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </ThemedView>
  );
};

export default OrderDetails;

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

  paymentSection: {
    marginTop: 10,
    paddingBottom: 10,
  },

  paymentTitle: {
    fontSize: 14,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
    letterSpacing: 1,
    marginBottom: 10,
  },
});
