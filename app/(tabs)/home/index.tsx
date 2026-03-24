import React, { useMemo, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { router, useNavigation } from "expo-router";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import HomeHeader from "@modules/meals/components/HomeHeader";
import CategoryList from "@modules/meals/components/CategoryList";
import MealGrid from "@modules/meals/components/MealGrid";
import OrderBottomSheet from "@modules/meals/components/OrderBottomSheet";

import meals from "@/data/meals";
import { useAppFonts } from "@/assets/fonts";

import { useCartStore } from "@modules/cart/store/useCartStore";
import { useBottomSheet } from "@shared/hooks/useBottomSheet";
import { useDraftQty } from "@modules/meals/hooks/useDraftQty";
import { TAB_BAR_STYLE } from "@shared/constants/tabBarStyle";
import { Meal } from "@shared/types/data";

const SHEET_HEIGHT = 240;

const Home: React.FC = () => {
  const fontsLoaded = useAppFonts();
  const navigation = useNavigation();

  const [activeId, setActiveId] = useState<string>("meat");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const cartById = useCartStore((s) => s.cartById);
  const addToCart = useCartStore((s) => s.addToCart);

  const { getDraftQty, ensureDraftQty, increment, decrement } = useDraftQty();

  // ── Tab bar visibility ──────────────────────────────────
  const restoreTabBar = useCallback(() => {
    navigation.setOptions({ tabBarStyle: TAB_BAR_STYLE });
  }, [navigation]);

  const hideTabBar = useCallback(() => {
    navigation.setOptions({ tabBarStyle: { display: "none" } });
  }, [navigation]);

  // ── Bottom sheet ────────────────────────────────────────
  const {
    translateY,
    panResponder,
    sheetVisible,
    openSheet,
    closeSheet,
    backdropOpacity,
  } = useBottomSheet({ sheetHeight: SHEET_HEIGHT, onClose: restoreTabBar });

  // ── Derived data ────────────────────────────────────────
  const categoryMeals = useMemo(
    () => (meals as Meal[]).filter((m) => m.categoryId === activeId),
    [activeId]
  );

  const mealById = useMemo(() => {
    const map: Record<string, Meal> = {};
    for (const m of meals as Meal[]) map[m.id] = m;
    return map;
  }, []);

  const cartKindsCount = useMemo(
    () => Object.values(cartById).filter((q) => (q ?? 0) > 0).length,
    [cartById]
  );

  if (!fontsLoaded) return null;

  // ── Handlers ────────────────────────────────────────────
  const handlePressMealCard = (meal: Meal) => {
    setSelectedMealId(meal.id);
    ensureDraftQty(meal.id);
    hideTabBar();
    openSheet();
  };

  const handleCheckout = () => {
    if (!selectedMealId) return;
    addToCart(selectedMealId, getDraftQty(selectedMealId));
  };

  const handleNavigateCart = () => router.push("/ShoppingCartScreen");

  const handleNavigateOrderDetails = () => {
    router.push("/OrderDetailScreen");
    closeSheet();
  };

  const handleSelectCategory = (id: string) => {
    setActiveId(id);
    setSelectedMealId(null);
  };

  // ── Selected meal info for bottom sheet ─────────────────
  const selectedMeal = selectedMealId ? mealById[selectedMealId] : null;
  const selectedQty = selectedMealId ? getDraftQty(selectedMealId) : 1;
  const selectedLinePrice = Number(selectedMeal?.price ?? 0) * selectedQty;

  // ── Render ──────────────────────────────────────────────
  return (
    <ThemedView style={styles.container}>
      {/* HEADER + CATEGORIES */}
      <View style={styles.overlay}>
        <HomeHeader
          cartKindsCount={cartKindsCount}
          onPressCart={handleNavigateCart}
        />
        <CategoryList
          activeId={activeId}
          onSelectCategory={handleSelectCategory}
        />
      </View>

      {/* MEAL GRID */}
      <View style={styles.content}>
        <ThemedText style={styles.categoryTitle}>Meat Your Day</ThemedText>

        <MealGrid
          meals={categoryMeals}
          selectedMealId={selectedMealId}
          onPressMeal={handlePressMealCard}
          getDraftQty={getDraftQty}
          onInc={increment}
          onDec={decrement}
          onPressCart={handleCheckout}
          bottomPadding={SHEET_HEIGHT}
        />
      </View>

      {/* BOTTOM SHEET */}
      <OrderBottomSheet
        sheetVisible={sheetVisible}
        translateY={translateY}
        panResponder={panResponder}
        backdropOpacity={backdropOpacity}
        mealName={selectedMeal?.name}
        qty={selectedQty}
        linePrice={selectedLinePrice}
        onCheckout={handleNavigateOrderDetails}
      />
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 245,
  },

  categoryTitle: {
    fontSize: 25,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    paddingBottom: 10,
  },
});
