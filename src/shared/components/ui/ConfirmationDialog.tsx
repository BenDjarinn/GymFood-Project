import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedText from "@shared/components/ui/ThemedText";

type DialogPhase = "confirm" | "success" | "error";

type ConfirmationDialogProps = {
  visible: boolean;
  /** Called when the dialog is fully dismissed. `result` tells you which path the user took. */
  onDismiss: (result: "success" | "error") => void;
  dimOpacity?: number;
};

/* ─── colour / copy constants ─── */
const YELLOW = "#F5B800";
const GREEN = "#2EA043";
const RED = "#B71C1C";

const CONTENT: Record<
  DialogPhase,
  {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    iconBg: string;
    title: string;
    titleColor: string;
    message: string;
  }
> = {
  confirm: {
    icon: "help",
    iconBg: YELLOW,
    title: "Are You Sure?",
    titleColor: "#2C5F8A",
    message: "Once you confirm, you will be\ndirected to payments page.",
  },
  success: {
    icon: "check",
    iconBg: GREEN,
    title: "Yay!",
    titleColor: "#2C5F8A",
    message: "Order has been placed.",
  },
  error: {
    icon: "close",
    iconBg: RED,
    title: "Oops!",
    titleColor: "#B71C1C",
    message:
      "Order cancelled. Feel free to browse\nthe menu again anytime!",
  },
};

export function ConfirmationDialog({
  visible,
  onDismiss,
  dimOpacity = 0.55,
}: ConfirmationDialogProps) {
  const [phase, setPhase] = useState<DialogPhase>("confirm");

  // Animated values for morph cross-fade
  const fadeOut = useRef(new Animated.Value(1)).current; // old content fades out
  const fadeIn = useRef(new Animated.Value(0)).current; // new content fades in
  const scale = useRef(new Animated.Value(1)).current; // subtle scale pulse

  // Keep track of result for backdrop dismiss
  const resultRef = useRef<"success" | "error">("error");

  // Reset when dialog opens
  useEffect(() => {
    if (visible) {
      setPhase("confirm");
      fadeOut.setValue(1);
      fadeIn.setValue(0);
      scale.setValue(1);
    }
  }, [visible]);

  const morphTo = useCallback(
    (next: "success" | "error") => {
      resultRef.current = next;

      // 1) fade-out + shrink old content
      Animated.parallel([
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2) swap phase, then fade-in + grow new content
        setPhase(next);
        Animated.parallel([
          Animated.timing(fadeIn, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fadeOut, fadeIn, scale]
  );

  const handleBackdropPress = () => {
    if (phase === "confirm") return; // don't dismiss on first state
    onDismiss(resultRef.current);
  };

  const c = CONTENT[phase];
  const isConfirmPhase = phase === "confirm";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isConfirmPhase) onDismiss(resultRef.current);
      }}
    >
      <Pressable
        style={[
          styles.backdrop,
          { backgroundColor: `rgba(0,0,0,${dimOpacity})` },
        ]}
        onPress={handleBackdropPress}
      >
        {/* ── Card ── */}
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Pressable
            // block press-through to backdrop
            onPress={(e) => {
              // @ts-ignore
              e.stopPropagation?.();
            }}
            onTouchEnd={(e) => {
              // @ts-ignore
              e.stopPropagation?.();
            }}
          >
            {/* If still in confirm phase, show with fadeOut anim */}
            {isConfirmPhase ? (
              <Animated.View
                style={[styles.content, { opacity: fadeOut }]}
              >
                {/* Icon */}
                <View
                  style={[styles.iconCircle, { backgroundColor: c.iconBg }]}
                >
                  <MaterialIcons name={c.icon} size={60} color="#FFFFFF" />
                </View>

                <ThemedText
                  style={[styles.title, { color: c.titleColor }]}
                >
                  {c.title}
                </ThemedText>
                <ThemedText style={styles.message}>{c.message}</ThemedText>

                {/* ── Buttons ── */}
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmBtn,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => morphTo("success")}
                >
                  <ThemedText style={styles.btnText}>
                    Yes, I'm certain
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => morphTo("error")}
                >
                  <ThemedText style={styles.btnText}>
                    No, i have not yet decide
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ) : (
              /* Result phase (success / error) — animates in */
              <Animated.View
                style={[styles.content, { opacity: fadeIn }]}
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: c.iconBg }]}
                >
                  <MaterialIcons name={c.icon} size={60} color="#FFFFFF" />
                </View>

                <ThemedText
                  style={[styles.title, { color: c.titleColor }]}
                >
                  {c.title}
                </ThemedText>
                <ThemedText style={styles.message}>{c.message}</ThemedText>
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
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
    maxWidth: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
  },
  content: {
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  /* ── Icon ── */
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  /* ── Text ── */
  title: {
    fontSize: 22,
    fontFamily: "SF-Pro-DisplayBold",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2C5F8A",
    fontFamily: "SF-Pro-DisplayRegular",
    textAlign: "center",
    marginBottom: 20,
  },

  /* ── Buttons ── */
  confirmBtn: {
    width: "100%",
    backgroundColor: "#319F43",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelBtn: {
    width: "100%",
    backgroundColor: "#C62828",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
  },
});
