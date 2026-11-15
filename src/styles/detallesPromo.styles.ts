import { StyleSheet } from "react-native";

export const DetallesPromoStyles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 35,
    gap: 14,
    backgroundColor: "#f5f7fb",
  },

  cargando: {
    flex: 1,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#183153",
    marginTop: 8,
    marginBottom: 5,
  },

  botonGuardado: {
    backgroundColor: "#183153",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },

  textoBotonGuardado: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  descuento: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#075985",
    backgroundColor: "#e0f2fe",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "flex-start",
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#183153",
    marginTop: 12,
    marginBottom: 3,
  },

  texto: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 23,
  },

  etiqueta: {
    marginTop: 8,
    fontWeight: "600",
    fontSize: 14,
    color: "#075985",
    backgroundColor: "#e0f2fe",
    padding: 11,
    borderRadius: 10,
    overflow: "hidden",
  },

  contenedorQR: {
    alignItems: "center",
    gap: 14,
    marginTop: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5eaf1",
  },

    tarjetaPrincipal: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5eaf1",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },

  tarjetaInfo: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5eaf1",
    marginTop: 5,
  },
});
