import React from "react";
import { View, FlatList, StyleSheet } from "react-native";

import MealCard from "./MealCard";
import { Meal } from "@shared/types/data";

interface MealGridProps {
  meals: Meal[];
  selectedMealId: string | null;
  onPressMeal: (meal: Meal) => void;
  getDraftQty: (mealId: string) => number;
  onInc: (mealId: string) => void;
  onDec: (mealId: string) => void;
  onPressCart: () => void;
  bottomPadding?: number;
}

const MealGrid: React.FC<MealGridProps> = ({
  meals,
  selectedMealId,
  onPressMeal,
  getDraftQty,
  onInc,
  onDec,
  onPressCart,
  bottomPadding = 240,
}) => (
  <FlatList
    data={meals}
    keyExtractor={(item) => item.id}
    numColumns={2}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: bottomPadding }}
    columnWrapperStyle={styles.gridRow}
    renderItem={({ item }) => (
      <View style={styles.gridItem}>
        <MealCard
          item={item}
          isSelected={selectedMealId === item.id}
          onPress={() => onPressMeal(item)}
          qty={getDraftQty(item.id)}
          onInc={() => onInc(item.id)}
          onDec={() => onDec(item.id)}
          onPressCart={onPressCart}
        />
      </View>
    )}
  />
);

export default MealGrid;

const styles = StyleSheet.create({
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },

  gridItem: { width: "48%" },
});
