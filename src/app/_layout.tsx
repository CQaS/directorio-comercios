import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { limpiarFavoritosInvalidos } from "../service/favoritos";


export default function RootLayout() {
  useEffect(() => {
    limpiarFavoritosInvalidos();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="comercio/[id]" />
        <Stack.Screen name="detalle-promocion" />
      <Stack.Screen name="mis-resenas" />
      </Stack>
    </GestureHandlerRootView>
  );
}
