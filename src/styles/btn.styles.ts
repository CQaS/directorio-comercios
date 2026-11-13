import { StyleSheet } from "react-native";

export const btnStyles = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  botonPresionado: {
    backgroundColor: "#E2E8F0",
    opacity: 0.8,
  },
  flecha: {
    fontSize: 16,
    color: "#0B3A5D",
    fontWeight: "bold",
  },
  texto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B3A5D",
  },
});
