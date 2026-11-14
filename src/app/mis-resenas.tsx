import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { misResenasStyles as styles } from "../styles/misResenas.styles";
import { Resena } from "./comercio/[id]";
import Button from "../shared/ui/button";
import { obtenerMisResenasDeLaApi } from "../service/resenas";
import MensajeError from "../components/MensajeError";

export default function MisResenasScreen() {
    const [resenas, setResenas] = useState<Resena[]>([]);
    const [error, setError] = useState("");
    
    useFocusEffect(
        useCallback(() => {
    let activo = true;

      async function cargarMisResenas() {
        try {
          const resultado = await obtenerMisResenasDeLaApi();

          if (activo) {
            console.log("Mis reseñas:", resultado);
            setResenas(resultado);
          }
        
    } catch (error) {
        console.error("Error al cargar mis reseñas:", error);
        setError("No se pudieron cargar tus reseñas.");
    }
    }

      cargarMisResenas();

      return () => {
        activo = false;
      };
    }, []),
  );

  console.log("Cantidad de mis reseñas:", resenas.length);
  return (
    <SafeAreaView style={styles.container}>
        <MensajeError mensaje={error} />
            <Button title="Volver" />
        <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Mis reseñas</Text>

        {resenas.length === 0 ? (
          <Text style={styles.mensaje}>
            Todavía no publicaste ninguna reseña.
          </Text>
        ) : (
          resenas.map((resena) => (
            <View key={resena.id} style={styles.tarjeta}>
              <Text style={styles.estrellas}>
                {"⭐".repeat(resena.estrellas)}
              </Text>
              <Text style={styles.comentario}>{resena.comentario}</Text>
              {resena.respuesta && (
                <Text style={styles.respuesta}>
                  Respuesta del comercio: {resena.respuesta}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
