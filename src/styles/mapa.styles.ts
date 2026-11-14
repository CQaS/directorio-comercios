import { StyleSheet } from "react-native";

export const mapaStyles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contenedorCargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#7A5C3E",
  },
  contenedorMapa: {
    height: "50%",
    width: "100%",
  },
  mapa: {
    width: "100%",
    height: "100%",
  },
  contenedorListado: {
    height: "50%",
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
  },
  subtituloListado: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  cardComercio: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },

  infoComercio: {
    flex: 1,
    minWidth: 0,
  },
  nombreComercio: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },
  direccionComercio: {
    fontSize: 13,
    color: "#666",
  },
  badgeDistancia: {
    backgroundColor: "#7A5C3E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoDistancia: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  barraFiltrosContainer: {
    
    top: 10,
    zIndex: 10,
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  scrollFiltros: {
    paddingVertical: 5,
  },
  botonFiltro: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botonFiltroActivo: {
    backgroundColor: "#7A5C3E",
  },
  textoFiltro: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  textoFiltroActivo: {
    color: "#fff",
  },
  calloutContainer: {
    padding: 8,
    width: 200,
  },
  calloutTitulo: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  calloutTexto: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  calloutBoton: {
    color: "#0066CC",
    fontWeight: "bold",
    fontSize: 13,
  },

  botonesNavegacion: {
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },

  botonNavegacion: {
    backgroundColor: "#7A5C3E",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    minWidth: 75,
    alignItems: "center",
  },

  textoBotonNavegacion: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
