import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  Pressable,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useNavigation } from "expo-router";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import CategoryCard from "@modules/meals/components/CategoryCard";
import MealCard from "@modules/meals/components/MealCard";
import PrimaryButton from "@shared/components/ui/PrimaryButton";

import Categories from "@/data/categories.json";
import MEALS from "@/data/meals.json";
import { useAppFonts } from "@/assets/fonts";

import { useCartStore } from "@modules/cart/store/useCartStore";
import { useBottomSheet } from "@shared/hooks/useBottomSheet";
import { Category, Meal } from "@shared/types/data";

const SHEET_HEIGHT = 240;
const DRAG_HANDLE_HEIGHT = 40;

const formatRupiah = (n: number): string =>
  `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const Home: React.FC = () => {
  const fontsLoaded = useAppFonts();
  const navigation = useNavigation();

  const [activeId, setActiveId] = useState<string>("meat");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const cartById = useCartStore((s) => s.cartById);
  const addToCart = useCartStore((s) => s.addToCart);

  const {
    translateY,
    panResponder,
    sheetVisible,
    openSheet: _openSheet,
    closeSheet: _closeSheet,
    backdropOpacity,
  } = useBottomSheet({ sheetHeight: SHEET_HEIGHT });

  const openSheet = useCallback(() => {
    navigation.setOptions({ tabBarStyle: { display: "none" } });
    _openSheet();
  }, [navigation, _openSheet]);

  const closeSheet = useCallback(() => {
    _closeSheet();
    setTimeout(() => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          paddingTop: 20,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
          paddingBottom: 2,
        },
      });
    }, 260);
  }, [navigation, _closeSheet]);

  const categoryMeals = useMemo(
    () => (MEALS as Meal[]).filter((m) => m.categoryId === activeId),
    [activeId]
  );

  const mealById = useMemo(() => {
    const map: Record<string, Meal> = {};
    for (const m of MEALS as Meal[]) map[m.id] = m;
    return map;
  }, []);

  const cartKindsCount = useMemo(() => {
    return Object.values(cartById).filter((q) => (q ?? 0) > 0).length;
  }, [cartById]);

  if (!fontsLoaded) return null;

  // =========================
  // Draft Qty Helpers
  // =========================
  const getDraftQty = (mealId: string): number => qtyById[mealId] ?? 1;

  const ensureDraftQty = (mealId: string) => {
    setQtyById((prev) => (prev[mealId] ? prev : { ...prev, [mealId]: 1 }));
  };

  const setDraftQty = (mealId: string, nextQty: number) => {
    setQtyById((prev) => ({
      ...prev,
      [mealId]: Math.max(1, nextQty),
    }));
  };

  const handleIncDraft = (mealId: string) => {
    ensureDraftQty(mealId);
    setDraftQty(mealId, getDraftQty(mealId) + 1);
  };

  const handleDecDraft = (mealId: string) => {
    ensureDraftQty(mealId);
    setDraftQty(mealId, getDraftQty(mealId) - 1);
  };

  // =========================
  // Open Bottom Sheet
  // =========================
  const handlePressMealCard = (meal: Meal) => {
    setSelectedMealId(meal.id);
    ensureDraftQty(meal.id);
    openSheet();
  };

  // ⭐ NAVIGATE TO SHOPPING CART SCREEN
  const handleNavigateCart = () => {
    router.push("/ShoppingCartScreen");
  };

  // ⭐ NAVIGATE TO ORDER DETAIL SCREEN
  const handleNavigateOrderDetails = () => {
    router.push("/OrderDetailScreen");
    closeSheet();
  };

  // =========================
  // Checkout = Add To Cart
  // =========================
  const handleCheckout = () => {
    if (!selectedMealId) return;

    const qty = getDraftQty(selectedMealId);
    addToCart(selectedMealId, qty);
  };

  const selectedMeal = selectedMealId ? mealById[selectedMealId] : null;
  const selectedQty = selectedMealId ? getDraftQty(selectedMealId) : 1;
  const selectedLinePrice =
    Number(selectedMeal?.price ?? 0) * selectedQty;

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Category</ThemedText>

          {/* HEADER CART ICON */}
          <Pressable
            onPress={handleNavigateCart}
            style={({ pressed }) => [
              styles.cartButton,
              {
                opacity: pressed ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.92 : 1 }],
              },
            ]}
          >
            <MaterialIcons name="shopping-cart" size={36} color="#34699A" />
            {cartKindsCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {cartKindsCount}
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>

        <FlatList
          data={Categories as Category[]}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <CategoryCard
              label={item.label}
              icon={item.icon}
              active={item.id === activeId}
              onPress={() => {
                setActiveId(item.id);
                setSelectedMealId(null);
              }}
            />
          )}
        />
      </View>

      {/* CONTENT */}
      <View style={{ paddingHorizontal: 20, paddingTop: 245 }}>
        <ThemedText style={styles.categoryTitle}>Meat Your Day</ThemedText>

        <FlatList
          data={categoryMeals}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MealCard
                item={item}
                isSelected={selectedMealId === item.id}
                onPress={() => handlePressMealCard(item)}
                qty={getDraftQty(item.id)}
                onInc={() => handleIncDraft(item.id)}
                onDec={() => handleDecDraft(item.id)}
                onPressCart={handleCheckout}
              />
            </View>
          )}
        />
      </View>

      {/* BACKDROP */}
      {sheetVisible && (
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      )}

      {/* BOTTOM SHEET */}
      {sheetVisible && (
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY }] }]}
        >
          <View
            style={styles.handleArea}
            collapsable={false}
            {...panResponder.panHandlers}
          >
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetInner}>
            <ThemedText style={styles.sheetTitle}>
              Food That You Order
            </ThemedText>

            <View style={styles.checkoutWrap}>
              <PrimaryButton
                label="Checkout"
                icon="arrow-forward"
                onPress={handleNavigateOrderDetails}
              />
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLeft}>
                {selectedMealId
                  ? `${selectedQty}x ${selectedMeal?.name}`
                  : "Pilih makanan dulu"}
              </ThemedText>

              <ThemedText style={styles.summaryRight}>
                {selectedMealId
                  ? formatRupiah(selectedLinePrice)
                  : ""}
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      )}
    </ThemedView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 12,
    zIndex: 10,
    elevation: 10,
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 25,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  cartButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 6,
    backgroundColor: "#E74C3C",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "SF-Pro-DisplayBold",
    lineHeight: 14,
  },

  listContent: { paddingVertical: 8 },

  categoryTitle: {
    fontSize: 25,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    paddingBottom: 10,
  },

  gridRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },

  gridItem: { width: "48%" },

  gridContent: { paddingBottom: SHEET_HEIGHT },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 15,
  },

  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 20,
  },

  handleArea: {
    height: DRAG_HANDLE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#C4C4C4",
  },

  sheetInner: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },

  sheetTitle: {
    textAlign: "center",
    color: "#34699A",
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayRegular",
    marginBottom: 16,
  },

  checkoutWrap: { marginBottom: 18 },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLeft: {
    color: "#34699A",
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
  },

  summaryRight: {
    color: "#34699A",
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
  },
});
