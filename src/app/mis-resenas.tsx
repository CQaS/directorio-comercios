import { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { misResenasStyles as styles } from "../styles/misResenas.styles";
import { Resena } from "./comercio/[id]";
import Button from "../shared/ui/button";
import { obtenerMisResenasDeLaApi } from "../service/resenas";
import { buscarComercios } from "../service/comercios";
import MensajeError from "../components/MensajeError";

export default function MisResenasScreen() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [nombresComercios, setNombresComercios] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarMisResenas() {
        try {
          const resultado = await obtenerMisResenasDeLaApi();

          if (!activo) return;

          setResenas(resultado);
          setError("");

          try {
            const comercios = await buscarComercios();

            if (!activo) return;

            const nombres = Object.fromEntries(
              comercios.map((comercio) => [
                comercio.id,
                comercio.nombre,
              ]),
            );

            setNombresComercios(nombres);
          } catch (error) {
            console.error("Error al cargar los comercios:", error);
          }
        } catch (error) {
          console.error("Error al cargar mis reseñas:", error);

          if (activo) {
            setError("No se pudieron cargar tus reseñas.");
          }
        }
      }

      cargarMisResenas();

      return () => {
        activo = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <MensajeError mensaje={error} />

      <Button title="Volver" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Mis reseñas</Text>

        <Text style={styles.subtitulo}>
          Tus opiniones sobre los comercios
        </Text>

        {resenas.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Text style={styles.mensaje}>
              Todavía no publicaste ninguna reseña.
            </Text>
          </View>
        ) : (
          resenas.map((resena) => (
            <View key={resena.id} style={styles.tarjeta}>
              <Text style={styles.nombreComercio}>
                {nombresComercios[resena.comercioId] ??
                  "Comercio no identificado"}
              </Text>

              <Text style={styles.estrellas}>
                {"⭐".repeat(resena.estrellas)}
              </Text>

              <Text style={styles.comentario}>
                {resena.comentario}
              </Text>

              {resena.respuesta && (
                <View style={styles.contenedorRespuesta}>
                  <Text style={styles.tituloRespuesta}>
                    Respuesta del comercio
                  </Text>

                  <Text style={styles.respuesta}>
                    {resena.respuesta}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
