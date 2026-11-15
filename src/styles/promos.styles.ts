import { StyleSheet } from "react-native";

export const promosStyles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 12,
    backgroundColor: "#f5f7fb",
  },

  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#183153",
    marginBottom: 12,
    marginTop: 10,
    textAlign: "center",
  },

  subtitulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#183153",
    marginTop: 20,
    marginBottom: 12,
    alignSelf: "flex-start",
    marginLeft: 5,
  },

  tarjeta: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5eaf1",
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  nombre: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#183153",
    marginBottom: 7,
  },

  rubros: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 9,
    marginVertical: 15,
  },

  botonRubro: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e8edf5",
    borderWidth: 1,
    borderColor: "#dce3ed",
  },

  botonRubroSeleccionado: {
    backgroundColor: "#183153",
    borderWidth: 1,
    borderColor: "#183153",
  },

  tarjetaContenido: {
    gap: 8,
  },

  comercio: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },

  descuento: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    color: "#075985",
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: "hidden",
  },

  detalle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  
  informacion: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
  },
});
