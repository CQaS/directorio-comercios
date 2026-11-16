import { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { misResenasStyles as styles } from "../styles/misResenas.styles";
import { Resena } from "./comercio/[id]";
import Button from "../shared/ui/button";
import {
  obtenerMisResenasDeLaApi,
  obtenerResenasDeComercio,
} from "../service/resenas";
import { buscarComercios } from "../service/comercios";
import MensajeError from "../components/MensajeError";
import { useSesion } from "../contexto/sesion";

export default function MisResenasScreen() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [nombresComercios, setNombresComercios] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState("");
  const { usuario } = useSesion();
  const comercioDelUsuario =
    usuario?.rol === "comercio" ? usuario.comercioId : null;
  const esComercio = !!comercioDelUsuario;

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarMisResenas() {
        if (!usuario) {
          setResenas([]);
          setError("");
          return;
        }

        try {
          const resultado = comercioDelUsuario
            ? await obtenerResenasDeComercio(comercioDelUsuario)
            : await obtenerMisResenasDeLaApi();

          if (!activo) return;

          const ordenadas = [...resultado].sort(
            (a, b) =>
              new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime(),
          );

          setResenas(resultado);
          setError("");

          try {
            const comercios = await buscarComercios();

            if (!activo) return;

            const nombres = Object.fromEntries(
              comercios.map((comercio) => [comercio.id, comercio.nombre]),
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
    }, [usuario, comercioDelUsuario]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <MensajeError mensaje={error} />

      <Button title="Volver" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>
          {esComercio ? "Reseñas de mi comercio" : "Mis reseñas"}
        </Text>

        <Text style={styles.subtitulo}>
          {esComercio
            ? "Lo que opinan los vecinos sobre tu comercio"
            : "Tus opiniones sobre los comercios"}
        </Text>

        {resenas.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Text style={styles.mensaje}>
              {!usuario
                ? "Necesitás ingresar con tu cuenta para ver tus reseñas."
                : esComercio
                  ? "Todavía no te dejaron ninguna reseña."
                  : "Todavía no publicaste ninguna reseña."}
            </Text>
          </View>
        ) : (
          resenas.map((resena) => (
            <View key={resena.id} style={styles.tarjeta}>
              <Text style={styles.nombreComercio}>
                {esComercio
                  ? new Date(resena.creadaEn).toLocaleDateString("es-AR")
                  : (nombresComercios[resena.comercioId] ?? "Comercio")}
              </Text>

              <Text style={styles.estrellas}>
                {"⭐".repeat(resena.estrellas)}
              </Text>

              <Text style={styles.comentario}>{resena.comentario}</Text>

              {resena.respuesta && (
                <View style={styles.contenedorRespuesta}>
                  <Text style={styles.tituloRespuesta}>
                    Respuesta del comercio
                  </Text>

                  <Text style={styles.respuesta}>{resena.respuesta}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
