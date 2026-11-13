import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { limpiarFavoritosInvalidos } from "../service/favoritos";
import { PantallaCarga } from "../components/PantallaCarga";
import { SesionProvider, useSesion } from "../contexto/sesion";

function Navegacion() {
  const { estado } = useSesion();
  const [cargando, setCargando] = useState(true)

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
      cargandoDatos()
  }, [])

  
  if (cargando || estado === "cargando") {
      return <PantallaCarga />;
  }

  const dentro = estado === "autenticado" || estado === "invitado";

  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={dentro}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="comercio/[id]" />
          <Stack.Screen name="detalle-promocion" />
          <Stack.Screen name="mis-resenas" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "bloqueada"}>
          <Stack.Screen name="desbloqueo" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "anonimo"}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    )
}

export default function RootLayout() {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SesionProvider>
          <Navegacion />
        </SesionProvider>
      </GestureHandlerRootView>
    )
}