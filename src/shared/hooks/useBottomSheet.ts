import { useRef, useState } from "react";
import { Animated, PanResponder, PanResponderGestureState } from "react-native";

interface UseBottomSheetOptions {
  sheetHeight: number;
  onClose?: () => void;
}

export const useBottomSheet = ({ sheetHeight, onClose }: UseBottomSheetOptions) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Store onClose in a ref so the panResponder always calls the latest version
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const openSheet = () => {
    setSheetVisible(true);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetVisible(false);
      onCloseRef.current?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: any, g: PanResponderGestureState) =>
        Math.abs(g.dy) > 5,

      onPanResponderMove: (_: any, g: PanResponderGestureState) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },

      onPanResponderRelease: (_: any, g: PanResponderGestureState) => {
        if (g.dy > sheetHeight * 0.3 || g.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  return {
    translateY,
    panResponder,
    sheetVisible,
    openSheet,
    closeSheet,
    backdropOpacity,
  };
};
