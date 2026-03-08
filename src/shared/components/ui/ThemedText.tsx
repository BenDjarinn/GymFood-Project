import React from "react";
import { Text, useColorScheme, TextProps, StyleProp, TextStyle } from "react-native";
import { Colors } from "@shared/constants/Colors";

interface ThemedTextProps extends TextProps {
  title?: boolean;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const ThemedText: React.FC<ThemedTextProps> = ({ title, style, children, ...rest }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;
  const color = title ? theme.title : theme.text;

  return (
    <Text style={[{ color }, style]} {...rest}>
      {children}
    </Text>
  );
};

export default ThemedText;
