import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { limpiarFavoritosInvalidos } from "../service/favoritos";
import { obtenerBaseDatos } from "../service/baseDatos";
import { PantallaCarga } from "../components/PantallaCarga";
import { SesionProvider, useSesion } from "../contexto/sesion";
import { View, Text } from "react-native";
import * as Network from "expo-network";

function Navegacion() {
  const { estado } = useSesion();
  const [cargando, setCargando] = useState(true)

  const [sinConexion, setSinConexion] = useState(false);

useEffect(() => {
  async function comprobarConexion() {
    try {
      const estado = await Network.getNetworkStateAsync();
      setSinConexion(
        estado.isConnected === false ||
        estado.isInternetReachable === false
      );
    } catch (error) {
      console.error("Error al comprobar la conexión:", error);
    }
  }

  comprobarConexion();

  const suscripcion = Network.addNetworkStateListener((estado) => {
    setSinConexion(
      estado.isConnected === false ||
      estado.isInternetReachable === false
    );
  });

  return () => suscripcion.remove();
}, []);

  useEffect(() => {
      async function cargandoDatos() {
        try {
          await obtenerBaseDatos();
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
    <>
    {sinConexion && (
      <View
        style={{
          backgroundColor: "#c62828",
          padding: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Sin conexión a Internet
        </Text>
      </View>
    )}

    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={dentro}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="comercio/[id]" />
        <Stack.Screen name="detalle-promocion" />
        <Stack.Screen name="mis-resenas" />
        <Stack.Screen name="mis-promociones" />
        <Stack.Screen name="editar-comercio" />
      </Stack.Protected>

      <Stack.Protected guard={estado === "bloqueada"}>
        <Stack.Screen name="desbloqueo" />
      </Stack.Protected>

      <Stack.Protected guard={estado === "anonimo"}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  </>
);
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