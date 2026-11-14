import { StyleSheet } from "react-native";

export const tabsIndexStyles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  encabezado: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B3A5D",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 10,
  },
  avisoOffline: {
    color: "#854D0E",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 13,
  },
  estadoSinDatos: {
    alignItems: "center",
    padding: 20,
  },
  textoSinDatos: {
    color: "#475569",
    textAlign: "center",
  },
  reintentar: {
    color: "#0B3A5D",
    fontWeight: "bold",
    marginTop: 10,
  },
  inputBuscador: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: "#0F172A",
  },
  contenedorChips: {
    marginVertical: 6,
  },
  listaChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  chipActivo: {
    backgroundColor: "#0B3A5D",
    borderColor: "#0B3A5D",
  },
  textoChip: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  textoChipActivo: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  listaComercios: {
    padding: 16,
    gap: 12,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  tarjetaAncha: {
    marginHorizontal: 6,
  },
  tarjetaPresionada: {
    opacity: 0.85,
  },
  tarjetaCabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nombreComercio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
  },
  direccion: {
    fontSize: 13,
    color: "#64748B",
  },
  rubro: {
    fontSize: 12,
    color: "#0B3A5D",
    fontWeight: "600",
    marginTop: 6,
  },
  badgeEstado: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAbierto: {
    backgroundColor: "#DCFCE7",
  },
  badgeCerrado: {
    backgroundColor: "#FEE2E2",
  },
  textoBadge: {
    fontSize: 11,
    fontWeight: "bold",
  },
  textoAbierto: {
    color: "#166534",
  },
  textoCerrado: {
    color: "#991B1B",
  },
});
