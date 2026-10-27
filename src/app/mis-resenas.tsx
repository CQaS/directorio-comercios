
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { obtenerMisResenas } from "../service/resenas";
import { Resena } from "./comercio/[id]";
import Button from "../shared/ui/button";

export default function MisResenasScreen() {
    const [resenas, setResenas] = useState<Resena[]>([]);
    useFocusEffect(
        useCallback(() => {
    const resultado = obtenerMisResenas("usuario-actual");
    console.log("Mis reseñas guardadas:", resultado);
    setResenas(resultado);
}, [])
);

console.log("Cantidad de mis reseñas:", resenas.length);
return (
    <SafeAreaView style={styles.container}>
            <Button title="Volver" />
        <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Mis reseñas</Text>

        {resenas.length === 0 ? (
            <Text style={styles.mensaje}>Todavía no publicaste ninguna reseña.</Text>
        ) : (
            resenas.map((resena) => (
            <View key={resena.id} style={styles.tarjeta}>
                <Text style={styles.estrellas}>
                {"⭐".repeat(resena.estrellas)}
                </Text>
                <Text style={styles.comentario}>{resena.comentario}</Text>
                {resena.respuesta && (
                <Text style={styles.respuesta}>Respuesta del comercio: {resena.respuesta}</Text>
                )}
            </View>
            ))
        )}
        </ScrollView>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
},
contenido: {
    padding: 20,
},
titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B3A5D",
    marginBottom: 16,
},
mensaje: {
    fontSize: 16,
    color: "#64748B",
},
tarjeta: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
},
estrellas: {
    fontSize: 18,
    marginBottom: 8,
},
comentario: {
    fontSize: 16,
    color: "#334155",
},
respuesta: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 14,
},
});
