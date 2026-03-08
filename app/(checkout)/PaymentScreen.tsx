import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, FlatList, Animated } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";

import BankAccountCard, { BankAccountData } from "modules/checkout/components/BankAccountCard";
import bankAccounts from "@/data/bankAccount.json";

import { LoadingOverlay } from "@/shared/components/ui/LoadingOverlay";
import { SuccessPopup } from "@/shared/components/ui/SuccessPopup";

import { useCartStore } from "@modules/cart/store/useCartStore";
import { useOrderHistoryStore } from "@modules/cart/store/useOrderHistoryStore";
import { buildCartItems } from "@modules/cart/utils/cartSelectors";
import { CompletedOrder } from "@shared/types/data";

const Payment: React.FC = () => {
  const data = bankAccounts as BankAccountData[];

  // ✅ Toast state + animation
  const [toastVisible, setToastVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Loading + Popup
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const loadingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingDoneRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (loadingDelayRef.current) clearTimeout(loadingDelayRef.current);
    if (loadingDoneRef.current) clearTimeout(loadingDoneRef.current);

    timerRef.current = null;
    loadingDelayRef.current = null;
    loadingDoneRef.current = null;
  };

  const showToast = () => {
    // reset supaya tap berulang gak numpuk flow
    clearAllTimers();
    setLoadingVisible(false);
    setPopupVisible(false);

    setToastVisible(true);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    // toast tampil 1.6 detik
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 12,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) return;

        setToastVisible(false);

        // jeda 0.7 detik setelah toast hilang
        loadingDelayRef.current = setTimeout(() => {
          setLoadingVisible(true);

          // durasi loading (ubah sesuai kebutuhan)
          loadingDoneRef.current = setTimeout(() => {
            setLoadingVisible(false);

            // ✅ Save order to history before showing popup
            const cartById = useCartStore.getState().cartById;
            const items = buildCartItems(cartById).filter(
              (it): it is { meal: NonNullable<typeof it.meal>; qty: number } => !!it.meal
            );
            const totalAmount = items.reduce(
              (sum, it) => sum + it.meal.price * it.qty,
              0
            );
            const order: CompletedOrder = {
              id: `${Date.now()}`,
              items: items as any,
              totalAmount,
              paidAt: new Date().toISOString(),
            };
            useOrderHistoryStore.getState().addOrder(order);
            useCartStore.getState().clearCart();

            setPopupVisible(true);
          }, 2500); // <- contoh: 2.5 detik
        }, 700);
      });
    }, 1600);
  };

  useEffect(() => {
    // cleanup timer saat unmount biar aman
    return () => {
      clearAllTimers();
    };
  }, []);

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

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) =>
          `${item.bank_account.bank_name}-${item.bank_account.account_number}`
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <BankAccountCard data={item} onCopy={showToast} />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* TOAST BAR (global, bottom screen) */}
      {toastVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastWrap,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.toastBar}>
            <ThemedText style={styles.toastText}>Copied to Clipboard</ThemedText>
          </View>
        </Animated.View>
      )}

      {/* LOADING OVERLAY */}
      <LoadingOverlay visible={loadingVisible} label="Loading" dimOpacity={0.45} />

      {/* ✅ SUCCESS POPUP (muncul setelah loading selesai) */}
      <SuccessPopup
        visible={popupVisible}
        onDismiss={() => setPopupVisible(false)}
        title="Hooray!"
        message={"Payment has been accepted! We’re\npreparing your food now!"}
        dimOpacity={0.55}
      />
    </ThemedView>
  );
};

export default Payment;

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

  listContent: {
    paddingTop: 140,
    paddingBottom: 120,
  },

  toastWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 80,
    alignItems: "center",
    zIndex: 999,
  },

  toastBar: {
    backgroundColor: "#354044",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
    minWidth: 160,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },

  toastText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    textAlign: "center",
  },
});