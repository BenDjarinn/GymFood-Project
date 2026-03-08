import React from "react";
import { Pressable, StyleSheet, PressableProps, StyleProp, ViewStyle } from "react-native";
import { Colors } from "@shared/constants/Colors";

interface ThemedButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({ style, children, ...rest }) => {
  return (
    <Pressable style={[styles.button, style]} {...rest}>
      {children}
    </Pressable>
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
});
