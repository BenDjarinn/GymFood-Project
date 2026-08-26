import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import { SuccessPopup } from "@/shared/components/ui/SuccessPopup";

import { useConsultationHistoryStore } from "@modules/consultation/store/useConsultationHistoryStore";
import { useStripeCheckout } from "@modules/checkout/hooks/useStripeCheckout";
import {
  CompletedConsultationOrder,
  ConsultationIntake,
} from "@shared/types/data";

const formatRupiah = (n: number): string =>
  `Rp. ${Number(n || 0).toLocaleString("id-ID")}`;

// Display-only prices (server looks up actual price from DB)
const DISPLAY_PRICES: Record<string, number> = {
  Beginner: 150000,
  Advanced: 300000,
  Pro: 500000,
};

const ConsultationPayment: React.FC = () => {
  const params = useLocalSearchParams<{
    planId: string;
    planImage: string;
    planNotes: string;
    intake?: string;
  }>();

  const planId = params.planId ?? "";
  const planImage = params.planImage ?? "";
  const planNotes: string[] = (() => {
    try { return JSON.parse(params.planNotes ?? "[]"); }
    catch { return []; }
  })();
  const intake: ConsultationIntake | undefined = (() => {
    if (!params.intake) return undefined;
    try { return JSON.parse(params.intake); }
    catch { return undefined; }
  })();

  // ✅ Stripe
  const { initiatePayment, loading: stripeLoading } = useStripeCheckout();
  const [popupVisible, setPopupVisible] = useState(false);
  const currentOrderRef = useRef<CompletedConsultationOrder | null>(null);

  const displayPrice = DISPLAY_PRICES[planId] ?? 150000;

  // ⭐ STRIPE PAYMENT HANDLER
  const handlePayNow = async () => {
    const result = await initiatePayment({
      type: "consultation",
      planName: planId,
      planImage,
      planNotes,
    });

    if (result.success) {
      // ✅ Update local store optimistically
      const order: CompletedConsultationOrder = {
        id: result.orderId || `consult-${Date.now()}`,
        planName: planId,
        planImage,
        planNotes,
        paidAt: new Date().toISOString(),
        status: "active",
        intake,
      };

      // Add to local store (skip Supabase — Edge Function already created the order)
      useConsultationHistoryStore.setState((state) => ({
        orders: [order, ...state.orders],
      }));

      currentOrderRef.current = order;
      setPopupVisible(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={36} color="#34699A" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Payment</ThemedText>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.planCard}>
          <ThemedText style={styles.planTitle}>{planId} Plan</ThemedText>
          {planNotes.map((note, i) => (
            <ThemedText key={i} style={styles.planNote}>{note}</ThemedText>
          ))}
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Total</ThemedText>
            <ThemedText style={styles.priceValue}>
              {formatRupiah(displayPrice)}
            </ThemedText>
          </View>
        </View>

        {/* ✅ Pay Now */}
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

      <SuccessPopup
        visible={popupVisible}
        onDismiss={() => {
          setPopupVisible(false);
          if (currentOrderRef.current) {
            router.replace({
              pathname: "/(tabs)/consultation/ChatScreen",
              params: {
                orderId: currentOrderRef.current.id,
                planName: currentOrderRef.current.planName,
                ...(intake ? { intake: JSON.stringify(intake) } : {}),
              },
            });
          }
        }}
        title="Hooray!"
        message={"Payment has been accepted!\nEnjoy your program!"}
        dimOpacity={0.55}
      />
    </ThemedView>
  );
};

export default ConsultationPayment;

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0,
    paddingTop: 70, paddingHorizontal: 20, zIndex: 10,
  },
  headerContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 25, color: "#34699A", fontFamily: "SF-Pro-DisplayRegular" },
  content: { paddingTop: 140, paddingHorizontal: 20, flex: 1 },
  planCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20,
    shadowColor: "#000", elevation: 3, marginBottom: 20,
  },
  planTitle: {
    fontSize: 20, color: "#34699A", fontFamily: "SF-Pro-DisplayBold", marginBottom: 12,
  },
  planNote: {
    fontSize: 14, color: "#34699A", fontFamily: "SF-Pro-DisplayRegular",
    marginBottom: 6, lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#E5E7EB",
  },
  priceLabel: {
    fontSize: 14, color: "#34699A", fontFamily: "SF-Pro-DisplayBold", letterSpacing: 1,
  },
  priceValue: { fontSize: 20, color: "#34699A", fontFamily: "SF-Pro-DisplayBold" },
  payButton: {
    backgroundColor: "#37A446", height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  payButtonDisabled: { backgroundColor: "#9CA3AF", opacity: 0.6 },
  payButtonContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  payButtonText: { color: "#ffffff", fontSize: 16, fontFamily: "SF-Pro-DisplayBold" },
});
