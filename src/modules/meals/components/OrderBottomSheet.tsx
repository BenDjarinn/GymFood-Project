import React from "react";
import { View, Animated, StyleSheet, PanResponderInstance } from "react-native";

import ThemedText from "@shared/components/ui/ThemedText";
import PrimaryButton from "@shared/components/ui/PrimaryButton";
import { formatRupiah } from "@shared/utils/formatRupiah";

const SHEET_HEIGHT = 240;
const DRAG_HANDLE_HEIGHT = 60;

interface OrderBottomSheetProps {
  sheetVisible: boolean;
  translateY: Animated.Value;
  panResponder: PanResponderInstance;
  backdropOpacity: Animated.Value;
  mealName: string | undefined;
  qty: number;
  linePrice: number;
  onCheckout: () => void;
}

const OrderBottomSheet: React.FC<OrderBottomSheetProps> = ({
  sheetVisible,
  translateY,
  panResponder,
  backdropOpacity,
  mealName,
  qty,
  linePrice,
  onCheckout,
}) => {
  if (!sheetVisible) return null;

  return (
    <>
      {/* BACKDROP */}
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      />

      {/* BOTTOM SHEET */}
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
              onPress={onCheckout}
            />
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLeft}>
              {mealName ? `${qty}x ${mealName}` : "Pilih makanan dulu"}
            </ThemedText>

            <ThemedText style={styles.summaryRight}>
              {mealName ? formatRupiah(linePrice) : ""}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

export default OrderBottomSheet;

const styles = StyleSheet.create({
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
