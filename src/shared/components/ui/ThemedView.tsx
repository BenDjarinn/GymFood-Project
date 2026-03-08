import React from "react";
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from "react-native";

interface ThemedViewProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const ThemedView: React.FC<ThemedViewProps> = ({ style, children, ...rest }) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
};

export default ThemedView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7ECF0",
  },
});
