import { StyleSheet } from "react-native";

export const porIdstyles = StyleSheet.create({
  fila: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  tarjetaFicha: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderTopWidth: 4,
    borderTopColor: "#0B3A5D",
    // Sombra iOS
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // Sombra Android
    elevation: 4,
  },
  resena: {
    marginTop: 20,
    padding: 15,
  },
  filaEstrellas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  estrella: {
    fontSize: 32,
    color: "#F5B301",
  },
  campoComentario: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 10,
    minHeight: 90,
    textAlignVertical: "top",
    marginVertical: 8,
  },
  botonResena: {
    backgroundColor: "#333333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  textoBotonResena: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botonEliminar: {
    marginTop: 8,
    padding: 8,
    alignSelf: "flex-start",
  },
  textoEliminar: {
    color: "#C62828",
    fontWeight: "bold",
  },
  botonEditar: {
    marginTop: 4,
    padding: 8,
    alignSelf: "flex-start",
  },
  textoEditar: {
    color: "#1565C0",
    fontWeight: "bold",
  },
  botonReportar: {
    marginTop: 4,
    padding: 8,
    alignSelf: "flex-start",
  },
  textoReportar: {
    color: "#C62828",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B3A5D",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
  },
  descripcion: {
    fontSize: 14,
    color: "#334155",
    marginTop: 12,
    lineHeight: 20,
  },
  botonEscanear: {
    backgroundColor: "#0B3A5D",
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  contenedorCamara: {
    marginTop: 16,
    gap: 12,
  },
  camara: {
    height: 300,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  botonRespuesta: {
    backgroundColor: "#333333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  textoBotonRespuesta: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  encabezadoComercio: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  tituloComercio: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  badgeId: {
    backgroundColor: "#E6EEF4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 2,
  },
  textoBadgeId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B3A5D",
    letterSpacing: 0.3,
  },
  descripcionComercio: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  contenedorSinVideo: {
    width: "100%",
    height: 72,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
  },
  textoSinVideo: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  divisor: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  contenedorVideo: {
    borderRadius: 12,
    backgroundColor: "#000000",
  },
});
