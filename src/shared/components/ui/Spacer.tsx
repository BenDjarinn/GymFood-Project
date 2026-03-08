import React from "react";
import { View, DimensionValue } from "react-native";

interface SpacerProps {
  height?: DimensionValue;
}

const Spacer: React.FC<SpacerProps> = ({ height = 60 }) => {
  return <View style={{ height }} />;
};

export default Spacer;
