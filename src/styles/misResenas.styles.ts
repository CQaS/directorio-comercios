import { StyleSheet } from "react-native";

export const misResenasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  contenido: {
    padding: 20,
    paddingBottom: 35,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#183153",
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5eaf1",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  nombreComercio: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#183153",
    marginBottom: 10,
  },
  estrellas: {
    fontSize: 19,
    marginBottom: 12,
  },
  comentario: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  contenedorRespuesta: {
    marginTop: 16,
    padding: 13,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#0e7490",
  },
  tituloRespuesta: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#183153",
    marginBottom: 6,
  },
  respuesta: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 21,
  },
  tarjetaVacia: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5eaf1",
  },
  mensaje: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
  },
});
