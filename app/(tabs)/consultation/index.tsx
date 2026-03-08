import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import SubscriptionCard from "@modules/consultation/components/SubscriptionCard";

import subscriptionPlans from "@/data/subscriptionPlan.json";
import { subscriptionPlanImages } from "@shared/constants/subscriptionPlanImages";

interface SubscriptionPlan {
  subscription_plan: string;
  important_notes: string[];
  image: string;
}

export default function ConsultationScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerTitle}>
        Best Consultation Program, For You.
      </ThemedText>

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
            onPress={() =>
              router.push({
                pathname: "/(tabs)/consultation/ProgramDetailScreen",
                params: { planId: plan.subscription_plan },
              })
            }
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

  scrollContent: {
    paddingBottom: 40,
  },
});
