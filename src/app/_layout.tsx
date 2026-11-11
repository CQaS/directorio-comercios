import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { limpiarFavoritosInvalidos } from "../service/favoritos";
import { PantallaCarga } from "../components/PantallaCarga";

export default function RootLayout() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargandoDatos() {
      try {
        await limpiarFavoritosInvalidos();
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setCargando(false);
      }
    }
    cargandoDatos();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {cargando ? (
        <PantallaCarga />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="comercio/[id]" />
          <Stack.Screen name="detalle-promocion" />
          <Stack.Screen name="mis-resenas" />
        </Stack>
      )}
    </GestureHandlerRootView>
  );
}
