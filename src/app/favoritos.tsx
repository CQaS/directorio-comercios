import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
const urlBase = process.env.EXPO_PUBLIC_API_URL;

import { obtenerFavoritos, quitarFavorito } from "../service/favoritos";
import MensajeError from "../components/MensajeError";

export default function FavoritosScreen() {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [comercios, setComercios] = useState<any[]>([]);
  const [error, setError] = useState("");

  const cargarFavoritos = async () => {
    const ids = await obtenerFavoritos();
    setFavoritos(ids);
  };

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, []),
  );

  useEffect(() => {
    async function cargarComercios() {
      try {
        const respuesta = await fetch(`${urlBase}/comercios`);

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los comercios");
        }

        const resultado = await respuesta.json();

        setComercios(resultado.datos);
      } catch (error) {
        console.error("Error al cargar comercios:", error);
        setError("No se pudieron cargar los favoritos.");
      }
    }

    cargarComercios();
  }, []);

  const comerciosFavoritos = comercios.filter((comercio) =>
    favoritos.includes(comercio.id),
  );

  console.log("FAVORITOS GUARDADOS:", favoritos);
  console.log(
    "LLEGO EL TORNILLO?:",
    comercios.some((c) => c.id === "com-118"),
  );
  console.log(
    "COMERCIOS FAVORITOS:",
    comerciosFavoritos.map((c) => c.nombre),
  );

  const eliminarFavorito = async (id: string) => {
    await quitarFavorito(id);
    await cargarFavoritos();
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <MensajeError mensaje={error} />
      <View style={styles.encabezado}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>Volver</Text>
        </Pressable>
        <Text style={styles.titulo}>Comercios favoritos</Text>
      </View>

      {comerciosFavoritos.length === 0 ? (
        <Text style={styles.vacio}>
          Todavía no guardaste ningún comercio favorito.
        </Text>
      ) : (
        <FlatList
          data={comerciosFavoritos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Pressable
                style={styles.info}
                onPress={() => router.push(`/comercio/${item.id}`)}
              >
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.detalle}>{item.direccion}</Text>
                <Text style={styles.detalle}>{item.rubroId}</Text>
              </Pressable>

              <Pressable onPress={() => eliminarFavorito(item.id)}>
                <Text style={styles.eliminar}>Quitar</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 16,
  },
  encabezado: {
    marginBottom: 20,
  },
  volver: {
    color: "#0B3A5D",
    fontSize: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B3A5D",
  },
  vacio: {
    color: "#64748B",
    fontSize: 15,
    marginTop: 20,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  detalle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  eliminar: {
    color: "#D9534F",
    fontWeight: "bold",
    padding: 8,
  },
});
