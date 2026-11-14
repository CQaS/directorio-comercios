import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { favoritosStyles as styles } from "../styles/favoritos.styles";

import { obtenerFavoritos, quitarFavorito } from "../service/favoritos";

import MensajeError from "../components/MensajeError";
import { buscarComercios } from "../service/comercios";
import { Comercio } from "../tipos";
import { PantallaCarga } from "../components/PantallaCarga";

export default function FavoritosScreen() {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
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
    async function cargarDatosComercios() {
      try {
        const listaComercios = await buscarComercios();
        setComercios(listaComercios);
      } catch (error) {

        console.error("Error al cargar comercios:", error);
        setError("No se pudieron cargar los favoritos.");
      } finally {
        setCargando(false);

      }
    }

    cargarDatosComercios();
  }, []);

  const eliminarFavoritoDeLista = async (id: string) => {
    await quitarFavorito(id);
    await cargarFavoritos();
  };

  const comerciosFavoritos = comercios.filter((comercio) =>
    favoritos.includes(comercio.id),
  );

  if (cargando) {
    return <PantallaCarga />;
  }

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

              <Pressable onPress={() => eliminarFavoritoDeLista(item.id)}>
                <Text style={styles.eliminar}>Quitar</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
