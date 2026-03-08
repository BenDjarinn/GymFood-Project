import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ThemedText from "@shared/components/ui/ThemedText";
import { Meal } from "@shared/types/data";

const BLUE = "#34699A";
const FIRE = "#E74C3C";

const BORDER_NORMAL = 1;
const BORDER_SELECTED = 3;
const BORDER_CONTROL = 2.5;

interface MealCardProps {
  item: Meal;
  onPress: () => void;
  isSelected: boolean;
  qty?: number;
  onInc: () => void;
  onDec: () => void;
  onPressCart: () => void;
}

const MealCard: React.FC<MealCardProps> = ({
  item,
  onPress,
  isSelected,
  qty = 1,
  onInc,
  onDec,
  onPressCart,
}) => {
  const title = item.name ?? "Meal";
  const calories = item.calories ?? 0;
  const price = item.price ?? 0;
  const protein = item.protein ?? 0;
  const carbs = item.carbs ?? 0;
  const fat = item.fat ?? 0;

  const rupiah = (n: number) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressedCard,
        isSelected && styles.selected,
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.left}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {title}
            </ThemedText>

            <View style={styles.kcalRow}>
              <ThemedText style={styles.kcalText}>{calories} kl</ThemedText>
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color={FIRE}
                style={styles.fireIcon}
              />
            </View>

            <ThemedText style={styles.price}>{rupiah(price)}</ThemedText>
          </View>

          <View style={styles.right}>
            <MacroLine value={protein} label="Protein" />
            <MacroLine value={carbs} label="Carbs" />
            <MacroLine value={fat} label="Fat" />
          </View>
        </View>

        {isSelected && (
          <View style={styles.controlsRow}>
            <View style={styles.stepper}>
              <Pressable onPress={onDec} hitSlop={10} style={styles.stepBtn}>
                <ThemedText style={styles.stepIcon}>—</ThemedText>
              </Pressable>

              <ThemedText style={styles.qty}>{qty}</ThemedText>

              <Pressable onPress={onInc} hitSlop={10} style={styles.stepBtn}>
                <ThemedText style={styles.stepIcon}>+</ThemedText>
              </Pressable>
            </View>

            {/* ⭐ CART BUTTON WITH PRESS EFFECT */}
            <Pressable
              onPress={onPressCart}
              hitSlop={10}
              style={({ pressed }) => [
                styles.cartBtn,
                pressed && styles.cartPressed,
              ]}
            >
              <MaterialIcons name="shopping-cart" size={24} color={BLUE} />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
};

interface MacroLineProps {
  value: number;
  label: string;
}

const MacroLine: React.FC<MacroLineProps> = ({ value, label }) => {
  return (
    <ThemedText style={styles.macroLine}>
      <ThemedText style={styles.macroValue}>{value}</ThemedText>
      <ThemedText style={styles.macroUnit}> g</ThemedText>
      <ThemedText style={styles.macroLabel}>  {label}</ThemedText>
    </ThemedText>
  );
};

export default MealCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: BORDER_NORMAL,
    borderColor: "rgba(52,105,154,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0.5,
  },

  pressedCard: {
    opacity: 0.97,
    transform: [{ scale: 0.995 }],
  },

  selected: {
    borderWidth: BORDER_SELECTED,
    borderColor: BLUE,
  },

  image: {
    width: "100%",
    height: 140,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,
    paddingRight: 10,
  },

  right: {
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 2,
    minWidth: 86,
  },

  title: {
    color: BLUE,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "SF-Pro-DisplayBold",
  },

  kcalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  kcalText: {
    color: BLUE,
    fontSize: 13,
    fontFamily: "SF-Pro-DisplayRegular",
  },

  fireIcon: {
    marginLeft: 8,
  },

  price: {
    marginTop: 12,
    color: BLUE,
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
  },

  macroLine: {
    color: BLUE,
    fontSize: 12,
    fontFamily: "SF-Pro-DisplayRegular",
  },

  macroValue: {
    fontFamily: "SF-Pro-DisplayBold",
  },

  macroUnit: {
    fontFamily: "SF-Pro-DisplayRegular",
  },

  macroLabel: {
    fontFamily: "SF-Pro-DisplayRegular",
  },

  controlsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: BORDER_CONTROL,
    borderColor: BLUE,
    borderRadius: 999,
    height: 32,
    paddingHorizontal: 10,
    minWidth: 90,
    justifyContent: "space-between",
  },

  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  stepIcon: {
    color: BLUE,
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    lineHeight: 16,
  },

  qty: {
    color: BLUE,
    fontSize: 15,
    fontFamily: "SF-Pro-DisplayBold",
  },

  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: BORDER_CONTROL,
    borderColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  /* ⭐ PRESS EFFECT STYLE */
  cartPressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.6,
    backgroundColor: "#EAF2F8",
  },
});
