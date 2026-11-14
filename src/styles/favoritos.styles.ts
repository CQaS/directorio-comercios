import { StyleSheet } from "react-native";

export const favoritosStyles = StyleSheet.create({
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
