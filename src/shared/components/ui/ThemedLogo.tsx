import React from "react";
import { Image, useColorScheme, ImageProps } from "react-native";

type ThemedLogoProps = Omit<ImageProps, "source">;

import DarkLogo from "@/assets/img/logo_dark.png";
import LightLogo from "@/assets/img/logo_light.png";

const ThemedLogo: React.FC<ThemedLogoProps> = (props) => {
  const colorScheme = useColorScheme();
  const source = colorScheme === "dark" ? DarkLogo : LightLogo;

  return <Image source={source} {...props} />;
};

export default ThemedLogo;
