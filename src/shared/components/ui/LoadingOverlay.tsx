import React from "react";
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";

type LoadingOverlayProps = {
  visible: boolean;
  label?: string;
  dimOpacity?: number; // 0..1
  spinnerSize?: "small" | "large" | number; // number Android-only
};

export function LoadingOverlay({
  visible,
  label = "Loading",
  dimOpacity = 0.45,
  spinnerSize = Platform.OS === "android" ? 44 : "large",
}: LoadingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={[
          styles.backdrop,
          { backgroundColor: `rgba(0,0,0,${dimOpacity})` },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.text}>{label}</Text>

          {/* size bisa "large" (iOS/Android) atau angka (Android-only) */}
          <ActivityIndicator size={spinnerSize} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    minWidth: 170,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34699A",
  },
});