import { Stack } from "expo-router";

export default function CheckoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingCartScreen" />
      <Stack.Screen name="OrderDetailScreen" />
      <Stack.Screen name="PaymentScreen" />
      <Stack.Screen name="ConsultationPaymentScreen" />
      <Stack.Screen name="LocationPicker" />
    </Stack>
  );
}
