import { StyleSheet } from "react-native";

export const loginStyles = StyleSheet.create({
  pantallaSegura: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tecladoContenedor: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  tarjeta: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B3A5D",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 28,
  },
  campo: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },
  textoError: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  botonPrimario: {
    backgroundColor: "#0B3A5D",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  textoBotonPrimario: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  botonSecundario: {
    paddingVertical: 10,
    alignItems: "center",
  },
  textoBotonSecundario: {
    color: "#0B3A5D",
    fontSize: 14,
    fontWeight: "600",
  },
});
