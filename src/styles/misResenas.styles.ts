import { StyleSheet } from "react-native";

export const misResenasStyles = StyleSheet.create({
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
