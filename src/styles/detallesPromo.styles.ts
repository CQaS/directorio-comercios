import { StyleSheet } from "react-native";

export const DetallesPromoStyles = StyleSheet.create({
  contenedor: {
    padding: 20,
    gap: 12,
  },

  botonGuardado: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },

  textoBotonGuardado: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  cargando: {
    flex: 1,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "bold",
  },

  descuento: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  texto: {
    fontSize: 15,
  },

  etiqueta: {
    marginTop: 12,
    fontWeight: "bold",
  },

  contenedorQR: {
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    padding: 16,
  },
});
