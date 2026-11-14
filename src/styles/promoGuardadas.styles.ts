import { StyleSheet } from "react-native";

export const promoGuardadasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
    backgroundColor: "#FFFFFF",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0B3A5D",
  },
  contenido: {
    padding: 16,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },
  rubro: {
    color: "#4285A8",
    fontSize: 13,
    marginBottom: 6,
  },
  tituloPromo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0B3A5D",
    marginBottom: 8,
  },
  detalle: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 10,
  },
  descuento: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16834A",
    marginBottom: 8,
  },
  fecha: {
    fontSize: 13,
    color: "#777777",
  },
  botones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  botonVer: {
    backgroundColor: "#0B3A5D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  textoBotonVer: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botonEliminar: {
    padding: 10,
  },
  vacio: {
    alignItems: "center",
    marginTop: 70,
    gap: 14,
  },
  mensaje: {
    textAlign: "center",
    color: "#777777",
    fontSize: 15,
    marginTop: 15,
  },
});
