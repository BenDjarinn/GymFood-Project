import React from "react";
import { Pressable, StyleSheet, View, StyleProp, ViewStyle, TextStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ThemedText from "./ThemedText";

interface PrimaryButtonProps {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label = "Button",
  onPress,
  disabled = false,
  style,
  textStyle,
  icon = "arrow-forward",
}) => {
  const isDisabled = disabled || !onPress;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        <ThemedText style={[styles.label, textStyle]}>{label}</ThemedText>

        <MaterialIcons
          name={icon as any}
          size={22}
          color="#fff"
          style={styles.icon}
        />
      </View>
    </Pressable>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#37A446",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  disabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    marginRight: 8,
  },

  icon: {
    marginTop: 1,
  },
});
