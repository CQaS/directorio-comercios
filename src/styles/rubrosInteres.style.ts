import { StyleSheet } from "react-native";

export const rubrosInteresStyles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B3A5D",
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },
  fila: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  texto: {
    fontSize: 16,
    color: "#222",
  },
});
