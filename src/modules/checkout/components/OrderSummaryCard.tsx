import React from "react";
import { View, StyleSheet } from "react-native";
import ThemedText from "@shared/components/ui/ThemedText";
import { formatRupiah } from "@shared/utils/formatRupiah";
import { Meal } from "@shared/types/data";

interface CartItem {
  meal: Meal;
  qty: number;
}

interface SummaryRowProps {
  left: string;
  mid: string;
  right: string;
  bold?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ left, mid, right, bold = false }) => {
  return (
    <View style={styles.row}>
      <ThemedText style={[styles.left, bold && styles.bold]}>
        {left}
      </ThemedText>

      <ThemedText style={[styles.mid, bold && styles.bold]}>
        {mid}
      </ThemedText>

      <ThemedText style={[styles.right, bold && styles.bold]}>
        {right}
      </ThemedText>
    </View>
  );
};

interface OrderSummaryCardProps {
  items: CartItem[];
  tax?: number;
  insurance?: number;
  showTotal?: boolean;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  items,
  tax = 2000,
  insurance = 8000,
  showTotal = true,
}) => {
  const subTotal = items.reduce(
    (sum, it) => sum + Number(it.meal.price ?? 0) * (it.qty ?? 0),
    0
  );

  const grandTotal = subTotal + tax + insurance;

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>SUMMARY</ThemedText>
      <ThemedText style={styles.section}>Food Price</ThemedText>

      {items.map((it) => {
        const lineTotal = Number(it.meal.price ?? 0) * (it.qty ?? 0);
        return (
          <SummaryRow
            key={it.meal.id}
            left={it.meal.name}
            mid={`${it.qty}x`}
            right={formatRupiah(lineTotal)}
          />
        );
      })}

      <SummaryRow left="Tax" mid="" right={formatRupiah(tax)} />
      <SummaryRow left="Health Insurance" mid="" right={formatRupiah(insurance)} />
    </View>
  );
};

export default OrderSummaryCard;

const styles = StyleSheet.create({
  card: {
    marginTop: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D2D4D8",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  title: {
    fontSize: 14,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
    letterSpacing: 1,
    marginBottom: 20,
  },

  section: {
    fontSize: 14,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  left: {
    flex: 1,
    color: "#34699A",
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
  },

  mid: {
    width: 45,
    textAlign: "center",
    color: "#34699A",
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
  },

  right: {
    width: 95,
    textAlign: "right",
    color: "#34699A",
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
  },

  bold: {
    fontFamily: "SF-Pro-DisplayBold",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 8,
  },
});
