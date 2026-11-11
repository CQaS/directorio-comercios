// src/componentes/PantallaCarga.tsx
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

export function PantallaCarga() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007A55" />
      <Text style={styles.texto}>Cargando directorio de comercios...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  texto: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },
});
