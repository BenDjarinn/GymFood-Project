import React from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import SubscriptionCard from "@modules/consultation/components/SubscriptionCard";

import { useSupabaseSubscriptionPlans } from "@shared/hooks/useSupabaseSubscriptionPlans";
import { SubscriptionPlan } from "@/data/subscriptionPlan";
import { subscriptionPlanImages } from "@shared/constants/subscriptionPlanImages";
import { useConsultationHistoryStore } from "@modules/consultation/store/useConsultationHistoryStore";

export default function ConsultationScreen() {
  const { plans: subscriptionPlans } = useSupabaseSubscriptionPlans();
  const hasActive = useConsultationHistoryStore((s) =>
    s.orders.some((o) => o.status === "active")
  );
  const activeSession = useConsultationHistoryStore((s) =>
    s.orders.find((o) => o.status === "active")
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerTitle}>
        Best Consultation Program, For You.
      </ThemedText>

      {/* ── Active Session Banner ── */}
      {hasActive && activeSession && (
        <Pressable
          style={({ pressed }) => [
            styles.activeBanner,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/consultation/ChatScreen",
              params: {
                orderId: activeSession.id,
                planName: activeSession.planName,
              },
            })
          }
        >
          <View style={styles.activeBannerContent}>
            <View style={styles.activeDot} />
            <View style={styles.activeBannerTextWrap}>
              <ThemedText style={styles.activeBannerTitle}>
                Active Session: {activeSession.planName}
              </ThemedText>
              <ThemedText style={styles.activeBannerSub}>
                Tap to continue your consultation
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#fff" />
          </View>
        </Pressable>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(subscriptionPlans as SubscriptionPlan[]).map((plan) => (
          <SubscriptionCard
            key={plan.subscription_plan}
            title={plan.subscription_plan}
            notes={plan.important_notes}
            image={subscriptionPlanImages[plan.image]}
            onPress={() => {
              if (hasActive) {
                // Don't allow new consultation while one is active
                return;
              }
              router.push({
                pathname: "/(tabs)/consultation/ProgramDetailScreen",
                params: { planId: plan.subscription_plan },
              });
            }}
            disabled={hasActive}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 25,
  },

  headerTitle: {
    fontSize: 24,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    marginVertical: 20,
  },

  /* ── Active Session Banner ── */
  activeBanner: {
    backgroundColor: "#34699A",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  activeBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  activeBannerTextWrap: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "SF-Pro-DisplayBold",
  },
  activeBannerSub: {
    fontSize: 12,
    color: "#B8D4EA",
    fontFamily: "SF-Pro-DisplayRegular",
    marginTop: 2,
  },

  scrollContent: {
    paddingBottom: 40,
  },
});
