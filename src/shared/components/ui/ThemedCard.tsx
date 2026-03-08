import React from "react";
import { StyleSheet, useColorScheme, View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { Colors } from "@shared/constants/Colors";

interface ThemedCardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const ThemedCard: React.FC<ThemedCardProps> = ({ style, children, ...rest }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.uiBackground }, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
});
