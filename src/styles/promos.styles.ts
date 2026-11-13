import { StyleSheet } from "react-native";

export const promosStyles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 25,
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },

  tarjeta: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
  },

  nombre: {
    fontSize: 13,
    fontWeight: "bold",
  },

  rubros: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginVertical: 15,
  },

  botonRubro: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#eee",
  },

  botonRubroSeleccionado: {
    backgroundColor: "#bde0fe",
    borderWidth: 1,
    borderColor: "#2196f3",
  },
});
