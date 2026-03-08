import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedText from "@shared/components/ui/ThemedText";

type SuccessPopupProps = {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
  dimOpacity?: number; // 0..1
};

export function SuccessPopup({
  visible,
  onDismiss,
  title = "Hooray!",
  message = "Payment has been accepted! We’re\npreparing your food now!",
  dimOpacity = 0.55,
}: SuccessPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Tap di luar card => close */}
      <Pressable
        style={[styles.backdrop, { backgroundColor: `rgba(0,0,0,${dimOpacity})` }]}
        onPress={onDismiss}
      >
        {/* Tap di card => jangan close */}
        <Pressable
          style={styles.card}
          onPress={(e) => {
            // cegah press "tembus" ke backdrop
            // @ts-ignore
            e.stopPropagation?.();
          }}
          onTouchEnd={(e) => {
            // fallback untuk beberapa kasus RN
            // @ts-ignore
            e.stopPropagation?.();
          }}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="check" size={64} color="#FFFFFF" />
          </View>

          <ThemedText style={styles.title}>{title}</ThemedText>

          <ThemedText style={styles.message}>{message}</ThemedText>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 330,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#2EA043", // hijau seperti gambar
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    fontWeight: 700,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 18,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    textAlign: "center",
  },
});