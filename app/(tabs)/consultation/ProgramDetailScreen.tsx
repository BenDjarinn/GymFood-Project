import React, { useState } from "react";
import { ConfirmationDialog } from "@shared/components/ui/ConfirmationDialog";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";

import dietPlans from "@/data/dietPlan";
import subscriptionPlans, { SubscriptionPlan } from "@/data/subscriptionPlan";

export default function ProgramDetailScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plan = (subscriptionPlans as SubscriptionPlan[]).find(
    (p) => p.subscription_plan === planId
  );
  const [healthConcern, setHealthConcern] = useState("");
  const [selectedDiet, setSelectedDiet] = useState<string | null>(
    dietPlans[0].label
  );
  const [foodAllergy, setFoodAllergy] = useState("");
  const [bodyGoals, setBodyGoals] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const isFormValid =
    healthConcern.trim().length > 0 &&
    foodAllergy.trim().length > 0 &&
    bodyGoals.trim().length > 0;


  return (
    <ThemedView style={styles.container}>
      {/* FLOATING HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={32} color="#34699A" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Program Detail</ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Q1: Health Concern ── */}
        <ThemedText style={styles.questionLabel}>
          Any concern on health issue?
        </ThemedText>

        <TextInput
          style={styles.textArea}
          placeholder="Describe"
          placeholderTextColor="#A0BDD4"
          multiline
          textAlignVertical="top"
          value={healthConcern}
          onChangeText={setHealthConcern}
        />

        {/* ── Diet Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {dietPlans.map((opt) => {
            const active = selectedDiet === opt.label;
            return (
              <Pressable
                key={opt.label}
                style={[
                  styles.chip,
                  opt.label === "Veggies + Meat" && { backgroundColor: "#34699A" },
                  active && styles.chipActive,
                ]}
                onPress={() => setSelectedDiet(opt.label)}
              >
                <ThemedText style={styles.chipEmoji}>{opt.emoji}</ThemedText>
                <ThemedText
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Q2: Food Allergy ── */}
        <ThemedText style={styles.questionLabel}>Food alergy?</ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Describe"
          placeholderTextColor="#A0BDD4"
          multiline
          textAlignVertical="top"
          value={foodAllergy}
          onChangeText={setFoodAllergy}
        />

        {/* ── Q3: Body Goals ── */}
        <ThemedText style={styles.questionLabel}>Body Goals</ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Describe"
          placeholderTextColor="#A0BDD4"
          multiline
          textAlignVertical="top"
          value={bodyGoals}
          onChangeText={setBodyGoals}
        />

        {/* ── Checkout Button ── */}
        <Pressable
          onPress={() => {
            if (!isFormValid) return;
            setShowConfirm(true);
          }}
          disabled={!isFormValid}
          style={({ pressed }) => [
            styles.checkoutButton,
            !isFormValid && styles.checkoutButtonDisabled,
            pressed && isFormValid && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <ThemedText style={styles.checkoutButtonText}>Checkout</ThemedText>
          <MaterialIcons name="send" size={26} color="#fff" />
        </Pressable>
      </ScrollView>

      {/* ── Confirmation Dialog ── */}
      <ConfirmationDialog
        visible={showConfirm}
        onDismiss={(result) => {
          setShowConfirm(false);
          if (result === "success" && plan) {
            router.push({
              pathname: "/(checkout)/ConsultationPaymentScreen",
              params: {
                planId: plan.subscription_plan,
                planImage: plan.image,
                planNotes: JSON.stringify(plan.important_notes),
              },
            });
          }
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ── Header ── */
  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    fontSize: 22,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  scrollContent: {
    paddingTop: 25,
    paddingBottom: 50,
    paddingHorizontal: 25,
  },

  /* ── Question label ── */
  questionLabel: {
    fontSize: 20,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    marginBottom: 20,
  },

  /* ── Multiline TextInput ── */
  textArea: {
    borderWidth: 1,
    borderColor: "#D0DDE8",
    borderRadius: 14,
    padding: 14,
    minHeight: 200,
    fontSize: 15,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    backgroundColor: "#fff",
    marginBottom: 20,
  },

  /* ── Diet Chips ── */
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#727272",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },

  chipActive: {
    backgroundColor: "#319F43",
  },

  chipEmoji: {
    fontSize: 16,
  },

  chipLabel: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#fff",
  },

  chipLabelActive: {
    fontFamily: "SF-Pro-DisplayBold",
  },

  /* ── Checkout Button ── */
  checkoutButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 30,
    width: "70%",
    alignSelf: "center",
  },

  checkoutButtonDisabled: {
    backgroundColor: "#A8D5AB",
  },

  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayBold",
  },
});
