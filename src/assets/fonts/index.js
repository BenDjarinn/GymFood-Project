import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    "SF-Pro-DisplayBold": require("../fonts/SF-PRO/SF-Pro-DisplayBold.otf"),
    "SF-Pro-DisplayMedium": require("../fonts/SF-PRO/SF-Pro-DisplayMedium.otf"),
    "SF-Pro-DisplayRegular": require("../fonts/SF-PRO/SF-Pro-DisplayRegular.otf"),
  });
  
  return fontsLoaded;
};
